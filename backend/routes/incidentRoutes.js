const express = require("express");
const {
    createIncident,
    getIncidents
} = require("../controllers/incidentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createIncident);
router.get("/", protect, getIncidents);

module.exports = router;