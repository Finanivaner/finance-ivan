const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const deliveryController = require("../controllers/delivery.controller");

// User routes
router.post("/", protect, deliveryController.createDelivery);
router.get("/", protect, deliveryController.getUserDeliveries);
router.delete("/:id", protect, deliveryController.deleteDelivery);

// Admin routes
router.get("/all", protect, deliveryController.getAllDeliveries);
router.put("/:id/status", protect, deliveryController.updateDeliveryStatus);

module.exports = router;
