const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, enum: ["bug", "suggestion", "other"], default: "other" },
    subject: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: ["open", "reviewed", "resolved"], default: "open" },
    adminReply: { type: String, default: "", trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
