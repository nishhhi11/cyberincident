const Comment = require("../models/Comment");
const { createAuditLog } = require("./auditController");

const createComment = async (req, res) => {
    try {
        const { ticket, message } = req.body;

        const comment = await Comment.create({
            ticket,
            user: req.user.id,
            message
        });

        const savedComment = await Comment.findById(comment._id)
            .populate("user", "name email role");

        await createAuditLog({
            user: req.user.id,
            action: "Comment Added",
            ticket: ticket,
            details: `Comment added: ${message}`
        });

        res.status(201).json({
            message: "Comment added successfully",
            comment: savedComment
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to add comment",
            error: error.message
        });
    }
};

const getComments = async (req, res) => {
    try {
        const comments = await Comment.find({
            ticket: req.params.ticketId
        })
            .populate("user", "name email role")
            .sort({ createdAt: 1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get comments",
            error: error.message
        });
    }
};

module.exports = {
    createComment,
    getComments
};