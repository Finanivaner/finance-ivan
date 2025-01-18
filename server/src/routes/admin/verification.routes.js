const express = require("express");
const { protect, authorize } = require("../../middleware/auth.middleware");
const logger = require("../../utils/logger");
const User = require("../../models/user.model");

const router = express.Router();

// Tüm bekleyen doğrulama isteklerini getir
router.get("/pending", protect, authorize("admin"), async (req, res) => {
  try {
    const pendingVerifications = await User.find({
      verificationStatus: "submitted",
    }).select("username email verificationDocuments verificationSubmittedAt");

    return res.success({
      count: pendingVerifications.length,
      verifications: pendingVerifications,
    });
  } catch (error) {
    logger.error("Bekleyen doğrulamalar listelenirken hata:", error);
    return res.error(
      null,
      "Bekleyen doğrulamalar listelenirken bir hata oluştu",
      500
    );
  }
});

// Doğrulama isteğini onayla
router.post(
  "/:userId/approve",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.error(null, "Kullanıcı bulunamadı", 404);
      }

      if (user.verificationStatus !== "submitted") {
        return res.error(
          null,
          "Bu kullanıcının bekleyen bir doğrulama isteği yok",
          400
        );
      }

      user.isVerified = true;
      user.verificationStatus = "approved";
      user.verificationApprovedAt = new Date();
      await user.save();

      logger.info(
        `Admin ${req.user.username} kullanıcı ${user._id} doğrulamasını onayladı`
      );
      return res.success(null, "Kullanıcı doğrulaması onaylandı");
    } catch (error) {
      logger.error("Doğrulama onaylanırken hata:", error);
      return res.error(null, "Doğrulama onaylanırken bir hata oluştu", 500);
    }
  }
);

// Doğrulama isteğini reddet
router.post(
  "/:userId/reject",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { reason } = req.body;
      if (!reason) {
        return res.error(null, "Red sebebi belirtilmelidir", 400);
      }

      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.error(null, "Kullanıcı bulunamadı", 404);
      }

      if (user.verificationStatus !== "submitted") {
        return res.error(
          null,
          "Bu kullanıcının bekleyen bir doğrulama isteği yok",
          400
        );
      }

      user.verificationStatus = "rejected";
      user.verificationRejectedAt = new Date();
      user.rejectionReason = reason;
      await user.save();

      logger.info(
        `Admin ${req.user.username} kullanıcı ${user._id} doğrulamasını reddetti`
      );
      return res.success(null, "Kullanıcı doğrulaması reddedildi");
    } catch (error) {
      logger.error("Doğrulama reddedilirken hata:", error);
      return res.error(null, "Doğrulama reddedilirken bir hata oluştu", 500);
    }
  }
);

module.exports = router;
