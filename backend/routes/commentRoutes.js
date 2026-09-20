const express = require("express");

const {
    createComment,
    getComments
} = require("../controllers/commentController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    allowRoles("Support Agent", "Security Analyst", "Admin"),
    createComment
);

router.get(
    "/:ticketId",
    protect,
    allowRoles("Employee", "Support Agent", "Security Analyst", "Admin"),
    getComments
);

module.exports = router;