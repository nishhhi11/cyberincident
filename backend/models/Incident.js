const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
    {
        fingerprint: {
            type: String,
            unique: true,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true,
            enum: [
                "Phishing",
                "Malware",
                "Account/Security",
                "Suspicious Activity",
                "Network Issue",
                "Other"
            ]
        },
        description: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        impact: {
            type: String,
            required: true,
            enum: ["Low", "Medium", "High"]
        },
        urgency: {
            type: String,
            required: true,
            enum: ["Low", "Medium", "High"]
        },
        priority: {
            type: String,
            default: "Low",
            enum: ["Low", "Medium", "High", "Critical"]
        },
        riskLevel: {
            type: String,
            default: "Low",
            enum: ["Low", "Medium", "High", "Critical"]
        },
        status: {
            type: String,
            default: "Open",
            enum: [
                "Open",
                "Assigned",
                "In Progress",
                "Resolved",
                "Escalated"
            ]
        },
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Incident", incidentSchema);