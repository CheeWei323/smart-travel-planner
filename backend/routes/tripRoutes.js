const express = require("express");

const {
  createTrip,
  getTrips,
  deleteTrip,
  updateTrip,
} = require("../controllers/tripController");

const router = express.Router();

router.post("/", createTrip);
router.get("/", getTrips);

// 🔥 ADD THESE
router.delete("/:id", deleteTrip);
router.put("/:id", updateTrip);

module.exports = router;