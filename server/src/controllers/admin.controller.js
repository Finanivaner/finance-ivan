const User = require("../models/user.model");
const logger = require("../utils/logger");
const createError = require("../utils/createError");

const getAllUsers = async (req, res, next) => {
  try {
    logger.info("Admin fetching all users");

    const users = await User.find()
      .select([
        "username",
        "email",
        "isActive",
        "isVerified",
        "verificationStatus",
        "createdAt",
        "lastLogin",
        "ibanPayment",
        "cryptoPayment",
      ])
      .sort({ createdAt: -1 });

    const stats = {
      total: users.length,
      pending: users.filter((user) => user.verificationStatus === "pending")
        .length,
      approved: users.filter((user) => user.verificationStatus === "approved")
        .length,
      rejected: users.filter((user) => user.verificationStatus === "rejected")
        .length,
    };

    res.status(200).json({
      success: true,
      data: {
        users,
        stats,
      },
      message: "Kullanıcılar başarıyla getirildi",
    });
  } catch (error) {
    logger.error(`Error fetching users: ${error.message}`);
    next(error);
  }
};

const getUserDetails = async (req, res, next) => {
  try {
    logger.info(`Admin requesting user details for: ${req.params.userId}`);

    const user = await User.findById(req.params.userId).select(
      "-password -cryptoPayment.mnemonicKey"
    );

    if (!user) {
      return next(createError(404, "Kullanıcı bulunamadı"));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error("Error fetching user details:", error);
    next(createError(500, "Kullanıcı detayları getirilirken bir hata oluştu"));
  }
};

const updateUserFinances = async (req, res, next) => {
  try {
    const { earnings, withdrawals, deliveryCount } = req.body;
    const userId = req.params.userId;

    logger.info(`Admin updating finances for user: ${userId}`);

    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "Kullanıcı bulunamadı"));
    }

    const adminUser = req.user;
    const now = new Date();
    const changes = [];

    // Record changes in earnings
    if (typeof earnings === "number" && earnings !== user.earnings) {
      const difference = earnings - user.earnings;
      const formattedOld = user.earnings.toLocaleString("tr-TR", {
        style: "currency",
        currency: "TRY",
      });
      const formattedNew = earnings.toLocaleString("tr-TR", {
        style: "currency",
        currency: "TRY",
      });

      user.transactions.push({
        type: "earning",
        amount: Math.abs(difference),
        status: "completed",
        date: now,
        description: `Kazanç ${formattedOld} değerinden ${formattedNew} değerine ${difference > 0 ? "arttırıldı" : "azaltıldı"}`,
        adminAction: true,
        adminId: adminUser._id,
        previousValue: user.earnings,
        newValue: earnings,
      });
      changes.push(`kazanç: ${formattedOld} → ${formattedNew}`);
      user.earnings = earnings;
    }

    // Record changes in withdrawals
    if (typeof withdrawals === "number" && withdrawals !== user.withdrawals) {
      const difference = withdrawals - user.withdrawals;
      const formattedOld = user.withdrawals.toLocaleString("tr-TR", {
        style: "currency",
        currency: "TRY",
      });
      const formattedNew = withdrawals.toLocaleString("tr-TR", {
        style: "currency",
        currency: "TRY",
      });

      user.transactions.push({
        type: "withdrawal",
        amount: Math.abs(difference),
        status: "completed",
        date: now,
        description: `Çekim ${formattedOld} değerinden ${formattedNew} değerine ${difference > 0 ? "arttırıldı" : "azaltıldı"}`,
        adminAction: true,
        adminId: adminUser._id,
        previousValue: user.withdrawals,
        newValue: withdrawals,
      });
      changes.push(`çekim: ${formattedOld} → ${formattedNew}`);
      user.withdrawals = withdrawals;
    }

    // Record changes in delivery count
    if (
      typeof deliveryCount === "number" &&
      deliveryCount !== user.deliveryCount
    ) {
      const difference = deliveryCount - user.deliveryCount;
      user.transactions.push({
        type: "delivery",
        amount: 0,
        status: "completed",
        date: now,
        description: `Teslimat sayısı ${user.deliveryCount}'den ${deliveryCount}'e ${difference > 0 ? "arttırıldı" : "azaltıldı"}`,
        adminAction: true,
        adminId: adminUser._id,
        previousValue: user.deliveryCount,
        newValue: deliveryCount,
      });
      changes.push(`teslimat: ${user.deliveryCount} → ${deliveryCount}`);
      user.deliveryCount = deliveryCount;
    }

    if (changes.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Değişiklik yapılmadı",
        data: user,
      });
    }

    await user.save();
    logger.info(
      `Admin ${adminUser.username} updated user ${user.username} finances: ${changes.join(", ")}`
    );

    res.status(200).json({
      success: true,
      message: "Kullanıcı finansal bilgileri başarıyla güncellendi",
      data: user,
    });
  } catch (error) {
    logger.error("Error updating user finances:", error);
    next(createError(500, "Finansal bilgiler güncellenirken bir hata oluştu"));
  }
};

