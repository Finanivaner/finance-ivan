const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const userController = require("../controllers/user.controller");
const paymentController = require("../controllers/payment.controller");

// Password routes
router.put("/password", protect, userController.changePassword);

// Crypto payment routes
router.get("/crypto-details", protect, userController.getCryptoDetails);
router.post("/update-crypto", protect, userController.updateCryptoDetails);

// Financial routes
router.get("/financial-summary", protect, userController.getFinancialSummary);

// IBAN Payment Routes
router.get("/iban-details", protect, paymentController.getIbanDetails);
router.post("/update-iban", protect, paymentController.updateIbanDetails);

module.exports = router;
