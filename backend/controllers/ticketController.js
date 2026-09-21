const Ticket = require("../models/Ticket");
const Incident = require("../models/Incident");
const User = require("../models/User");
const { createAuditLog } = require("./auditController");

const getSlaHours = (priority) =>
    ({ Critical: 2, High: 6, Medium: 12, Low: 24 }[priority] || 24);

const findTicket = async (id, res) => {
    const ticket = await Ticket.findById(id);

    if (!ticket) {
        res.status(404).json({ message: "Ticket not found" });
        return null;
    }

    return ticket;
};

const syncIncidentStatus = (ticket, status) =>
    Incident.findByIdAndUpdate(ticket.incident, { status });

const createTicket = async (req, res) => {
    try {
        const { incidentId } = req.body;
        const incident = await Incident.findById(incidentId);

        if (!incident) {
            return res.status(404).json({ message: "Incident not found" });
        }

        if (await Ticket.findOne({ incident: incident._id })) {
            return res.status(400).json({
                message: "A ticket already exists for this incident"
            });
        }

        const slaHours = getSlaHours(incident.priority);
        const slaDeadline = new Date(
            Date.now() + slaHours * 60 * 60 * 1000
        );

        const ticket = await Ticket.create({
            incident: incident._id,
            title: incident.title,
            priority: incident.priority,
            status: "Open",
            slaDeadline
        });

        incident.status = "Assigned";
        await incident.save();

        await createAuditLog({
            user: req.user.id,
            action: "Ticket Created",
            ticket: ticket._id,
            incident: incident._id,
            details: "Ticket created for incident"
        });

        res.status(201).json({
            message: "Ticket created successfully",
            ticket
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create ticket",
            error: error.message
        });
    }
};

const getTickets = async (req, res) => {
    try {
        const { search, page = 1, limit = 5 } = req.query;
        const currentPage = Number(page);
        const itemsPerPage = Number(limit);
        const skip = (currentPage - 1) * itemsPerPage;
        const filter = search
            ? { title: { $regex: search, $options: "i" } }
            : {};

        const totalTickets = await Ticket.countDocuments(filter);

        const tickets = await Ticket.find(filter)
            .populate("incident")
            .populate("assignedTo", "name email role")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(itemsPerPage);

        res.json({
            tickets,
            currentPage,
            totalPages: Math.ceil(totalTickets / itemsPerPage),
            totalTickets
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to get tickets",
            error: error.message
        });
    }
};

const assignTicket = async (req, res) => {
    try {
        const { userId } = req.body;
        const ticket = await findTicket(req.params.id, res);

        if (!ticket) return;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!["Support Agent", "Security Analyst"].includes(user.role)) {
            return res.status(400).json({
                message: "User cannot be assigned to a ticket"
            });
        }

        ticket.assignedTo = user._id;
        ticket.status = "Assigned";
        await ticket.save();
        await syncIncidentStatus(ticket, "Assigned");

        await createAuditLog({
            user: req.user.id,
            action: "Ticket Assigned",
            ticket: ticket._id,
            incident: ticket.incident,
            details: `Ticket assigned to ${user.name}`
        });

        res.json({
            message: "Ticket assigned successfully",
            ticket
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to assign ticket",
            error: error.message
        });
    }
};

const updateTicketStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const allowedStatuses = [
            "Open",
            "Assigned",
            "In Progress",
            "Resolved",
            "Escalated"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid ticket status"
            });
        }

        const ticket = await findTicket(req.params.id, res);

        if (!ticket) return;

        const oldStatus = ticket.status;
        ticket.status = status;

        await ticket.save();
        await syncIncidentStatus(ticket, status);

        await createAuditLog({
            user: req.user.id,
            action: "Ticket Status Changed",
            ticket: ticket._id,
            incident: ticket.incident,
            details: `Status changed from ${oldStatus} to ${status}`
        });

        res.json({
            message: "Ticket status updated successfully",
            ticket
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update ticket status",
            error: error.message
        });
    }
};

const resolveTicket = async (req, res) => {
    try {
        const { resolution } = req.body;

        if (!resolution) {
            return res.status(400).json({
                message: "Resolution is required"
            });
        }

        const ticket = await findTicket(req.params.id, res);

        if (!ticket) return;

        ticket.status = "Resolved";
        ticket.resolution = resolution;
        ticket.resolvedAt = new Date();

        await ticket.save();
        await syncIncidentStatus(ticket, "Resolved");

        await createAuditLog({
            user: req.user.id,
            action: "Ticket Resolved",
            ticket: ticket._id,
            incident: ticket.incident,
            details: `Ticket resolved: ${resolution}`
        });

        res.json({
            message: "Ticket resolved successfully",
            ticket
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to resolve ticket",
            error: error.message
        });
    }
};

module.exports = {
    createTicket,
    getTickets,
    assignTicket,
    updateTicketStatus,
    resolveTicket
};