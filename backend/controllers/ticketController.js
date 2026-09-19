const Ticket = require("../models/Ticket");
const Incident = require("../models/Incident");
const User = require("../models/User");

const createTicket = async (req, res) => {
    try {
        const { incidentId } = req.body;

        const incident = await Incident.findById(incidentId);

        if (!incident) {
            return res.status(404).json({
                message: "Incident not found"
            });
        }

        const ticket = await Ticket.create({
            incident: incident._id,
            title: incident.title,
            priority: incident.priority,
            status: "Open"
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
        const tickets = await Ticket.find()
            .populate("incident")
            .populate("assignedTo", "name email role")
            .sort({ createdAt: -1 });

        res.json(tickets);
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

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (
            user.role !== "Support Agent" &&
            user.role !== "Security Analyst"
        ) {
            return res.status(400).json({
                message: "User cannot be assigned to a ticket"
            });
        }

        ticket.assignedTo = user._id;
        ticket.status = "Assigned";

        await ticket.save();

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

module.exports = {
    createTicket,
    getTickets,
    assignTicket
};