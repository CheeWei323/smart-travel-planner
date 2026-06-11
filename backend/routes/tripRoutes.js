const express = require("express");
const { protect } = require("../middleware/authMiddleware"); 
const {
  createTrip,
  getTrips,
  deleteTrip,
  updateTrip,
} = require("../controllers/tripController");

const router = express.Router();

// All endpoints are now protected and require a logged-in user token
router.post("/", protect, createTrip);
router.get("/", protect, getTrips);
router.delete("/:id", protect, deleteTrip);
router.put("/:id", protect, updateTrip);

module.exports = router;