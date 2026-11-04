const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies the JWT and makes sure the account still exists and is not suspended
const protect = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("role isActive");

    if (!user) {
      return res.status(401).json({ message: "Account no longer exists" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Your account has been suspended" });
    }

    // Role is read from the database, never trusted from the token
    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Use after protect() on admin-only routes
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Admin access required" });
};

module.exports = { protect, adminOnly };
