const express = require("express");

const {
  registerUser,
  loginUser,
  getAssignableUsers
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get(
  "/assignable-users",
  protect,
  allowRoles(
    "Support Agent",
    "Security Analyst",
    "Admin"
  ),
  getAssignableUsers
);

module.exports = router;