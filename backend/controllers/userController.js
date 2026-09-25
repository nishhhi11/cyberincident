const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user", error: error.message });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await AuditLog.create({
            action: "USER_ROLE_UPDATED",
            performedBy: req.user.id,
            targetCollection: "users",
            targetId: user._id,
            details: { newRole: role },
        });

        res.json({ message: "User role updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Failed to update user role", error: error.message });
    }
};

module.exports = { getAllUsers, getUserById, updateUserRole };
