const User = require("../models/User");
const { readSessionCookie, verifySession } = require("../utils/cookieSession");
const {
  SESSION_ENDED_MESSAGE,
  validTokenVersion,
} = require("../utils/sessionSecurity");

// Verifies the JWT and makes sure the account still exists and is not suspended
const protect = async (req, res, next) => {
  try {
    const token = readSessionCookie(req);
    if (!token) return res.status(401).json({ message: "Not authorized, no session" });
    const decoded = verifySession(token);

    const user = await User.findById(decoded.id).select("role isActive +tokenVersion");

    if (!user) {
      return res.status(401).json({ message: "Account no longer exists" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Your account has been suspended" });
    }

    if (!validTokenVersion(user.tokenVersion) || decoded.tokenVersion !== user.tokenVersion)
      return res.status(401).json({ message: SESSION_ENDED_MESSAGE });

    // Role is read from the database, never trusted from the token
    req.user = { id: user._id.toString(), role: user.role, tokenVersion: user.tokenVersion };
    req.auth = { token, claims: decoded };
    next();
  } catch (error) {
    return res.status(401).json({ message: SESSION_ENDED_MESSAGE });
  }
};

// Use after protect() on admin-only routes
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Admin access required" });
};

// Personal travel actions belong to traveler accounts, not the admin portal.
const travelerOnly = (req, res, next) => {
  if (req.user?.role === "user") return next();
  return res
    .status(403)
    .json({
      message:
        "Personal travel features are available to traveler accounts only",
    });
};
module.exports = { protect, adminOnly, travelerOnly };
