const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/cybersecurity_itsm_db");
        console.log("MongoDB Connected Successfully to Compass/Local Instance!");
    } catch (error) {
        console.log("Database connection failed: " + error.message);
    }
};

module.exports = connectDB;
