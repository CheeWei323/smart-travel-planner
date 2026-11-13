const User = require("../models/User");
const Trip = require("../models/Trip");
const Feedback = require("../models/Feedback");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { deleteUserAndData } = require("../utils/deleteUserData");

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
  fields(req.body, ["username", "email", "password", "privacyConsent"]);

  const username = text(req.body.username, "Username", 80);
  const email = validEmail(req.body.email);
  const password = validPassword(req.body.password);

  if (req.body.privacyConsent !== true) {
    fail("You must agree to the Privacy Policy before registering");
  }

  if (await User.exists({ email })) {
    fail("Email is already registered", 409);
  }

  const user = await User.create({
    username,
    email,
    password: await bcrypt.hash(password, 10),
    consentAt: new Date(),
  });

  res.status(201).json({
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
  ) {
    fail("Invalid email or password", 401);
  }

  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    fail("Invalid email or password", 401);
  }

  if (!user.isActive) {
    fail("Your account has been suspended. Please contact an admin.", 403);
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    message: "Login successful",
    token,
    user: publicUser(user),
  });
};

const getProfile = async (req, res) => {
  res.json({
    user: publicUser(await User.findById(req.user.id)),
  });
};

// Download the authenticated user's personal data
const exportUserData = async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("-password")
    .lean();

  if (!user) {
    fail("Account not found", 404);
  }

  // Only retrieve trips belonging to this user
  const trips = await Trip.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .lean();

  // Only retrieve feedback submitted by this user
  const feedback = await Feedback.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .lean();

  const exportData = {
    exportedAt: new Date().toISOString(),

    profile: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      consentAt: user.consentAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },

    trips,
    feedback,
  };

  res.setHeader(
    "Content-Disposition",
    'attachment; filename="my-travelwise-data.json"'
  );

  res.setHeader("Content-Type", "application/json");

  res.status(200).json(exportData);
};

const updateProfile = async (req, res) => {
  fields(req.body, [
    "username",
    "email",
    "currentPassword",
    "newPassword",
  ]);

  if (!Object.keys(req.body).length) {
    fail("Choose a profile field to update");
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    fail("Account not found", 404);
  }

  if (req.body.username !== undefined) {
    user.username = text(req.body.username, "Username", 80);
  }

  if (req.body.email !== undefined) {
    const email = validEmail(req.body.email);

    if (email !== user.email && (await User.exists({ email }))) {
      fail("Email is already in use", 409);
    }

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
    ) {
      fail("Current password is incorrect");
    }

    if (req.body.currentPassword === nextPassword) {
      fail("New password must differ from your current password");
    }

    user.password = await bcrypt.hash(nextPassword, 10);
  }

  await user.save();

  res.json({
    message: "Profile updated",
    user: publicUser(user),
  });
};

const deleteAccount = async (req, res) => {
  fields(req.body, ["password"]);

  const user = await User.findById(req.user.id);

  if (!user) {
    fail("Account not found", 404);
  }

  if (
    typeof req.body.password !== "string" ||
    !(await bcrypt.compare(req.body.password, user.password))
  ) {
    fail("Password is incorrect");
  }

  await deleteUserAndData(user._id);

  res.json({
    message: "Account and associated data deleted",
  });
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  deleteAccount,
  exportUserData,
};