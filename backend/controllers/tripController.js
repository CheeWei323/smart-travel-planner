const Trip = require("../models/Trip");

// CREATE
const createTrip = async (req, res) => {
  try {
    const trip = await Trip.create(req.body);
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL
const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find();
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;

    await Trip.findByIdAndDelete(id);

    res.json({ message: "Trip deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// EDIT
const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedTrip = await Trip.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

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