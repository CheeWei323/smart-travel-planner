const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const c = require("../controllers/adminController");

const router = express.Router();

// Every route below requires a logged-in admin
router.use(protect, adminOnly);

router.get("/stats", c.getStats);

router.get("/users", c.getUsers);
router.put("/users/:id", c.updateUser);
router.delete("/users/:id", c.deleteUser);

router.get("/trips", c.getAllTrips);
router.delete("/trips/:id", c.deleteAnyTrip);

router.get("/announcements", c.getAnnouncements);
router.post("/announcements", c.createAnnouncement);
router.put("/announcements/:id", c.updateAnnouncement);
router.delete("/announcements/:id", c.deleteAnnouncement);

router.get("/feedback", c.getAllFeedback);
router.put("/feedback/:id", c.updateFeedback);
router.delete("/feedback/:id", c.deleteFeedback);

module.exports = router;
