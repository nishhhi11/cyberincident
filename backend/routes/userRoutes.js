const express = require("express");
const { getAllUsers, getUserById, updateUserRole } = require("../controllers/userController");
const roleMiddleware = require("../middleware/roleMiddleware");
const AuditLog = require("../models/AuditLog");

const router = express.Router();

router.get("/", roleMiddleware("admin"), getAllUsers);

router.get("/audit-logs", roleMiddleware("admin"), async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;
        const logs = await AuditLog.find()
            .populate("performedBy", "name email role")
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await AuditLog.countDocuments();
        res.json({
            logs,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch audit logs", error: error.message });
    }
});

router.get("/:id", getUserById);
router.put("/:id/role", roleMiddleware("admin"), updateUserRole);

module.exports = router;
