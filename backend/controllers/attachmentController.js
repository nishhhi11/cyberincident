const Attachment = require("../models/Attachment");
const { createAuditLog } = require("./auditController");

const uploadAttachment = async (req, res) => {
    try {
        const { ticket } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "File is required" });
        }

        const attachment = await Attachment.create({
            ticket,
            uploadedBy: req.user.id,
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype
        });

        await createAuditLog({
            user: req.user.id,
            action: "Attachment Uploaded",
            ticket,
            details: `Attachment uploaded: ${req.file.originalname}`
        });

        res.status(201).json({
            message: "Attachment uploaded successfully",
            attachment
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to upload attachment",
            error: error.message
        });
    }
};

const getAttachments = async (req, res) => {
    try {
        const attachments = await Attachment.find({
            ticket: req.params.ticketId
        })
            .populate("uploadedBy", "name email role")
            .sort({ createdAt: -1 });

        res.json(attachments);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get attachments",
            error: error.message
        });
    }
};

module.exports = {
    uploadAttachment,
    getAttachments
};