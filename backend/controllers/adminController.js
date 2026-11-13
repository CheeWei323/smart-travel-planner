const User = require("../models/User");
const Trip = require("../models/Trip");
const Favorite = require("../models/Favorite");
const Feedback = require("../models/Feedback");
const Announcement = require("../models/Announcement");
const AuditLog = require("../models/AuditLog");
const { logEvent } = require("../utils/audit");
const {
  deleteUserAndData,
  deleteTripAndData,
} = require("../utils/deleteUserData");
const { fields, text, id, boolean, fail } = require("../utils/validation");
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const search = (req) =>
  req.query.q
    ? new RegExp(escapeRegex(text(req.query.q, "Search", 100)), "i")
    : null;
const today = () =>
  new Date(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: process.env.APP_TIMEZONE || "Asia/Kuala_Lumpur",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date()) + "T00:00:00Z",
  );
const getStats = async (_req, res) => {
  const [
    totalUsers,
    suspendedUsers,
    newUsers,
    totalTrips,
    upcomingTrips,
    totalFavorites,
    openFeedback,
    topDestinations,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: false }),
    User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 86400000) },
    }),
    Trip.countDocuments(),
    Trip.countDocuments({ startDate: { $gt: today() } }),
    Favorite.countDocuments(),
    Feedback.countDocuments({ status: "open" }),
    Trip.aggregate([
      { $group: { _id: "$destination", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);
  res.json({
    totalUsers,
    suspendedUsers,
    newUsers,
    totalTrips,
    upcomingTrips,
    totalFavorites,
    openFeedback,
    topDestinations: topDestinations.map((item) => ({
      destination: item._id,
      count: item.count,
    })),
  });
};
const getUsers = async (req, res) => {
  const rx = search(req);
  const users = await User.find(
    rx ? { $or: [{ username: rx }, { email: rx }] } : {},
  )
    .select("-password")
    .sort({ createdAt: -1 })
    .lean();
  const counts = await Trip.aggregate([
    { $group: { _id: "$userId", count: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((item) => [String(item._id), item.count]));
  res.json(
    users.map((user) => ({
      ...user,
      tripCount: map.get(String(user._id)) || 0,
    })),
  );
};
const updateUser = async (req, res) => {
  fields(req.body, ["role", "isActive"]);
  const userId = id(req.params.id);
  if (userId === req.user.id)
    fail("You cannot change your own role or account status");
  const changes = {};
  if (req.body.role !== undefined) {
    if (!["user", "admin"].includes(req.body.role)) fail("Invalid role");
    changes.role = req.body.role;
  }
  if (req.body.isActive !== undefined)
    changes.isActive = boolean(req.body.isActive, "Account status");
  const previous = await User.findById(userId).select("role isActive");
  if (!previous) fail("User not found", 404);
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: changes,
      ...(changes.isActive === false ? { $inc: { tokenVersion: 1 } } : {}),
    },
    { returnDocument: "after", runValidators: true },
  );
  if (!user) fail("User not found", 404);
  if (user.role !== previous.role)
    await logEvent(req, "ROLE_CHANGED", {
      email: user.email,
      note: `${previous.role} -> ${user.role}`,
    });
  if (user.isActive !== previous.isActive)
    await logEvent(req, user.isActive ? "USER_REACTIVATED" : "USER_SUSPENDED", {
      email: user.email,
    });
  const { password, ...safe } = user.toObject();
  res.json(safe);
};
const deleteUser = async (req, res) => {
  const userId = id(req.params.id);
  if (userId === req.user.id)
    fail("Use account settings to delete your own account");
  const target = await User.findById(userId).select("email");
  await deleteUserAndData(userId);
  await logEvent(req, "USER_DELETED", { email: target?.email });
  res.json({ message: "User and associated data deleted" });
};
const getAllTrips = async (req, res) => {
  const rx = search(req);
  res.json(
    await Trip.find(rx ? { destination: rx } : {})
      .select("-itinerary")
      .populate("userId", "username email")
      .sort({ createdAt: -1 }),
  );
};
const deleteAnyTrip = async (req, res) => {
  await deleteTripAndData({ _id: id(req.params.id) });
  res.json({ message: "Trip and checklist deleted" });
};
const announcementInput = (body, partial = false) => {
  fields(body, ["title", "message", "type", "isActive"]);
  const data = {};
  if (!partial || body.title !== undefined)
    data.title = text(body.title, "Title", 120);
  if (!partial || body.message !== undefined)
    data.message = text(body.message, "Message", 2000);
  if (body.type !== undefined) {
    if (!["info", "success", "warning"].includes(body.type))
      fail("Invalid announcement type");
    data.type = body.type;
  }
  if (body.isActive !== undefined)
    data.isActive = boolean(body.isActive, "Announcement visibility");
  return data;
};
const getAnnouncements = async (_req, res) =>
  res.json(await Announcement.find().sort({ createdAt: -1 }));
const createAnnouncement = async (req, res) =>
  res
    .status(201)
    .json(
      await Announcement.create({
        ...announcementInput(req.body),
        createdBy: req.user.id,
      }),
    );
const updateAnnouncement = async (req, res) => {
  const item = await Announcement.findByIdAndUpdate(
    id(req.params.id),
    { $set: announcementInput(req.body, true) },
    { returnDocument: "after", runValidators: true },
  );
  if (!item) fail("Announcement not found", 404);
  res.json(item);
};
const deleteAnnouncement = async (req, res) => {
  if (!(await Announcement.findByIdAndDelete(id(req.params.id))))
    fail("Announcement not found", 404);
  res.json({ message: "Announcement deleted" });
};
const getAllFeedback = async (req, res) => {
  if (
    req.query.status &&
    !["open", "reviewed", "resolved"].includes(req.query.status)
  )
    fail("Invalid feedback status");
  res.json(
    await Feedback.find(req.query.status ? { status: req.query.status } : {})
      .populate("userId", "username email")
      .sort({ createdAt: -1 }),
  );
};
const updateFeedback = async (req, res) => {
  fields(req.body, ["status", "adminReply"]);
  const data = {};
  if (req.body.status !== undefined) {
    if (!["open", "reviewed", "resolved"].includes(req.body.status))
      fail("Invalid feedback status");
    data.status = req.body.status;
  }
  if (req.body.adminReply !== undefined)
    data.adminReply = text(req.body.adminReply, "Reply", 2000, 0);
  const item = await Feedback.findByIdAndUpdate(
    id(req.params.id),
    { $set: data },
    { returnDocument: "after", runValidators: true },
  ).populate("userId", "username email");
  if (!item) fail("Feedback not found", 404);
  res.json(item);
};
const deleteFeedback = async (req, res) => {
  if (!(await Feedback.findByIdAndDelete(id(req.params.id))))
    fail("Feedback not found", 404);
  res.json({ message: "Feedback deleted" });
};
// Security Logs page: newest 100 events plus the three count cards
const getAuditLogs = async (_req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const [logs, loginsToday, failedToday, newUsersWeek] = await Promise.all([
    AuditLog.find().sort({ time: -1 }).limit(100).lean(),
    AuditLog.countDocuments({
      action: "LOGIN_SUCCESS",
      time: { $gte: startOfToday },
    }),
    AuditLog.countDocuments({
      action: { $in: ["LOGIN_FAILED", "LOGIN_BLOCKED"] },
      time: { $gte: startOfToday },
    }),
    User.countDocuments({ createdAt: { $gte: weekAgo } }),
  ]);
  res.json({ logs, counts: { loginsToday, failedToday, newUsersWeek } });
};
module.exports = {
  getStats,
  getAuditLogs,
  getUsers,
  updateUser,
  deleteUser,
  getAllTrips,
  deleteAnyTrip,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAllFeedback,
  updateFeedback,
  deleteFeedback,
};
