const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.middleware");
const managerController = require("../controllers/manager.controller");

// Manager stats route - accessible by both admin and manager
router.get(
  "/stats",
  protect,
  authorize("admin", "manager"),
  managerController.getManagerStats
);

// Admin-only routes
router.use(protect, authorize("admin"));
router.get("/", managerController.getAllManagers);
router.get("/:id", managerController.getManagerById);
router.post("/", managerController.createManager);
router.put("/:id", managerController.updateManager);
router.delete("/:id", managerController.deleteManager);
router.put("/:id/permissions", managerController.updateManagerPermissions);

module.exports = router;
