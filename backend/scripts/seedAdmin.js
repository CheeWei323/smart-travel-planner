const User = require("../models/User");
const bcrypt = require("bcryptjs");
const {
  email: validEmail,
  password: validPassword,
  text,
  fail,
} = require("../utils/validation");

const provisionAdmin = async ({ email, password, username = "Admin" }) => {
  email = validEmail(email);
  password = validPassword(password);
  username = text(username, "Username", 80);
  const existing = await User.findOne({ email });
  // A pre-registered ordinary account must never silently receive admin access.
  if (existing && existing.role !== "admin")
    fail(
      "This email belongs to an ordinary account. Choose a new administrator email.",
    );
  if (existing) return { created: false };
  await User.create({
    username,
    email,
    password: await bcrypt.hash(password, 10),
    role: "admin",
  });
  return { created: true };
};
if (require.main === module) {
  require("dotenv").config({
    path: require("path").join(__dirname, "../.env"),
  });
  const mongoose = require("mongoose");
  (async () => {
    try {
      if (!process.env.MONGO_URI) fail("Set MONGO_URI in backend/.env");
      await mongoose.connect(process.env.MONGO_URI);
      const result = await provisionAdmin({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        username: process.env.ADMIN_USERNAME || "Admin",
      });
      console.log(
        result.created
          ? "Administrator created. You can now log in."
          : "Administrator already exists; password and status unchanged.",
      );
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    } finally {
      await mongoose.disconnect();
    }
  })();
}
module.exports = { provisionAdmin };
