const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const Checklist = require("../models/Checklist");
const { tripInput } = require("../utils/tripInput");
const { fields, text, id, fail } = require("../utils/validation");
const { deleteTripAndData } = require("../utils/deleteUserData");
const createTrip = async (req, res) => {
  fields(req.body, [
    "destination",
    "startDate",
    "endDate",
    "budget",
    "hotel",
    "flight",
    "carRental",
    "activities",
    "itinerary",
    "checklist",
  ]);
  const { checklist = [], ...body } = req.body;
  if (!Array.isArray(checklist) || checklist.length > 100)
    fail("A trip can start with up to 100 checklist tasks");
  const tasks = checklist.map((task) => text(task, "Task", 300));
  const data = tripInput(body);
  const trip = await mongoose.connection.transaction(async (session) => {
    const [created] = await Trip.create([{ ...data, userId: req.user.id }], {
      session,
    });
    if (tasks.length)
      await Checklist.insertMany(
        tasks.map((task) => ({
          task,
          tripId: created._id,
          userId: req.user.id,
        })),
        { session },
      );
    return created;
  });
  res.status(201).json(trip);
};
const getTrips = async (req, res) =>
  res.json(
    await Trip.find({ userId: req.user.id }).sort({
      startDate: 1,
      createdAt: -1,
    }),
  );
const getTrip = async (req, res) => {
  const trip = await Trip.findOne({
    _id: id(req.params.id),
    userId: req.user.id,
  });
  if (!trip) fail("Trip not found", 404);
  res.json(trip);
};
const updateTrip = async (req, res) => {
  const trip = await Trip.findOne({
    _id: id(req.params.id),
    userId: req.user.id,
  });
  if (!trip) fail("Trip not found", 404);
  Object.assign(trip, tripInput(req.body, trip));
  await trip.save();
  res.json(trip);
};
const deleteTrip = async (req, res) => {
  await deleteTripAndData({ _id: id(req.params.id), userId: req.user.id });
  res.json({ message: "Trip and checklist deleted" });
};
module.exports = { createTrip, getTrips, getTrip, updateTrip, deleteTrip };
