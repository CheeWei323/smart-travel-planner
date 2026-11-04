const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  addChecklistItem,
  getChecklistByTrip,
  updateChecklistItem,
  deleteChecklistItem,
} = require("../controllers/checklistController");

router.post("/", protect, addChecklistItem);
router.get("/:tripId", protect, getChecklistByTrip);
router.put("/:id", protect, updateChecklistItem);
router.delete("/:id", protect, deleteChecklistItem);

module.exports = router;