const User = require("../models/user.model");
const logger = require("../utils/logger");
const AppError = require("../utils/appError");

// Doğrulama durumunu kontrol et
exports.checkVerificationStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.error(null, "Kullanıcı bulunamadı", 404);
    }

    res.success({
      isVerified: user.isVerified,
      status: user.verificationStatus,
      submittedAt: user.verificationSubmittedAt,
      approvedAt: user.verificationApprovedAt,
      rejectedAt: user.verificationRejectedAt,
      rejectionReason: user.verificationRejectionReason,
    });
  } catch (error) {
    logger.error("Doğrulama durumu kontrol hatası:", error);
    res.error(error, "Doğrulama durumu kontrol edilirken bir hata oluştu", 500);
  }
};

// Doğrulama belgelerini yükle
exports.submitVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.error(null, "Kullanıcı bulunamadı", 404);
    }

    // Dosya yollarını kaydet
    user.verificationDocuments = {
      idCardFront: req.files.idCardFront[0].path,
      idCardBack: req.files.idCardBack[0].path,
    };
    user.verificationStatus = "submitted";
    user.verificationSubmittedAt = Date.now();

    await user.save();
    logger.info(`Doğrulama belgeleri yüklendi: ${user.email}`);

    res.success(
      {
        status: user.verificationStatus,
        submittedAt: user.verificationSubmittedAt,
      },
      "Doğrulama belgeleriniz başarıyla yüklendi"
    );
  } catch (error) {
    logger.error("Doğrulama belgesi yükleme hatası:", error);
    res.error(error, "Belgeler yüklenirken bir hata oluştu", 500);
  }
};

// Admin: Doğrulama belgelerini görüntüle
exports.getVerificationDocuments = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "+idCardFront +idCardBack"
    );

    if (!user) {
      return res.error(null, "Kullanıcı bulunamadı", 404);
    }

    res.success({
      idCardFront: user.idCardFront,
      idCardBack: user.idCardBack,
      status: user.verificationStatus,
      submittedAt: user.verificationSubmittedAt,
    });
  } catch (error) {
    logger.error("Doğrulama belgesi görüntüleme hatası:", error);
    res.error(error, "Belgeler görüntülenirken bir hata oluştu", 500);
  }
};

// Admin: Doğrulama durumunu güncelle
exports.updateVerificationStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.error(null, "Kullanıcı bulunamadı", 404);
    }

    user.verificationStatus = status;
    user.isVerified = status === "approved";

    if (status === "approved") {
      user.verificationApprovedAt = Date.now();
      user.verificationRejectionReason = null;
    } else if (status === "rejected") {
      user.verificationRejectedAt = Date.now();
      user.verificationRejectionReason = rejectionReason;
    }

    await user.save();
    logger.info(`Doğrulama durumu güncellendi: ${user.email} - ${status}`);

    res.success(
      {
        status: user.verificationStatus,
        isVerified: user.isVerified,
        updatedAt:
          status === "approved"
            ? user.verificationApprovedAt
            : user.verificationRejectedAt,
      },
      `Kullanıcı doğrulama durumu ${status} olarak güncellendi`
    );
  } catch (error) {
    logger.error("Doğrulama durumu güncelleme hatası:", error);
    res.error(error, "Doğrulama durumu güncellenirken bir hata oluştu", 500);
  }
};
