const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema({
    title: String,
    description: String,
    severity: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "medium",
    },
    status: {
        type: String,
        enum: ["reported", "investigating", "contained", "resolved"],
        default: "reported",
    },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ticketRef: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
    affectedSystems: [String],
    resolvedAt: Date,
}, { timestamps: true });

const Incident = mongoose.model("Incident", incidentSchema);
module.exports = Incident;
