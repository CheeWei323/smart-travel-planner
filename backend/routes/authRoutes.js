const express = require("express");
const rateLimit = require("express-rate-limit");

const { protect } = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  deleteAccount,
} = require("../controllers/authController");

const router = express.Router();

// Slow down brute-force attempts on login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  message: { message: "Too many attempts, please try again later" },
});

router.post("/register", authLimiter, registerUser);

router.post("/login", authLimiter, loginUser);

router.put("/profile", protect, updateProfile);
router.get("/me", protect, getProfile);

router.delete("/profile", protect, deleteAccount);

module.exports = router;
