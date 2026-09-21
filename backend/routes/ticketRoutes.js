const express = require("express");

const {
    createTicket,
    getTickets,
    assignTicket,
    updateTicketStatus,
    resolveTicket
} = require("../controllers/ticketController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

const staffRoles = allowRoles(
    "Support Agent",
    "Security Analyst",
    "Admin"
);

router.post("/", protect, staffRoles, createTicket);

router.get(
    "/",
    protect,
    allowRoles("Employee", "Support Agent", "Security Analyst", "Admin"),
    getTickets
);

router.put("/:id/assign", protect, staffRoles, assignTicket);
router.put("/:id/status", protect, staffRoles, updateTicketStatus);
router.put("/:id/resolve", protect, staffRoles, resolveTicket);

module.exports = router;