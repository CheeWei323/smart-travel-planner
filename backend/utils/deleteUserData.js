const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const Checklist = require("../models/Checklist");
const Favorite = require("../models/Favorite");
const Feedback = require("../models/Feedback");
const Announcement = require("../models/Announcement");
const User = require("../models/User");
const { fail } = require("./validation");
const deleteTripAndData = async (filter) =>
  mongoose.connection.transaction(async (session) => {
    const trip = await Trip.findOne(filter).session(session);
    if (!trip) fail("Trip not found", 404);
    await Checklist.deleteMany({ tripId: trip._id }, { session });
    await Trip.deleteOne({ _id: trip._id }, { session });
  });
const deleteUserAndData = async (userId) =>
  mongoose.connection.transaction(async (session) => {
    const user = await User.findById(userId).session(session);
    if (!user) fail("User not found", 404);
    if (
      user.role === "admin" &&
      user.isActive &&
      (await User.countDocuments({ role: "admin", isActive: true }).session(
        session,
      )) <= 1
    )
      fail("Create another active administrator before deleting this account");
    const tripIds = await Trip.find({ userId })
      .distinct("_id")
      .session(session);
    // MongoDB transactions require sequential operations on their session.
    await Checklist.deleteMany(
      { $or: [{ userId }, { tripId: { $in: tripIds } }] },
      { session },
    );
    await Trip.deleteMany({ userId }, { session });
    await Favorite.deleteMany({ userId }, { session });
    await Feedback.deleteMany({ userId }, { session });
    await Announcement.updateMany(
      { createdBy: userId },
      { $unset: { createdBy: 1 } },
      { session },
    );
    await User.deleteOne({ _id: userId }, { session });
  });
module.exports = { deleteUserAndData, deleteTripAndData };
