const express = require("express");

const {
    createTicket,
    getTickets,
    assignTicket
} = require("../controllers/ticketController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createTicket);
router.get("/", protect, getTickets);
router.put("/:id/assign", protect, assignTicket);

module.exports = router;