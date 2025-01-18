const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const deliveryController = require("../controllers/delivery.controller");
const { verifyToken, verifyAdmin } = require("../middleware/auth.middleware");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, "../../uploads/receipts");
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    cb(null, `${uniqueId}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Sadece PDF formatında dosya yükleyebilirsiniz"), false);
    }
  },
});

// User routes
router.post(
  "/submit",
  verifyToken,
  upload.single("receipt"),
  deliveryController.submitDelivery
);

// Get user's own deliveries
router.get("/my-deliveries", verifyToken, deliveryController.getUserDeliveries);

// Get delivery receipt
router.get(
  "/receipt/:deliveryId",
  verifyToken,
  deliveryController.getDeliveryReceipt
);

// Delete delivery
router.delete("/:deliveryId", verifyToken, deliveryController.deleteDelivery);

// Admin routes
router.get(
  "/pending",
  verifyToken,
  verifyAdmin,
  deliveryController.getPendingDeliveries
);

router.post(
  "/review/:deliveryId",
  verifyToken,
  verifyAdmin,
  deliveryController.reviewDelivery
);

module.exports = router;
