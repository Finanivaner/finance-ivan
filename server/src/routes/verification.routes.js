const express = require("express");
const multer = require("multer");
const path = require("path");
const { protect } = require("../middleware/auth.middleware");
const logger = require("../utils/logger");
const User = require("../models/user.model");

const router = express.Router();

// Dosya yükleme konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/verification");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error("Geçersiz dosya türü");
      error.code = "INVALID_FILE_TYPE";
      return cb(error, false);
    }
    cb(null, true);
  },
});

// GET /status - Doğrulama durumunu kontrol et
router.get("/status", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "isVerified verificationStatus verificationDocuments"
    );

    if (!user) {
      return res.error(null, "Kullanıcı bulunamadı", 404);
    }

    return res.success({
      isVerified: user.isVerified,
      status: user.verificationStatus,
      documents: user.verificationDocuments,
    });
  } catch (error) {
    logger.error("Doğrulama durumu kontrol edilirken hata:", error);
    return res.error(
      null,
      "Doğrulama durumu kontrol edilirken bir hata oluştu",
      500
    );
  }
});

// POST /submit - Doğrulama belgelerini yükle
router.post(
  "/submit",
  protect,
  upload.fields([
    { name: "idCardFront", maxCount: 1 },
    { name: "idCardBack", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!req.files?.idCardFront || !req.files?.idCardBack) {
        return res.error(
          null,
          "Kimlik kartının ön ve arka yüzü gereklidir",
          400
        );
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.error(null, "Kullanıcı bulunamadı", 404);
      }

      // Belgeleri güncelle
      user.verificationDocuments = {
        idCardFront: req.files.idCardFront[0].path,
        idCardBack: req.files.idCardBack[0].path,
      };
      user.verificationStatus = "submitted";
      user.verificationSubmittedAt = new Date();

      await user.save();
      logger.info(`Kullanıcı ${user._id} doğrulama belgelerini yükledi`);

      return res.success(
        null,
        "Belgeleriniz başarıyla yüklendi ve incelemeye alındı"
      );
    } catch (error) {
      logger.error("Doğrulama belgeleri yüklenirken hata:", error);
      return res.error(null, "Belgeler yüklenirken bir hata oluştu", 500);
    }
  }
);

module.exports = router;
