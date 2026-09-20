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

router.post(
    "/",
    protect,
    allowRoles(
        "Support Agent",
        "Security Analyst",
        "Admin"
    ),
    createTicket
);

router.get(
    "/",
    protect,
    allowRoles(
        "Employee",
        "Support Agent",
        "Security Analyst",
        "Admin"
    ),
    getTickets
);

router.put(
    "/:id/assign",
    protect,
    allowRoles(
        "Support Agent",
        "Security Analyst",
        "Admin"
    ),
    assignTicket
);

router.put(
    "/:id/status",
    protect,
    allowRoles(
        "Support Agent",
        "Security Analyst",
        "Admin"
    ),
    updateTicketStatus
);

router.put(
    "/:id/resolve",
    protect,
    allowRoles(
        "Support Agent",
        "Security Analyst",
        "Admin"
    ),
    resolveTicket
);

module.exports = router;