const express = require("express");

const {
    uploadAttachment,
    getAttachments
} = require("../controllers/attachmentController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    upload.single("file"),
    uploadAttachment
);

router.get(
    "/:ticketId",
    protect,
    getAttachments
);

module.exports = router;