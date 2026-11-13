const Checklist = require("../models/Checklist");
const Trip = require("../models/Trip");
const { fields, text, id, boolean, fail } = require("../utils/validation");
const ownTrip = async (tripId, userId) => {
  if (!(await Trip.exists({ _id: id(tripId), userId })))
    fail("Trip not found", 404);
};
const addChecklistItem = async (req, res) => {
  fields(req.body, ["tripId", "task"]);
  await ownTrip(req.body.tripId, req.user.id);
  const task = text(req.body.task, "Task", 300);
  res
    .status(201)
    .json(
      await Checklist.create({
        tripId: req.body.tripId,
        userId: req.user.id,
        task,
      }),
    );
};
const getChecklistByTrip = async (req, res) => {
  await ownTrip(req.params.tripId, req.user.id);
  res.json(
    await Checklist.find({
      tripId: req.params.tripId,
      userId: req.user.id,
    }).sort({ createdAt: 1 }),
  );
};
const updateChecklistItem = async (req, res) => {
  fields(req.body, ["task", "isCompleted"]);
  const item = await Checklist.findOne({
    _id: id(req.params.id),
    userId: req.user.id,
  });
  if (!item) fail("Task not found", 404);
  await ownTrip(String(item.tripId), req.user.id);
  if (req.body.task !== undefined) item.task = text(req.body.task, "Task", 300);
  if (req.body.isCompleted !== undefined)
    item.isCompleted = boolean(req.body.isCompleted, "Completion");
  await item.save();
  res.json(item);
};
const deleteChecklistItem = async (req, res) => {
  if (
    !(await Checklist.findOneAndDelete({
      _id: id(req.params.id),
      userId: req.user.id,
    }))
  )
    fail("Task not found", 404);
  res.json({ message: "Task deleted" });
};
module.exports = {
  addChecklistItem,
  getChecklistByTrip,
  updateChecklistItem,
  deleteChecklistItem,
};
