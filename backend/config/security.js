const production = process.env.NODE_ENV === "production";
if (process.env.COOKIE_SECURE && !["true", "false"].includes(process.env.COOKIE_SECURE))
  throw new Error("COOKIE_SECURE must be true or false");
if (production && process.env.COOKIE_SECURE === "false")
  throw new Error("Production cookies require COOKIE_SECURE=true");

const secureCookies = production || process.env.COOKIE_SECURE === "true";
const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
const configured = process.env.FRONTEND_URL || "http://localhost:5173";
const allowedOrigins = new Set();
for (const entry of configured.split(",")) {
  const url = new URL(entry.trim());
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash)
    throw new Error("FRONTEND_URL must contain exact website origins");
  if (secureCookies && url.protocol !== "https:")
    throw new Error("Secure cookies require HTTPS FRONTEND_URL values");
  if (!secureCookies && !localHosts.has(url.hostname))
    throw new Error("Non-local websites require HTTPS and COOKIE_SECURE=true");
  allowedOrigins.add(url.origin);
  if (!production && localHosts.has(url.hostname)) {
    for (const host of ["localhost", "127.0.0.1"]) {
      const alias = new URL(url.origin);
      alias.hostname = host;
      allowedOrigins.add(alias.origin);
    }
  }
}

module.exports = {
  allowedOrigins: [...allowedOrigins],
  secureCookies,
  sessionCookieName: secureCookies ? "__Host-travelwise_session" : "travelwise_session",
  csrfCookieName: secureCookies ? "__Host-travelwise_csrf" : "travelwise_csrf",
};
