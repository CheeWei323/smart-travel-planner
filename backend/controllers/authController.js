const User = require("../models/User");
const Trip = require("../models/Trip");
const Feedback = require("../models/Feedback");
const bcrypt = require("bcryptjs");
const { createSession, sessionDetails, setSessionCookie, clearSessionCookie,
  csrfDetails } = require("../utils/cookieSession");
const {
  SESSION_ENDED_MESSAGE,
  validTokenVersion,
  tokenVersionFilter,
} = require("../utils/sessionSecurity");
const { deleteUserAndData } = require("../utils/deleteUserData");
const { logEvent } = require("../utils/audit");
const {
  recordFailedLogin,
  completeLogin,
  getLoginLock,
  LOGIN_FAILURE_MESSAGE,
} = require("../utils/loginProtection");
// Compare unknown accounts too, reducing the obvious account-existence timing gap.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync("Local login timing placeholder", 10);
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
  if (req.body.privacyConsent !== true)
    fail("You must agree to the Privacy Policy before registering");
  if (await User.exists({ email })) fail("Email is already registered", 409);
  const user = await User.create({
    username,
    email,
    password: await bcrypt.hash(password, 10),
    consentAt: new Date(),
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
  ) {
    await logEvent(req, "LOGIN_FAILED", {
      email, success: false, note: "Invalid password input",
    });
    fail(LOGIN_FAILURE_MESSAGE, 401);
  }
  const user = await User.findOne({ email }).select("+tokenVersion");
  const matches = await bcrypt.compare(
    req.body.password,
    user ? user.password : DUMMY_PASSWORD_HASH,
  );
  if (user && !validTokenVersion(user.tokenVersion)) {
    await logEvent(req, "LOGIN_BLOCKED", {
      userId: user._id, email, success: false, note: "Invalid account session state",
    });
    fail(LOGIN_FAILURE_MESSAGE, 401);
  }
  if (!user || !matches) {
    if (user) await recordFailedLogin(user);
    await logEvent(req, "LOGIN_FAILED", {
      userId: user?._id, email, success: false, note: "Wrong email or password",
    });
    fail(LOGIN_FAILURE_MESSAGE, 401);
  }
  if (!user.isActive) {
    await logEvent(req, "LOGIN_BLOCKED", {
      userId: user._id, email, success: false, note: "Account is suspended",
    });
    fail("Your account has been suspended. Please contact an admin.", 403);
  }
  const authenticatedUser = await completeLogin(user);
  if (!authenticatedUser) {
    // Incorrect credentials never reveal whether the supplied account is locked.
    const lock = await getLoginLock(user);
    if (lock) {
      const minutes = Math.ceil(lock.retryAfterSeconds / 60);
      await logEvent(req, "LOGIN_BLOCKED", {
        userId: user._id, email, success: false, note: "Account is temporarily locked",
      });
      return res.status(401).json({
        message: `This account is temporarily locked after repeated failed attempts. Try again in ${minutes} ${minutes === 1 ? "minute" : "minutes"}.`,
        retryAfterSeconds: lock.retryAfterSeconds,
      });
    }
    await logEvent(req, "LOGIN_FAILED", {
      userId: user._id, email, success: false, note: "Account changed during login",
    });
    fail(LOGIN_FAILURE_MESSAGE, 401);
  }
  const { token, claims } = createSession(authenticatedUser);
  setSessionCookie(res, token, claims);
  await logEvent(req, "LOGIN_SUCCESS", {
    userId: authenticatedUser._id, email, success: true,
  });
  res.json({ message: "Login successful", user: publicUser(authenticatedUser),
    ...sessionDetails(claims), ...csrfDetails(req, res, token) });
};
const logoutUser = async (req, res) => {
  // A delayed duplicate logout cannot revoke a newer session version.
  const result = await User.updateOne(
    { _id: req.user.id, ...tokenVersionFilter(req.user.tokenVersion) },
    { $inc: { tokenVersion: 1 } },
  );
  if (!result.matchedCount) fail(SESSION_ENDED_MESSAGE, 401);
  clearSessionCookie(res);
  res.json({ message: "Logged out on all devices." });
};
const getProfile = async (req, res) =>
  res.json({ user: publicUser(await User.findById(req.user.id)),
    ...sessionDetails(req.auth.claims), ...csrfDetails(req, res, req.auth.token) });
const exportUserData = async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "username email role consentAt createdAt updatedAt",
  ).lean();
  if (!user) fail("Account not found", 404);
  const [trips, feedback] = await Promise.all([
    Trip.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean(),
    Feedback.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean(),
  ]);
  res.setHeader("Content-Disposition", 'attachment; filename="my-travelwise-data.json"');
  res.json({
    exportedAt: new Date().toISOString(),
    profile: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      consentAt: user.consentAt ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    trips,
    feedback,
  });
};
const updateProfile = async (req, res) => {
  fields(req.body, ["username", "email", "currentPassword", "newPassword"]);
  if (!Object.keys(req.body).length) fail("Choose a profile field to update");
  const user = await User.findById(req.user.id);
  if (!user) fail("Account not found", 404);
  const changes = {};
  if (req.body.username !== undefined)
    changes.username = text(req.body.username, "Username", 80);
  if (req.body.email !== undefined) {
    const email = validEmail(req.body.email);
    if (email !== user.email && (await User.exists({ email })))
      fail("Email is already in use", 409);
    changes.email = email;
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
    changes.password = await bcrypt.hash(nextPassword, 10);
  }
  const updated = await User.findOneAndUpdate(
    {
      _id: user._id,
      ...tokenVersionFilter(req.user.tokenVersion),
      ...(changes.password ? { password: user.password } : {}),
    },
    {
      $set: changes,
      ...(changes.password ? { $inc: { tokenVersion: 1 } } : {}),
    },
    { returnDocument: "after", runValidators: true },
  );
  if (!updated) fail(SESSION_ENDED_MESSAGE, 401);
  if (changes.password) clearSessionCookie(res);
  res.json({ message: "Profile updated", user: publicUser(updated) });
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
  clearSessionCookie(res);
  res.json({ message: "Account and associated data deleted" });
};
module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  deleteAccount,
  exportUserData,
};
