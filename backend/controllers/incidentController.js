const Incident = require("../models/Incident");
const AuditLog = require("../models/AuditLog");

const reportIncident = async (req, res) => {
    try {
        const { title, description, severity, affectedSystems, ticketRef } = req.body;
        const incident = await Incident.create({
            title,
            description,
            severity,
            affectedSystems,
            ticketRef,
            reportedBy: req.user.id,
        });

        await AuditLog.create({
            action: "INCIDENT_REPORTED",
            performedBy: req.user.id,
            targetCollection: "incidents",
            targetId: incident._id,
            details: { title, severity, affectedSystems },
        });

        res.status(201).json(incident);
    } catch (error) {
        res.status(500).json({ message: "Failed to report incident", error: error.message });
    }
};

const getIncidents = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status, severity } = req.query;
        const skip = (page - 1) * limit;

        const filter = {};
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        if (status) filter.status = status;
        if (severity) filter.severity = severity;

        if (req.user.role === "employee") {
            filter.reportedBy = req.user.id;
        }

        const incidents = await Incident.find(filter)
            .populate("reportedBy", "name email")
            .populate("assignedTo", "name email")
            .populate("ticketRef", "title status")
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });

        const total = await Incident.countDocuments(filter);

        res.json({
            incidents,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch incidents", error: error.message });
    }
};

const getIncidentById = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id)
            .populate("reportedBy", "name email")
            .populate("assignedTo", "name email")
            .populate("ticketRef", "title status priority");
        if (!incident) {
            return res.status(404).json({ message: "Incident not found" });
        }
        res.json(incident);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch incident", error: error.message });
    }
};

const updateIncident = async (req, res) => {
    try {
        const incident = await Incident.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!incident) {
            return res.status(404).json({ message: "Incident not found" });
        }

        await AuditLog.create({
            action: "INCIDENT_UPDATED",
            performedBy: req.user.id,
            targetCollection: "incidents",
            targetId: incident._id,
            details: req.body,
        });

        res.json(incident);
    } catch (error) {
        res.status(500).json({ message: "Failed to update incident", error: error.message });
    }
};

const assignIncident = async (req, res) => {
    try {
        const { assignedTo } = req.body;
        const incident = await Incident.findByIdAndUpdate(
            req.params.id,
            { assignedTo, status: "investigating" },
            { new: true }
        ).populate("assignedTo", "name email");

        if (!incident) {
            return res.status(404).json({ message: "Incident not found" });
        }

        await AuditLog.create({
            action: "INCIDENT_ASSIGNED",
            performedBy: req.user.id,
            targetCollection: "incidents",
            targetId: incident._id,
            details: { assignedTo },
        });

        res.json({ message: "Incident assigned successfully", incident });
    } catch (error) {
        res.status(500).json({ message: "Failed to assign incident", error: error.message });
    }
};

const resolveIncident = async (req, res) => {
    try {
        const incident = await Incident.findByIdAndUpdate(
            req.params.id,
            { status: "resolved", resolvedAt: new Date() },
            { new: true }
        );

        if (!incident) {
            return res.status(404).json({ message: "Incident not found" });
        }

        await AuditLog.create({
            action: "INCIDENT_RESOLVED",
            performedBy: req.user.id,
            targetCollection: "incidents",
            targetId: incident._id,
            details: { resolvedAt: incident.resolvedAt, resolution: req.body.resolution },
        });

        res.json({ message: "Incident resolved successfully", incident });
    } catch (error) {
        res.status(500).json({ message: "Failed to resolve incident", error: error.message });
    }
};

const getIncidentStats = async (req, res) => {
    try {
        const statusStats = await Incident.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        const severityStats = await Incident.aggregate([
            { $group: { _id: "$severity", count: { $sum: 1 } } },
        ]);

        res.json({ statusStats, severityStats });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch incident stats", error: error.message });
    }
};

module.exports = {
    reportIncident,
    getIncidents,
    getIncidentById,
    updateIncident,
    assignIncident,
    resolveIncident,
    getIncidentStats,
};
