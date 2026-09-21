const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
    {
        incident: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Incident",
            required: true
        },
        title: {
            type: String,
            required: true
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High", "Critical"],
            required: true
        },
        status: {
            type: String,
            enum: ["Open", "Assigned", "In Progress", "Resolved", "Escalated"],
            default: "Open"
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        slaDeadline: {
            type: Date,
            default: null
        },
        resolution: {
            type: String,
            default: null
        },
        resolvedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);