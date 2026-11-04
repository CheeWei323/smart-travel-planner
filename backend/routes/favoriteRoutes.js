const express = require("express");
const router = express.Router();
const { protect, travelerOnly } = require("../middleware/authMiddleware");
router.use(protect, travelerOnly);
const {
  addFavorite,
  getFavorites,
  deleteFavorite,
} = require("../controllers/favoriteController");

router.post("/", addFavorite);
router.get("/", getFavorites);
router.delete("/:id", deleteFavorite);

module.exports = router;
