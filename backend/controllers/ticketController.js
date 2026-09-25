const Ticket = require("../models/Ticket");
const AuditLog = require("../models/AuditLog");

const SLA_HOURS = {
    critical: 1,
    high: 4,
    medium: 8,
    low: 24,
};

const getSLADeadline = (priority) => {
    const hours = SLA_HOURS[priority] || 8;
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + hours);
    return deadline;
};

const createTicket = async (req, res) => {
    try {
        const { title, description, priority, category } = req.body;
        const slaDeadline = getSLADeadline(priority);

        const ticket = await Ticket.create({
            title,
            description,
            priority,
            category,
            reportedBy: req.user.id,
            slaDeadline,
        });

        await AuditLog.create({
            action: "TICKET_CREATED",
            performedBy: req.user.id,
            targetCollection: "tickets",
            targetId: ticket._id,
            details: { title, priority, category, slaDeadline },
        });

        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: "Failed to create ticket", error: error.message });
    }
};

const getTickets = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status, priority, category } = req.query;
        const skip = (page - 1) * limit;

        const filter = {};
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (category) filter.category = category;

        if (req.user.role === "employee") {
            filter.reportedBy = req.user.id;
        }

        const tickets = await Ticket.find(filter)
            .populate("reportedBy", "name email")
            .populate("assignedTo", "name email")
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });

        const total = await Ticket.countDocuments(filter);

        res.json({
            tickets,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch tickets", error: error.message });
    }
};

const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate("reportedBy", "name email")
            .populate("assignedTo", "name email");
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch ticket", error: error.message });
    }
};

const updateTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        await AuditLog.create({
            action: "TICKET_UPDATED",
            performedBy: req.user.id,
            targetCollection: "tickets",
            targetId: ticket._id,
            details: req.body,
        });

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: "Failed to update ticket", error: error.message });
    }
};

const assignTicket = async (req, res) => {
    try {
        const { assignedTo } = req.body;
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { assignedTo, status: "in_progress" },
            { new: true }
        ).populate("assignedTo", "name email");

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        await AuditLog.create({
            action: "TICKET_ASSIGNED",
            performedBy: req.user.id,
            targetCollection: "tickets",
            targetId: ticket._id,
            details: { assignedTo },
        });

        res.json({ message: "Ticket assigned successfully", ticket });
    } catch (error) {
        res.status(500).json({ message: "Failed to assign ticket", error: error.message });
    }
};

const escalateTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { status: "escalated", escalated: true },
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        await AuditLog.create({
            action: "TICKET_ESCALATED",
            performedBy: req.user.id,
            targetCollection: "tickets",
            targetId: ticket._id,
            details: { reason: req.body.reason || "Manually escalated" },
        });

        res.json({ message: "Ticket escalated successfully", ticket });
    } catch (error) {
        res.status(500).json({ message: "Failed to escalate ticket", error: error.message });
    }
};

const resolveTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { status: "resolved", resolvedAt: new Date() },
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        await AuditLog.create({
            action: "TICKET_RESOLVED",
            performedBy: req.user.id,
            targetCollection: "tickets",
            targetId: ticket._id,
            details: { resolvedAt: ticket.resolvedAt, resolution: req.body.resolution },
        });

        res.json({ message: "Ticket resolved successfully", ticket });
    } catch (error) {
        res.status(500).json({ message: "Failed to resolve ticket", error: error.message });
    }
};

const getTicketStats = async (req, res) => {
    try {
        const statusStats = await Ticket.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        const priorityStats = await Ticket.aggregate([
            { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]);

        res.json({ statusStats, priorityStats });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch ticket stats", error: error.message });
    }
};

const autoEscalateTickets = async () => {
    try {
        const now = new Date();
        const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000);

        const tickets = await Ticket.find({
            status: { $nin: ["resolved", "closed", "escalated"] },
            slaDeadline: { $lte: thirtyMinutesLater, $gte: now },
        });

        for (const ticket of tickets) {
            ticket.status = "escalated";
            ticket.escalated = true;
            await ticket.save();

            await AuditLog.create({
                action: "TICKET_AUTO_ESCALATED",
                targetCollection: "tickets",
                targetId: ticket._id,
                details: { slaDeadline: ticket.slaDeadline, autoEscalated: true },
            });

            console.log("Auto-escalated ticket: " + ticket._id + " - " + ticket.title);
        }
    } catch (error) {
        console.log("Auto-escalation error: " + error.message);
    }
};

module.exports = {
    createTicket,
    getTickets,
    getTicketById,
    updateTicket,
    assignTicket,
    escalateTicket,
    resolveTicket,
    getTicketStats,
    autoEscalateTickets,
};
