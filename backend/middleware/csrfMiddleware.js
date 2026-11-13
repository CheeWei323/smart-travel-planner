const { allowedOrigins } = require("../config/security");
const { safeMethods, validCsrf } = require("../utils/cookieSession");

const checkOrigin = (req, res, next) => {
  let origin = req.get("Origin");
  if (!origin && req.get("Referer")) {
    try { origin = new URL(req.get("Referer")).origin; }
    catch { origin = "null"; }
  }
  // Non-browser API clients may omit Origin, but still need CSRF proof on writes.
  if (origin && !allowedOrigins.includes(origin))
    return res.status(403).json({ code: "ORIGIN_REJECTED", message: "Request origin is not allowed" });
  next();
};
const csrfProtection = (req, res, next) => {
  if (!safeMethods.has(req.method) && !validCsrf(req))
    return res.status(403).json({ code: "CSRF_INVALID",
      message: "Your security token is no longer valid. Refresh the page and try again." });
  next();
};
module.exports = { checkOrigin, csrfProtection };
