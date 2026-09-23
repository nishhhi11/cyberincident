const Incident = require("../models/Incident");
const { createAuditLog } = require("./auditController");

const getFingerprintPrefix = (category) => {
    const prefixes = {
        Phishing: "PHISH",
        Malware: "MALW",
        "Account/Security": "ACCT",
        "Suspicious Activity": "SUSP",
        "Network Issue": "NET"
    };

    return prefixes[category] || "OTHER";
};

const generateFingerprint = async (category) => {
    const prefix = getFingerprintPrefix(category);
    const year = new Date().getFullYear();

    let fingerprint;
    let exists = true;

    while (exists) {
        const uniquePart = Date.now().toString().slice(-8);
        fingerprint = `${prefix}-${year}-${uniquePart}`;
        exists = await Incident.exists({ fingerprint });
    }

    return fingerprint;
};

const calculatePriority = (impact, urgency) => {
    if (impact === "High" && urgency === "High") return "Critical";
    if (impact === "High" || urgency === "High") return "High";
    if (impact === "Medium" || urgency === "Medium") return "Medium";
    return "Low";
};

const calculateRiskLevel = calculatePriority;

const createIncident = async (req, res) => {
    try {
        const {
            title,
            category,
            description,
            location,
            impact,
            urgency
        } = req.body;

        const priority = calculatePriority(impact, urgency);

        const incident = await Incident.create({
            fingerprint: await generateFingerprint(category),
            title,
            category,
            description,
            location,
            impact,
            urgency,
            priority,
            riskLevel: calculateRiskLevel(impact, urgency),
            reportedBy: req.user.id
        });

        const Ticket = require("../models/Ticket");
        const getSlaHours = (priority) =>
            ({ Critical: 2, High: 6, Medium: 12, Low: 24 }[priority] || 24);

        const slaHours = getSlaHours(priority);
        const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

        const ticket = await Ticket.create({
            incident: incident._id,
            title: incident.title,
            priority: incident.priority,
            status: "Open",
            slaDeadline
        });

        await createAuditLog({
            user: req.user.id,
            action: "Incident Created",
            incident: incident._id,
            details: `Incident "${incident.title}" was created`
        });

        await createAuditLog({
            user: req.user.id,
            action: "Ticket Created",
            ticket: ticket._id,
            incident: incident._id,
            details: "Ticket automatically created for incident"
        });

        res.status(201).json({
            message: "Incident and Ticket created successfully",
            incident,
            ticket
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create incident",
            error: error.message
        });
    }
};

const getIncidents = async (req, res) => {
    try {
        const incidents = await Incident.find()
            .populate("reportedBy", "name email role")
            .sort({ createdAt: -1 });

        res.json(incidents);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get incidents",
            error: error.message
        });
    }
};

const getIncidentById = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id)
            .populate("reportedBy", "name email role");

        if (!incident) {
            return res.status(404).json({
                message: "Incident not found"
            });
        }

        res.json(incident);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get incident",
            error: error.message
        });
    }
};

const getSimilarIncidents = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);

        if (!incident) {
            return res.status(404).json({
                message: "Incident not found"
            });
        }

        const similarIncidents = await Incident.find({
            _id: { $ne: incident._id },
            category: incident.category,
            location: incident.location
        })
            .populate("reportedBy", "name email role")
            .sort({ createdAt: -1 });

        res.json({
            incident: incident.fingerprint,
            count: similarIncidents.length,
            similarIncidents
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to find similar incidents",
            error: error.message
        });
    }
};

const updateIncident = async (req, res) => {
    try {
        const {
            title,
            category,
            description,
            location,
            impact,
            urgency,
            status
        } = req.body;

        const incident = await Incident.findById(req.params.id);

        if (!incident) {
            return res.status(404).json({
                message: "Incident not found"
            });
        }

        if (title) incident.title = title;
        if (category) incident.category = category;
        if (description) incident.description = description;
        if (location) incident.location = location;
        if (impact) incident.impact = impact;
        if (urgency) incident.urgency = urgency;
        if (status) incident.status = status;

        if (impact || urgency) {
            const newImpact = impact || incident.impact;
            const newUrgency = urgency || incident.urgency;
            const priority = calculatePriority(newImpact, newUrgency);

            incident.priority = priority;
            incident.riskLevel = priority;
        }

        await incident.save();

        res.json({
            message: "Incident updated successfully",
            incident
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update incident",
            error: error.message
        });
    }
};

const deleteIncident = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);

        if (!incident) {
            return res.status(404).json({
                message: "Incident not found"
            });
        }

        await incident.deleteOne();

        res.json({
            message: "Incident deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete incident",
            error: error.message
        });
    }
};

const getIncidentStats = async (req, res) => {
    try {
        const stats = await Incident.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get incident statistics",
            error: error.message
        });
    }
};

module.exports = {
    createIncident,
    getIncidents,
    getIncidentById,
    getSimilarIncidents,
    updateIncident,
    deleteIncident,
    getIncidentStats
};