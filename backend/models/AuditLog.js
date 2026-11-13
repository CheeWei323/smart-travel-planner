const mongoose = require("mongoose");

// One security event, e.g. a failed login or an admin suspending a user
const auditLogSchema = new mongoose.Schema({
  time: { type: Date, default: Date.now },
  // Who did it: the person logging in, or the admin making a change
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  // Which account it is about (for admin actions: the account that was changed)
  email: { type: String, default: "" },
  action: { type: String, required: true },
  ip: { type: String, default: "" },
  success: { type: Boolean, required: true },
  details: { type: String, default: "" }, // short note, never a password
});

// Newest-first lookups stay fast as the log grows
auditLogSchema.index({ time: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
