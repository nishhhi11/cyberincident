const express = require("express");

const {
    createIncident,
    getIncidents,
    getIncidentById,
    getSimilarIncidents,
    updateIncident,
    deleteIncident,
    getIncidentStats
} = require("../controllers/incidentController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();
const allRoles = allowRoles(
    "Employee",
    "Support Agent",
    "Security Analyst",
    "Admin"
);

router.post("/", protect, allRoles, createIncident);
router.get("/", protect, allRoles, getIncidents);
router.get("/stats", protect, allRoles, getIncidentStats);
router.get("/:id/similar", protect, allRoles, getSimilarIncidents);
router.get("/:id", protect, allRoles, getIncidentById);

router.put(
    "/:id",
    protect,
    allowRoles("Support Agent", "Security Analyst", "Admin"),
    updateIncident
);

router.delete("/:id", protect, allowRoles("Admin"), deleteIncident);

module.exports = router;