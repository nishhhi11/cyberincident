const express = require("express");

const {
    getAuditLogs,
    getIncidentTimeline
} = require("../controllers/auditController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    allowRoles("Support Agent", "Security Analyst", "Admin"),
    getAuditLogs
);

router.get(
    "/incident/:incidentId",
    protect,
    allowRoles("Employee", "Support Agent", "Security Analyst", "Admin"),
    getIncidentTimeline
);

module.exports = router;