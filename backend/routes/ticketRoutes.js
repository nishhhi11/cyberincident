const express = require("express");

const {
    createTicket,
    getTickets,
    assignTicket,
    updateTicketStatus,
    resolveTicket
} = require("../controllers/ticketController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createTicket);
router.get("/", protect, getTickets);
router.put("/:id/assign", protect, assignTicket);
router.put("/:id/status", protect, updateTicketStatus);
router.put("/:id/resolve", protect, resolveTicket);

module.exports = router;