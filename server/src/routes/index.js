const express = require("express");
const router = express.Router();
const authRoutes = require("./auth.routes");
const adminRoutes = require("./admin.routes");
const userRoutes = require("./user.routes");
const deliveryRoutes = require("./delivery.routes");
const announcementRoutes = require("./announcement.routes");
const postRoutes = require("./post.routes");
const accountingRoutes = require("./accounting.routes");

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/users", userRoutes);
router.use("/delivery", deliveryRoutes);
router.use("/announcements", announcementRoutes);
router.use("/posts", postRoutes);
router.use("/accounting", accountingRoutes);

module.exports = router;
