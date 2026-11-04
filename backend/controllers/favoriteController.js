const Favorite = require("../models/Favorite");

// CREATE: Add a new favorite destination
const addFavorite = async (req, res) => {
  try {
    const { destination } = req.body;
    
    // Check if it already exists to prevent duplicates
    const existing = await Favorite.findOne({ destination, userId: req.user.id });
    if (existing) {
      return res.status(400).json({ message: "Already in favorites" });
    }

    const favorite = await Favorite.create({
      destination,
      userId: req.user.id,
    });
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ: Get all favorites for the logged-in user
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id });
    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE: Remove a favorite destination
const deleteFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    await Favorite.findOneAndDelete({ _id: id, userId: req.user.id });
    res.status(200).json({ message: "Favorite removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addFavorite, getFavorites, deleteFavorite };