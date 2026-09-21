const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        action: {
            type: String,
            required: true
        },
        ticket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ticket",
            default: null
        },
        incident: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Incident",
            default: null
        },
        details: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);