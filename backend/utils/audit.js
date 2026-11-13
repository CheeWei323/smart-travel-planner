const AuditLog = require("../models/AuditLog");

// Saves one security event. details = { userId, email, success, note }
// Never throws, so a logging problem can't stop someone logging in.
const logEvent = async (req, action, details = {}) => {
  try {
    await AuditLog.create({
      action,
      userId: details.userId || req.user?.id || null,
      email: String(details.email || "").slice(0, 254),
      ip: req.ip || "",
      success: details.success !== false, // true unless you pass false
      details: String(details.note || "").slice(0, 300),
    });
  } catch (error) {
    console.error("Audit log failed:", error.message);
  }
};

module.exports = { logEvent };
