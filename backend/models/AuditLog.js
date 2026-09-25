const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
    action: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    targetCollection: String,
    targetId: mongoose.Schema.Types.ObjectId,
    details: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
module.exports = AuditLog;
