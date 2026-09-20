const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const commentRoutes = require("./routes/commentRoutes");
const attachmentRoutes = require("./routes/attachmentRoutes");

const protect = require("./middleware/authMiddleware");
const allowRoles = require("./middleware/roleMiddleware");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/attachments", attachmentRoutes);

app.get("/", (req, res) => {
    res.send("CyberIncident Backend Running");
});

app.get(
    "/api/test",
    protect,
    allowRoles(
        "Employee",
        "Support Agent",
        "Security Analyst",
        "Admin"
    ),
    (req, res) => {
        res.json({
            message: "Protected route working",
            user: req.user
        });
    }
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});