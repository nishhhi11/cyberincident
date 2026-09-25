const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema({
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
    incidentId: { type: mongoose.Schema.Types.ObjectId, ref: "Incident" },
}, { timestamps: true });

const Attachment = mongoose.model("Attachment", attachmentSchema);
module.exports = Attachment;
