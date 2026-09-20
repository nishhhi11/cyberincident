const AuditLog = require("../models/AuditLog");

const createAuditLog = async ({
    user,
    action,
    ticket = null,
    incident = null,
    details = ""
}) => {
    try {
        await AuditLog.create({
            user,
            action,
            ticket,
            incident,
            details
        });
    } catch (error) {
        console.error("Audit log failed:", error.message);
    }
};

const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .populate("user", "name email role")
            .populate("ticket", "title status priority")
            .populate("incident", "title category")
            .sort({ createdAt: -1 });

        res.json(logs);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get audit logs",
            error: error.message
        });
    }
};

const getIncidentTimeline = async (req, res) => {
    try {
        const logs = await AuditLog.find({
            incident: req.params.incidentId
        })
            .populate("user", "name email role")
            .populate("ticket", "title status priority")
            .sort({ createdAt: 1 });

        res.json({
            incidentId: req.params.incidentId,
            timeline: logs
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to get incident timeline",
            error: error.message
        });
    }
};

module.exports = {
    createAuditLog,
    getAuditLogs,
    getIncidentTimeline
};