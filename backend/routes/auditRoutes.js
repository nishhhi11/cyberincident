const express = require("express");

const {
    getAuditLogs
} = require("../controllers/auditController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    allowRoles(
        "Support Agent",
        "Security Analyst",
        "Admin"
    ),
    getAuditLogs
);

module.exports = router;