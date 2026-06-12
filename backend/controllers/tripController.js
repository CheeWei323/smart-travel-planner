const Trip = require("../models/Trip");

// CREATE
const createTrip = async (req, res) => {
  try {
    // Injects the authenticated user's ID into the trip data before saving
    const tripData = { ...req.body, userId: req.user.id };
    const trip = await Trip.create(tripData);
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL FOR AUTHENTICATED USER ONLY
const getTrips = async (req, res) => {
  try {
    // Filters the database to ONLY return trips matching the user's ID
    const trips = await Trip.find({ userId: req.user.id });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensures the user can only delete the trip if they own it
    const deletedTrip = await Trip.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!deletedTrip) {
      return res.status(404).json({ message: "Trip record not found or access unauthorized" });
    }

    res.json({ message: "Trip deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// EDIT
const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensures the user can only update the trip if they own it
    const updatedTrip = await Trip.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!updatedTrip) {
      return res.status(404).json({ message: "Trip record not found or access unauthorized" });
    }

    res.json(updatedTrip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTrip,
  getTrips,
  deleteTrip,
  updateTrip,
};