const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.middleware");
const accountingController = require("../controllers/accounting.controller");

// All routes require admin authentication
router.use(protect, authorize("admin"));

// CRUD operations for accounting entries
router.post("/", accountingController.addEntry);
router.get("/", accountingController.getEntries);
router.put("/:id", accountingController.updateEntry);
router.delete("/:id", accountingController.deleteEntry);

module.exports = router;
