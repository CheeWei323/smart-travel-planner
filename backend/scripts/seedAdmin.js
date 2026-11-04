// Usage:  npm run seed:admin
// Reads ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_USERNAME from .env
// Creates the admin account, or promotes it if the email already exists.
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

(async () => {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const username = process.env.ADMIN_USERNAME || "Admin";

  if (!email || !password) {
    console.error("Please set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  let user = await User.findOne({ email });
  if (user) {
    user.role = "admin";
    user.isActive = true;
    await user.save();
    console.log(`Existing user ${email} promoted to admin`);
  } else {
    const hashed = await bcrypt.hash(password, await bcrypt.genSalt(10));
    await User.create({ username, email, password: hashed, role: "admin" });
    console.log(`Admin account created: ${email}`);
  }

  await mongoose.disconnect();
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
