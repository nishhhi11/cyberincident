const Incident = require("../models/Incident");

const createIncident = async (req, res) => {
    try {
        const { title, category, description, location, impact, urgency } = req.body;

        let priority = "Low";

        if (impact === "High" && urgency === "High") {
            priority = "Critical";
        } else if (impact === "High" || urgency === "High") {
            priority = "High";
        } else if (impact === "Medium" || urgency === "Medium") {
            priority = "Medium";
        }

        const incident = await Incident.create({
            title,
            category,
            description,
            location,
            impact,
            urgency,
            priority,
            reportedBy: req.user.id
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

module.exports = {
    createIncident,
    getIncidents
};