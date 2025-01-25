const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.middleware");
const announcementController = require("../controllers/announcement.controller");

// Public routes
router.get("/active", protect, announcementController.getActiveAnnouncements);

// Admin only routes
router.use(protect, authorize("admin"));
router.post("/", announcementController.createAnnouncement);
router.get("/all", announcementController.getAllAnnouncements);
router.put("/:id", announcementController.updateAnnouncement);
router.delete("/:id", announcementController.deleteAnnouncement);

module.exports = router;
