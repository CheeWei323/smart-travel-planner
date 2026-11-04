const Trip = require("../models/Trip");
const Checklist = require("../models/Checklist");
const Favorite = require("../models/Favorite");
const Feedback = require("../models/Feedback");
const User = require("../models/User");

// Removes a user and all data that belongs to them
const deleteUserAndData = async (userId) => {
  await Promise.all([
    Trip.deleteMany({ userId }),
    Checklist.deleteMany({ userId }),
    Favorite.deleteMany({ userId }),
    Feedback.deleteMany({ userId }),
  ]);
  await User.findByIdAndDelete(userId);
};

module.exports = { deleteUserAndData };
