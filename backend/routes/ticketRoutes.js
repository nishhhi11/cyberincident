const express = require("express");
const {
    createTicket,
    getTickets,
    getTicketById,
    updateTicket,
    assignTicket,
    escalateTicket,
    resolveTicket,
    getTicketStats,
} = require("../controllers/ticketController");
const { addComment, getComments } = require("../controllers/commentController");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const Attachment = require("../models/Attachment");
const AuditLog = require("../models/AuditLog");

const router = express.Router();

router.post("/", createTicket);
router.get("/", getTickets);
router.get("/stats", roleMiddleware("admin", "security_analyst"), getTicketStats);
router.get("/:id", getTicketById);
router.put("/:id", roleMiddleware("support_agent", "security_analyst", "admin"), updateTicket);
router.put("/:id/assign", roleMiddleware("support_agent", "security_analyst", "admin"), assignTicket);
router.put("/:id/escalate", roleMiddleware("security_analyst", "admin"), escalateTicket);
router.put("/:id/resolve", roleMiddleware("support_agent", "security_analyst", "admin"), resolveTicket);

router.post("/:id/comments", async (req, res) => {
    req.body.ticketId = req.params.id;
    await addComment(req, res);
});
router.get("/:id/comments", async (req, res) => {
    req.query.ticketId = req.params.id;
    await getComments(req, res);
});

router.post("/:id/attachments", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const attachment = await Attachment.create({
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: req.file.path,
            mimetype: req.file.mimetype,
            size: req.file.size,
            uploadedBy: req.user.id,
            ticketId: req.params.id,
        });

        await AuditLog.create({
            action: "ATTACHMENT_UPLOADED",
            performedBy: req.user.id,
            targetCollection: "attachments",
            targetId: attachment._id,
            details: { ticketId: req.params.id, filename: req.file.originalname },
        });

        res.status(201).json(attachment);
    } catch (error) {
        res.status(500).json({ message: "Failed to upload attachment", error: error.message });
    }
});

module.exports = router;
