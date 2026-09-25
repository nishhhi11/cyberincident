const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: {
        type: String,
        enum: ["employee", "support_agent", "security_analyst", "admin"],
        default: "employee",
    },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
