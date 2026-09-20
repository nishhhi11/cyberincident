const Incident = require("../models/Incident");
const { createAuditLog } = require("./auditController");

const getFingerprintPrefix = (category) => {
    if (category === "Phishing") {
        return "PHISH";
    }

    if (category === "Malware") {
        return "MALW";
    }

    if (category === "Account/Security") {
        return "ACCT";
    }

    if (category === "Suspicious Activity") {
        return "SUSP";
    }

    if (category === "Network Issue") {
        return "NET";
    }

    return "OTHER";
};

const generateFingerprint = async (category) => {
    const prefix = getFingerprintPrefix(category);
    const year = new Date().getFullYear().toString().slice(-2);

    const count = await Incident.countDocuments({
        category
    });

    const number = String(count + 1).padStart(3, "0");

    return `${prefix}-${year}-${number}`;
};

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

        let priority = "Low";

        if (impact === "High" && urgency === "High") {
            priority = "Critical";
        } else if (impact === "High" || urgency === "High") {
            priority = "High";
        } else if (impact === "Medium" || urgency === "Medium") {
            priority = "Medium";
        }

        const fingerprint = await generateFingerprint(category);

        const incident = await Incident.create({
            fingerprint,
            title,
            category,
            description,
            location,
            impact,
            urgency,
            priority,
            reportedBy: req.user.id
        });

        await createAuditLog({
            user: req.user.id,
            action: "Incident Created",
            incident: incident._id,
            details: `Incident "${incident.title}" was created`
        });

        res.status(201).json({
            message: "Incident created successfully",
            incident
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

            if (newImpact === "High" && newUrgency === "High") {
                incident.priority = "Critical";
            } else if (newImpact === "High" || newUrgency === "High") {
                incident.priority = "High";
            } else if (
                newImpact === "Medium" ||
                newUrgency === "Medium"
            ) {
                incident.priority = "Medium";
            } else {
                incident.priority = "Low";
            }
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
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
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