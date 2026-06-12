const Checklist = require("../models/Checklist");

// CREATE: Add a task to a specific trip
const addChecklistItem = async (req, res) => {
  try {
    const { tripId, task } = req.body;
    const newItem = await Checklist.create({
      tripId,
      userId: req.user.id,
      task,
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ: Get all checklist items for a specific trip
const getChecklistByTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const items = await Checklist.find({ tripId, userId: req.user.id });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE: Toggle completion status or edit text
const updateChecklistItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await Checklist.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      req.body,
      { new: true }
    );
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE: Remove a task
const deleteChecklistItem = async (req, res) => {
  try {
    const { id } = req.params;
    await Checklist.findOneAndDelete({ _id: id, userId: req.user.id });
    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addChecklistItem, getChecklistByTrip, updateChecklistItem, deleteChecklistItem };