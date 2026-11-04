const Feedback = require("../models/Feedback");
const Announcement = require("../models/Announcement");

// USER: submit feedback / bug report
const createFeedback = async (req, res) => {
  try {
    const { category, subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required" });
    }
    const item = await Feedback.create({ userId: req.user.id, category, subject, message });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// USER: see own feedback and any admin reply
const getMyFeedback = async (req, res) => {
  try {
    res.json(await Feedback.find({ userId: req.user.id }).sort({ createdAt: -1 }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// USER: active announcements (shown on the dashboard)
const getActiveAnnouncements = async (req, res) => {
  try {
    res.json(await Announcement.find({ isActive: true }).sort({ createdAt: -1 }).limit(5));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createFeedback, getMyFeedback, getActiveAnnouncements };
