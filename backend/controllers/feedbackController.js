const Feedback = require("../models/Feedback");
const Announcement = require("../models/Announcement");
const { fields, text, fail } = require("../utils/validation");
const createFeedback = async (req, res) => {
  fields(req.body, ["category", "subject", "message"]);
  const category = req.body.category || "other";
  if (!["bug", "suggestion", "other"].includes(category))
    fail("Invalid feedback category");
  res
    .status(201)
    .json(
      await Feedback.create({
        userId: req.user.id,
        category,
        subject: text(req.body.subject, "Subject", 120),
        message: text(req.body.message, "Message", 2000),
      }),
    );
};
const getMyFeedback = async (req, res) =>
  res.json(
    await Feedback.find({ userId: req.user.id }).sort({ createdAt: -1 }),
  );
const getActiveAnnouncements = async (_req, res) =>
  res.json(
    await Announcement.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5),
  );
module.exports = { createFeedback, getMyFeedback, getActiveAnnouncements };
