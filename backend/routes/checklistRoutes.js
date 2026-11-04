const express = require("express");
const router = express.Router();
const { protect, travelerOnly } = require("../middleware/authMiddleware");
router.use(protect, travelerOnly);
const {
  addChecklistItem,
  getChecklistByTrip,
  updateChecklistItem,
  deleteChecklistItem,
} = require("../controllers/checklistController");

router.post("/", addChecklistItem);
router.get("/:tripId", getChecklistByTrip);
router.put("/:id", updateChecklistItem);
router.delete("/:id", deleteChecklistItem);

module.exports = router;
