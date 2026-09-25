const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const userRoutes = require("./routes/userRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const cron = require("node-cron");
const { autoEscalateTickets } = require("./controllers/ticketController");

const app = express();
connectDB();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
    res.send("Cybersecurity Incident & IT Service Management Platform API Running");
});
app.use("/auth", authRoutes);

app.use(authMiddleware);
app.use("/tickets", ticketRoutes);
app.use("/incidents", incidentRoutes);
app.use("/users", userRoutes);

cron.schedule("*/15 * * * *", () => {
    console.log("Running SLA escalation check...");
    autoEscalateTickets();
});

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});
