const Comment = require("../models/Comment");
const AuditLog = require("../models/AuditLog");

const addComment = async (req, res) => {
    try {
        const { content, ticketId, incidentId } = req.body;
        const comment = await Comment.create({
            content,
            author: req.user.id,
            ticketId,
            incidentId,
        });

        await AuditLog.create({
            action: "COMMENT_ADDED",
            performedBy: req.user.id,
            targetCollection: "comments",
            targetId: comment._id,
            details: { content, ticketId, incidentId },
        });

        const populated = await Comment.findById(comment._id).populate("author", "name email role");
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: "Failed to add comment", error: error.message });
    }
};

const getComments = async (req, res) => {
    try {
        const { ticketId, incidentId } = req.query;
        const filter = {};
        if (ticketId) filter.ticketId = ticketId;
        if (incidentId) filter.incidentId = incidentId;

        const comments = await Comment.find(filter)
            .populate("author", "name email role")
            .sort({ createdAt: 1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch comments", error: error.message });
    }
};

module.exports = { addComment, getComments };
