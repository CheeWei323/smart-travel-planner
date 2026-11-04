const User = require("../models/User");
const Trip = require("../models/Trip");
const Checklist = require("../models/Checklist");
const Favorite = require("../models/Favorite");
const Feedback = require("../models/Feedback");
const Announcement = require("../models/Announcement");
const { deleteUserAndData } = require("../utils/deleteUserData");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ---------------- OVERVIEW ---------------- */
const getStats = async (req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

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
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      Trip.countDocuments(),
      Trip.countDocuments({ startDate: { $gt: now } }),
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
      topDestinations: topDestinations.map((d) => ({ destination: d._id, count: d.count })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- USERS ---------------- */
const getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.q) {
      const rx = new RegExp(escapeRegex(req.query.q), "i");
      filter.$or = [{ username: rx }, { email: rx }];
    }

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 }).lean();

    // attach trip count per user
    const counts = await Trip.aggregate([{ $group: { _id: "$userId", count: { $sum: 1 } } }]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    res.json(users.map((u) => ({ ...u, tripCount: countMap.get(String(u._id)) || 0 })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Change role and/or suspend / reactivate
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    if (id === req.user.id) {
      return res.status(400).json({ message: "You cannot change your own role or status" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (role !== undefined) {
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      user.role = role;
    }
    if (isActive !== undefined) user.isActive = Boolean(isActive);

    await user.save();

    const { password, ...safe } = user.toObject();
    res.json(safe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account here" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await deleteUserAndData(user._id);
    res.json({ message: "User and their data deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- TRIPS ---------------- */
const getAllTrips = async (req, res) => {
  try {
    const filter = {};
    if (req.query.q) {
      filter.destination = new RegExp(escapeRegex(req.query.q), "i");
    }

    const trips = await Trip.find(filter)
      .select("-itinerary")
      .populate("userId", "username email")
      .sort({ createdAt: -1 });

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAnyTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    await Checklist.deleteMany({ tripId: trip._id });
    res.json({ message: "Trip deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- ANNOUNCEMENTS ---------------- */
const getAnnouncements = async (req, res) => {
  try {
    res.json(await Announcement.find().sort({ createdAt: -1 }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }
    const item = await Announcement.create({ title, message, type, createdBy: req.user.id });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const { title, message, type, isActive } = req.body;
    const item = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, message, type, isActive },
      { new: true, runValidators: true, omitUndefined: true }
    );
    if (!item) return res.status(404).json({ message: "Announcement not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const item = await Announcement.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- FEEDBACK ---------------- */
const getAllFeedback = async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const items = await Feedback.find(filter)
      .populate("userId", "username email")
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const { status, adminReply } = req.body;
    const item = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status, adminReply },
      { new: true, runValidators: true, omitUndefined: true }
    ).populate("userId", "username email");
    if (!item) return res.status(404).json({ message: "Feedback not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const item = await Feedback.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Feedback not found" });
    res.json({ message: "Feedback deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStats,
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
