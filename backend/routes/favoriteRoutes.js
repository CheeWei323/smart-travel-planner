const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  addFavorite,
  getFavorites,
  deleteFavorite,
} = require("../controllers/favoriteController");

router.post("/", protect, addFavorite);
router.get("/", protect, getFavorites);
router.delete("/:id", protect, deleteFavorite);

module.exports = router;