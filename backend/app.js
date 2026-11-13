const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const { allowedOrigins } = require("./config/security");
const { checkOrigin, csrfProtection } = require("./middleware/csrfMiddleware");
const app = express();
app.use(helmet());
app.use("/api", checkOrigin);
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "256kb" }));
app.use("/api", csrfProtection);
app.use("/api/auth", (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
app.get("/", (_req, res) =>
  res.json({ message: "Smart Travel Planner API Running" }),
);
app.get("/api/health", (_req, res) =>
  res
    .status(mongoose.connection.readyState === 1 ? 200 : 503)
    .json({
      status: mongoose.connection.readyState === 1 ? "ok" : "unavailable",
    }),
);
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/test", require("./routes/testRoutes"));
app.use("/api/trips", require("./routes/tripRoutes"));
app.use("/api/checklists", require("./routes/checklistRoutes"));
app.use("/api/favorites", require("./routes/favoriteRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/integrations", require("./routes/integrationRoutes"));
app.use((_req, res) => res.status(404).json({ message: "Endpoint not found" }));
app.use((error, _req, res, _next) => {
  let status = error.status || 500;
  let message = error.message;
  if (error.code === 11000) {
    status = 409;
    message = "This email or favorite is already in use";
  }
  if (error.name === "ValidationError") {
    status = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join("; ");
  }
  if (error.name === "CastError") {
    status = 400;
    message = "Invalid record ID or field value";
  }
  if (error.type === "entity.parse.failed") {
    status = 400;
    message = "Request must contain valid JSON";
  }
  if (error.type === "entity.too.large") {
    status = 413;
    message = "Request is too large";
  }
  if (status >= 500 && !error.status) {
    console.error("Request failed:", error.name);
    message = "Something went wrong. Please try again.";
  }
  res.status(status).json({ message });
});
module.exports = app;
