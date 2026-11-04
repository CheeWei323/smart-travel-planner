const mongoose = require("mongoose");

const fail = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  throw error;
};
const fields = (body, allowed) => {
  if (!body || typeof body !== "object" || Array.isArray(body))
    fail("A JSON object is required");
  // Only declared fields become updates; nested database operators are unsupported.
  if (Object.keys(body).some((key) => !allowed.includes(key)))
    fail("Request contains unsupported fields");
  return body;
};
const text = (value, label, max = 200, min = 1) => {
  if (
    typeof value !== "string" ||
    value.trim().length < min ||
    value.trim().length > max
  )
    fail(`${label} must contain ${min}–${max} characters`);
  return value.trim();
};
const id = (value) => {
  if (typeof value !== "string" || !mongoose.isObjectIdOrHexString(value))
    fail("Invalid record ID");
  return value;
};
const email = (value) => {
  const normalized = text(value, "Email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))
    fail("Enter a valid email address");
  return normalized;
};
const password = (value) => {
  if (
    typeof value !== "string" ||
    value.length < 6 ||
    Buffer.byteLength(value, "utf8") > 72
  )
    fail("Password must be at least 6 characters and at most 72 bytes");
  return value;
};
const boolean = (value, label) => {
  if (typeof value !== "boolean") fail(`${label} must be true or false`);
  return value;
};
const date = (value, label) => {
  const key = value instanceof Date ? value.toISOString().slice(0, 10) : value;
  if (typeof key !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(key))
    fail(`${label} must be a valid calendar date`);
  const parsed = new Date(`${key}T00:00:00.000Z`);
  if (
    !Number.isFinite(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== key
  )
    fail(`${label} is invalid`);
  return parsed;
};
module.exports = { fail, fields, text, id, email, password, boolean, date };
