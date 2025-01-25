const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.middleware");
const adminController = require("../controllers/admin.controller");

// Protected admin routes
router.use(protect, authorize("admin"));

// User management routes
router.get("/users", adminController.getAllUsers);
router.get("/users/:userId", adminController.getUserDetails);
router.put("/users/:userId", adminController.updateUser);
router.delete("/users/:userId", adminController.deleteUser);

// Verification routes
router.get("/users/:userId/verification", adminController.getUserVerification);
router.put(
  "/users/:userId/verification",
  adminController.updateVerificationStatus
);

// Financial routes
router.put("/users/:userId/finances", adminController.updateUserFinances);
router.get("/users/:userId/transactions", adminController.getUserTransactions);

// Dashboard stats
router.get("/dashboard", adminController.getDashboardStats);

// Reports
router.get("/reports", adminController.getReports);

module.exports = router;
