const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { deleteUserAndData } = require("../utils/deleteUserData");
const { logEvent } = require("../utils/audit");
const {
  fields,
  text,
  email: validEmail,
  password: validPassword,
  fail,
} = require("../utils/validation");

const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
});
const registerUser = async (req, res) => {
  fields(req.body, ["username", "email", "password"]);
  const username = text(req.body.username, "Username", 80);
  const email = validEmail(req.body.email);
  const password = validPassword(req.body.password);
  if (await User.exists({ email })) fail("Email is already registered", 409);
  const user = await User.create({
    username,
    email,
    password: await bcrypt.hash(password, 10),
  });
  await logEvent(req, "REGISTER", { userId: user._id, email, success: true });
  res
    .status(201)
    .json({
      message: "Account created. You can now log in.",
      user: publicUser(user),
    });
};
const loginUser = async (req, res) => {
  fields(req.body, ["email", "password"]);
  const email = validEmail(req.body.email);
  if (
    typeof req.body.password !== "string" ||
    Buffer.byteLength(req.body.password, "utf8") > 72
  )
    fail("Invalid email or password", 401);
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    await logEvent(req, "LOGIN_FAILED", {
      userId: user?._id,
      email,
      success: false,
      note: "Wrong email or password",
    });
    fail("Invalid email or password", 401);
  }
  if (!user.isActive) {
    await logEvent(req, "LOGIN_BLOCKED", {
      userId: user._id,
      email,
      success: false,
      note: "Account is suspended",
    });
    fail("Your account has been suspended. Please contact an admin.", 403);
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  await logEvent(req, "LOGIN_SUCCESS", { userId: user._id, email, success: true });
  res.json({ message: "Login successful", token, user: publicUser(user) });
};
const getProfile = async (req, res) =>
  res.json({ user: publicUser(await User.findById(req.user.id)) });
const updateProfile = async (req, res) => {
  fields(req.body, ["username", "email", "currentPassword", "newPassword"]);
  if (!Object.keys(req.body).length) fail("Choose a profile field to update");
  const user = await User.findById(req.user.id);
  if (!user) fail("Account not found", 404);
  if (req.body.username !== undefined)
    user.username = text(req.body.username, "Username", 80);
  if (req.body.email !== undefined) {
    const email = validEmail(req.body.email);
    if (email !== user.email && (await User.exists({ email })))
      fail("Email is already in use", 409);
    user.email = email;
  }
  if (
    req.body.currentPassword !== undefined ||
    req.body.newPassword !== undefined
  ) {
    const nextPassword = validPassword(req.body.newPassword);
    if (
      typeof req.body.currentPassword !== "string" ||
      !(await bcrypt.compare(req.body.currentPassword, user.password))
    )
      fail("Current password is incorrect");
    if (req.body.currentPassword === nextPassword)
      fail("New password must differ from your current password");
    user.password = await bcrypt.hash(nextPassword, 10);
  }
  await user.save();
  res.json({ message: "Profile updated", user: publicUser(user) });
};
const deleteAccount = async (req, res) => {
  fields(req.body, ["password"]);
  const user = await User.findById(req.user.id);
  if (!user) fail("Account not found", 404);
  if (
    typeof req.body.password !== "string" ||
    !(await bcrypt.compare(req.body.password, user.password))
  )
    fail("Password is incorrect");
  await deleteUserAndData(user._id);
  res.json({ message: "Account and associated data deleted" });
};
module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  deleteAccount,
};
