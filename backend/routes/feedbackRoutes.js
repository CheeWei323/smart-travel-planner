const express = require("express");
const router = express.Router();
const { protect, travelerOnly } = require("../middleware/authMiddleware");
router.use(protect, travelerOnly);
const {
  createFeedback,
  getMyFeedback,
  getActiveAnnouncements,
} = require("../controllers/feedbackController");

router.post("/", createFeedback);
router.get("/mine", getMyFeedback);
router.get("/announcements", getActiveAnnouncements);

module.exports = router;
