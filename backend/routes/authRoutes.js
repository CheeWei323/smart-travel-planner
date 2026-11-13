const express = require("express");
const rateLimit = require("express-rate-limit");
const { csrfBootstrap } = require("../utils/cookieSession");

const { protect } = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  deleteAccount,
  exportUserData,
} = require("../controllers/authController");

const router = express.Router();
router.get("/csrf", csrfBootstrap);

// Slow down brute-force attempts on login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  message: { message: "Too many attempts, please try again later" },
});

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/logout", protect, logoutUser);

router.get("/me", protect, getProfile);
router.get("/export", protect, exportUserData);

router.put("/profile", protect, updateProfile);
router.delete("/profile", protect, deleteAccount);

module.exports = router;