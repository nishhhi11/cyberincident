const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    content: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: "Incident" },
}, { timestamps: true });

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
