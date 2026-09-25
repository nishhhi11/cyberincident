const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
    title: String,
    description: String,
    priority: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "medium",
    },
    status: {
        type: String,
        enum: ["open", "in_progress", "escalated", "resolved", "closed"],
        default: "open",
    },
    category: {
        type: String,
        enum: ["IT", "security"],
        default: "IT",
    },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    slaDeadline: Date,
    escalated: { type: Boolean, default: false },
    resolvedAt: Date,
}, { timestamps: true });

const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;
