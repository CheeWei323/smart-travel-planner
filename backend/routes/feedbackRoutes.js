const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { createFeedback, getMyFeedback, getActiveAnnouncements } = require("../controllers/feedbackController");

router.post("/", protect, createFeedback);
router.get("/mine", protect, getMyFeedback);
router.get("/announcements", protect, getActiveAnnouncements);

module.exports = router;
