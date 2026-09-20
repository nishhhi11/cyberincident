const express = require("express");

const {
    createIncident,
    getIncidents,
    getIncidentById,
    updateIncident,
    deleteIncident,
    getIncidentStats
} = require("../controllers/incidentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createIncident);
router.get("/", protect, getIncidents);
router.get("/stats", protect, getIncidentStats);
router.get("/:id", protect, getIncidentById);
router.put("/:id", protect, updateIncident);
router.delete("/:id", protect, deleteIncident);

module.exports = router;