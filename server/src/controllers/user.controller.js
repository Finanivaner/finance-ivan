const User = require("../models/user.model");
const logger = require("../utils/logger");
const createError = require("../utils/createError");
const bcrypt = require("bcryptjs");

// Get user's crypto payment details
exports.getCryptoDetails = async (req, res, next) => {
  try {
    logger.info("User requesting crypto payment details");

    const user = await User.findById(req.user.id).select(
      "cryptoPayment.trxAddress"
    );

    if (!user) {
      return next(createError(404, "Kullanıcı bulunamadı"));
    }

    res.status(200).json({
      success: true,
      data: {
        cryptoPayment: user.cryptoPayment,
      },
      message: "Kripto ödeme bilgileri başarıyla getirildi",
    });
  } catch (error) {
    logger.error("Error fetching crypto details:", error);
    next(
      createError(500, "Kripto ödeme bilgileri getirilirken bir hata oluştu")
    );
  }
};

// Update user's crypto payment details
exports.updateCryptoDetails = async (req, res, next) => {
  try {
    const { trxAddress, mnemonicKey } = req.body;

    logger.info("User updating crypto payment details");

    if (!trxAddress || !mnemonicKey) {
      return next(createError(400, "TRX adresi ve mnemonic key gereklidir"));
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return next(createError(404, "Kullanıcı bulunamadı"));
    }

    user.cryptoPayment = {
      trxAddress,
      mnemonicKey,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Kripto ödeme bilgileri başarıyla güncellendi",
    });
  } catch (error) {
    logger.error("Error updating crypto details:", error);
    next(
      createError(500, "Kripto ödeme bilgileri güncellenirken bir hata oluştu")
    );
  }
};

// Get user's financial summary
exports.getFinancialSummary = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "earnings withdrawals deliveryCount commissionRate transactions"
    );

    if (!user) {
      return next(createError(404, "Kullanıcı bulunamadı"));
    }

    const netEarnings = user.getNetEarnings();

    res.status(200).json({
      success: true,
      data: {
        earnings: user.earnings,
        netEarnings,
        withdrawals: user.withdrawals,
        deliveryCount: user.deliveryCount,
        commissionRate: user.commissionRate,
        recentTransactions: user.transactions.slice(-5).reverse(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(createError(400, "Mevcut şifre ve yeni şifre gereklidir"));
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return next(createError(404, "Kullanıcı bulunamadı"));
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return next(createError(400, "Mevcut şifre yanlış"));
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Şifreniz başarıyla güncellendi",
    });
  } catch (error) {
    logger.error("Error changing password:", error);
    next(createError(500, "Şifre değiştirme işlemi sırasında bir hata oluştu"));
  }
};
