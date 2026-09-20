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

router.post(
    "/",
    protect,
    allowRoles("Employee", "Support Agent", "Security Analyst", "Admin"),
    createIncident
);

router.get(
    "/",
    protect,
    allowRoles("Employee", "Support Agent", "Security Analyst", "Admin"),
    getIncidents
);

router.get(
    "/stats",
    protect,
    allowRoles("Employee", "Support Agent", "Security Analyst", "Admin"),
    getIncidentStats
);

router.get(
    "/:id/similar",
    protect,
    allowRoles("Employee", "Support Agent", "Security Analyst", "Admin"),
    getSimilarIncidents
);

router.get(
    "/:id",
    protect,
    allowRoles("Employee", "Support Agent", "Security Analyst", "Admin"),
    getIncidentById
);

router.put(
    "/:id",
    protect,
    allowRoles("Support Agent", "Security Analyst", "Admin"),
    updateIncident
);

router.delete(
    "/:id",
    protect,
    allowRoles("Admin"),
    deleteIncident
);

module.exports = router;