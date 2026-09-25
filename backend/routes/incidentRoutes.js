const express = require("express");
const {
    reportIncident,
    getIncidents,
    getIncidentById,
    updateIncident,
    assignIncident,
    resolveIncident,
    getIncidentStats,
} = require("../controllers/incidentController");
const { addComment, getComments } = require("../controllers/commentController");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const Attachment = require("../models/Attachment");
const AuditLog = require("../models/AuditLog");

const router = express.Router();

router.post("/", reportIncident);
router.get("/", getIncidents);
router.get("/stats", roleMiddleware("admin", "security_analyst"), getIncidentStats);
router.get("/:id", getIncidentById);
router.put("/:id", roleMiddleware("security_analyst", "admin"), updateIncident);
router.put("/:id/assign", roleMiddleware("security_analyst", "admin"), assignIncident);
router.put("/:id/resolve", roleMiddleware("security_analyst", "admin"), resolveIncident);

router.post("/:id/comments", async (req, res) => {
    req.body.incidentId = req.params.id;
    await addComment(req, res);
});
router.get("/:id/comments", async (req, res) => {
    req.query.incidentId = req.params.id;
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
            incidentId: req.params.id,
        });

        await AuditLog.create({
            action: "ATTACHMENT_UPLOADED",
            performedBy: req.user.id,
            targetCollection: "attachments",
            targetId: attachment._id,
            details: { incidentId: req.params.id, filename: req.file.originalname },
        });

        res.status(201).json(attachment);
    } catch (error) {
        res.status(500).json({ message: "Failed to upload attachment", error: error.message });
    }
});

module.exports = router;
