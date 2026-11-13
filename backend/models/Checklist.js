const mongoose = require("mongoose");

const checklistSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      immutable: true,
      ref: "User",
      required: true,
    },
    task: {
      type: String,
      trim: true,
      maxlength: 300,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Checklist", checklistSchema);
