const express = require("express");

const {
    uploadAttachment,
    getAttachments
} = require("../controllers/attachmentController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    allowRoles(
        "Support Agent",
        "Security Analyst",
        "Admin"
    ),
    upload.single("file"),
    uploadAttachment
);

router.get(
    "/:ticketId",
    protect,
    allowRoles(
        "Employee",
        "Support Agent",
        "Security Analyst",
        "Admin"
    ),
    getAttachments
);

module.exports = router;