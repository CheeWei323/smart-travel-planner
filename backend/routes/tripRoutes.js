const express = require("express");
const { protect, travelerOnly } = require("../middleware/authMiddleware");
const {
  createTrip,
  getTrips,
  getTrip,
  deleteTrip,
  updateTrip,
} = require("../controllers/tripController");

const router = express.Router();
router.use(protect, travelerOnly);

// Personal trip endpoints require an authenticated traveler account.
router.post("/", createTrip);
router.get("/", getTrips);
router.get("/:id", getTrip);
router.delete("/:id", deleteTrip);
router.put("/:id", updateTrip);

module.exports = router;
