const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const { secureCookies, sessionCookieName, csrfCookieName } = require("../config/security");
const { SESSION_SECONDS, validTokenVersion } = require("./sessionSecurity");

const cookieOptions = { httpOnly: true, secure: secureCookies, sameSite: "lax", path: "/" };
const COOKIE_AUDIENCE = "travelwise-cookie-session";
const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

// These cookies contain only JWT/base64url or hex values. Reject duplicates and
// alternate encodings instead of choosing an attacker-controlled representation.
const readCookie = (req, name) => {
  const values = String(req.headers.cookie || "").split(";").map((part) => part.trim())
    .filter((part) => part.startsWith(`${name}=`));
  if (values.length > 1) throw new Error("Duplicate security cookie");
  return values.length ? values[0].slice(name.length + 1) : "";
};
const readSessionCookie = (req) => readCookie(req, sessionCookieName);
const verifySession = (token) => {
  if (typeof token !== "string" || token.length > 2048 || !/^[A-Za-z0-9_.-]+$/.test(token))
    throw new Error("Invalid session cookie");
  const decoded = jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ["HS256"], audience: COOKIE_AUDIENCE, maxAge: SESSION_SECONDS,
  });
  if (!validTokenVersion(decoded.tokenVersion) || !Number.isSafeInteger(decoded.exp) ||
      !Number.isSafeInteger(decoded.iat) || typeof decoded.jti !== "string" || !/^[a-f0-9]{32}$/.test(decoded.jti))
    throw new Error("Invalid cookie session claims");
  return decoded;
};
const createSession = (account) => {
  const token = jwt.sign(
    { id: account._id, tokenVersion: account.tokenVersion }, process.env.JWT_SECRET,
    { algorithm: "HS256", expiresIn: SESSION_SECONDS, audience: COOKIE_AUDIENCE,
      jwtid: crypto.randomBytes(16).toString("hex") },
  );
  return { token, claims: verifySession(token) };
};
const sessionDetails = (claims) => ({ sessionId: claims.jti, expiresAt: claims.exp * 1000 });
const setSessionCookie = (res, token, claims) =>
  res.cookie(sessionCookieName, token, { ...cookieOptions, expires: new Date(claims.exp * 1000) });
const clearSessionCookie = (res) => res.clearCookie(sessionCookieName, cookieOptions);
const csrfDigest = (nonce, token) => crypto.createHmac("sha256", process.env.JWT_SECRET)
  .update("travelwise-csrf-v1\0").update(nonce).update("\0").update(token || "anonymous").digest("hex");
const csrfDetails = (req, res, token = readSessionCookie(req)) => {
  let nonce = readCookie(req, csrfCookieName);
  if (!/^[a-f0-9]{64}$/.test(nonce)) {
    nonce = crypto.randomBytes(32).toString("hex");
    // A non-authenticating browser-session nonce. Reuse it to avoid tab races.
    res.cookie(csrfCookieName, nonce, cookieOptions);
  }
  return { csrfToken: csrfDigest(nonce, token) };
};
const validCsrf = (req) => {
  try {
    const nonce = readCookie(req, csrfCookieName);
    const supplied = req.get("X-CSRF-Token");
    if (!/^[a-f0-9]{64}$/.test(nonce) || typeof supplied !== "string" || !/^[a-f0-9]{64}$/.test(supplied))
      return false;
    const expected = csrfDigest(nonce, readSessionCookie(req));
    return crypto.timingSafeEqual(Buffer.from(supplied, "hex"), Buffer.from(expected, "hex"));
  } catch { return false; }
};
const csrfBootstrap = (req, res) => res.json(csrfDetails(req, res));

module.exports = { safeMethods, readSessionCookie, verifySession, createSession,
  sessionDetails, setSessionCookie, clearSessionCookie, csrfDetails, validCsrf, csrfBootstrap };