const getUserTransactions = async (req, res, next) => {
  try {
    logger.info(`Admin requesting transactions for user: ${req.params.userId}`);

    const user = await User.findById(req.params.userId).select("transactions");

    if (!user) {
      return next(createError(404, "Kullanıcı bulunamadı"));
    }

    res.status(200).json({
      success: true,
      data: user.transactions.sort((a, b) => b.date - a.date),
    });
  } catch (error) {
    logger.error("Error fetching user transactions:", error);
    next(createError(500, "İşlem geçmişi getirilirken bir hata oluştu"));
  }
};

const getUserVerification = async (req, res, next) => {
  try {
    logger.info(
      `Admin requesting verification documents for user: ${req.params.userId}`
    );

    const user = await User.findById(req.params.userId).select(
      "verificationDocuments verificationStatus"
    );

    if (!user) {
      return next(createError(404, "Kullanıcı bulunamadı"));
    }

    if (
      !user.verificationDocuments ||
      !user.verificationDocuments.idCardFront ||
      !user.verificationDocuments.idCardBack
    ) {
      return next(createError(404, "Doğrulama belgeleri bulunamadı"));
    }

    // Construct full URLs for the images
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const frontImage = `${baseUrl}/${user.verificationDocuments.idCardFront.replace(/\\/g, "/")}`;
    const backImage = `${baseUrl}/${user.verificationDocuments.idCardBack.replace(/\\/g, "/")}`;

    res.status(200).json({
      success: true,
      data: {
        frontImage,
        backImage,
        status: user.verificationStatus,
      },
      message: "Doğrulama belgeleri başarıyla getirildi",
    });
  } catch (error) {
    logger.error("Error fetching verification documents:", error);
    next(createError(500, "Doğrulama belgeleri getirilirken bir hata oluştu"));
  }
};

const updateVerificationStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { action } = req.body;

    logger.info(
      `Admin updating verification status for user: ${userId}, action: ${action}`
    );

    if (!["approve", "reject"].includes(action)) {
      return next(createError(400, "Geçersiz işlem"));
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(createError(404, "Kullanıcı bulunamadı"));
    }

    const now = new Date();

    if (action === "approve") {
      user.verificationStatus = "approved";
      user.isVerified = true;
      user.verificationApprovedAt = now;
    } else {
      user.verificationStatus = "rejected";
      user.isVerified = false;
      user.verificationRejectedAt = now;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: `Kullanıcı doğrulama durumu başarıyla ${action === "approve" ? "onaylandı" : "reddedildi"}`,
    });
  } catch (error) {
    logger.error("Error updating verification status:", error);
    next(createError(500, "Doğrulama durumu güncellenirken bir hata oluştu"));
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    logger.info("Admin requesting dashboard statistics");

    const [totalUsers, verifiedUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
    ]);

    // Get recent activities
    const recentActivities = await User.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("username email createdAt");

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          verifiedUsers,
        },
        recentActivities,
      },
      message: "Dashboard verileri başarıyla getirildi",
    });
  } catch (error) {
    logger.error("Error fetching dashboard stats:", error);
    next(createError(500, "Dashboard verileri getirilirken bir hata oluştu"));
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    logger.info(`Admin attempting to delete user: ${userId}`);

    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "Kullanıcı bulunamadı"));
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Kullanıcı başarıyla silindi",
    });
  } catch (error) {
    logger.error(`Error deleting user: ${error.message}`);
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    logger.info(`Admin attempting to update user: ${userId}`);

    // Remove sensitive fields that shouldn't be updated directly
    delete updates.password;
    delete updates.role;

    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "Kullanıcı bulunamadı"));
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "Kullanıcı bilgileri başarıyla güncellendi",
    });
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserDetails,
  updateUserFinances,
  getUserTransactions,
  getUserVerification,
  updateVerificationStatus,
  getDashboardStats,
  deleteUser,
  updateUser,
};
