const Manager = require("../models/manager.model");
const logger = require("../utils/logger");
const createError = require("../utils/createError");
const User = require("../models/user.model");

// Get all managers
const getAllManagers = async (req, res, next) => {
  try {
    logger.info("Fetching all managers");
    const managers = await Manager.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: managers,
      message: "Yöneticiler başarıyla getirildi",
    });
  } catch (error) {
    logger.error(`Error fetching managers: ${error.message}`);
    next(error);
  }
};

// Get manager by ID
const getManagerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info(`Fetching manager with ID: ${id}`);

    const manager = await Manager.findById(id).select("-password");
    if (!manager) {
      return next(createError(404, "Yönetici bulunamadı"));
    }

    res.status(200).json({
      success: true,
      data: manager,
      message: "Yönetici başarıyla getirildi",
    });
  } catch (error) {
    logger.error(`Error fetching manager: ${error.message}`);
    next(error);
  }
};

// Create new manager
const createManager = async (req, res, next) => {
  try {
    logger.info("Creating new manager");
    const { username, email, password, fullName, permissions } = req.body;

    // Check if manager with same username or email exists
    const existingManager = await Manager.findOne({
      $or: [{ username }, { email }],
    });

    if (existingManager) {
      return next(
        createError(400, "Bu kullanıcı adı veya email zaten kullanılıyor")
      );
    }

    const manager = await Manager.create({
      username,
      email,
      password,
      fullName,
      permissions,
      createdBy: req.user._id,
    });

    // Remove password from response
    manager.password = undefined;

    res.status(201).json({
      success: true,
      data: manager,
      message: "Yönetici başarıyla oluşturuldu",
    });
  } catch (error) {
    logger.error(`Error creating manager: ${error.message}`);
    next(error);
  }
};

// Update manager
const updateManager = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    logger.info(`Updating manager with ID: ${id}`);

    // Remove password from updates
    delete updates.password;

    const manager = await Manager.findById(id);
    if (!manager) {
      return next(createError(404, "Yönetici bulunamadı"));
    }

    // Check if username or email is being updated and if it's already in use
    if (updates.username || updates.email) {
      const existingManager = await Manager.findOne({
        _id: { $ne: id },
        $or: [
          { username: updates.username || "" },
          { email: updates.email || "" },
        ],
      });

      if (existingManager) {
        return next(
          createError(400, "Bu kullanıcı adı veya email zaten kullanılıyor")
        );
      }
    }

    // Validate financial fields
    if (updates.totalEarnings !== undefined && updates.totalEarnings < 0) {
      return next(createError(400, "Toplam kazanç negatif olamaz"));
    }
    if (
      updates.totalWithdrawals !== undefined &&
      updates.totalWithdrawals < 0
    ) {
      return next(createError(400, "Toplam çekim negatif olamaz"));
    }
    if (
      updates.commissionRate !== undefined &&
      (updates.commissionRate < 0 || updates.commissionRate > 100)
    ) {
      return next(createError(400, "Komisyon oranı 0-100 arasında olmalıdır"));
    }

    const updatedManager = await Manager.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      data: updatedManager,
      message: "Yönetici başarıyla güncellendi",
    });
  } catch (error) {
    logger.error(`Error updating manager: ${error.message}`);
    next(error);
  }
};

// Delete manager
const deleteManager = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info(`Deleting manager with ID: ${id}`);

    const manager = await Manager.findById(id);
    if (!manager) {
      return next(createError(404, "Yönetici bulunamadı"));
    }

    await Manager.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Yönetici başarıyla silindi",
    });
  } catch (error) {
    logger.error(`Error deleting manager: ${error.message}`);
    next(error);
  }
};

// Update manager permissions
const updateManagerPermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    logger.info(`Updating permissions for manager with ID: ${id}`);

    const manager = await Manager.findById(id);
    if (!manager) {
      return next(createError(404, "Yönetici bulunamadı"));
    }

    const updatedManager = await Manager.findByIdAndUpdate(
      id,
      { $set: { permissions } },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      data: updatedManager,
      message: "Yönetici yetkileri başarıyla güncellendi",
    });
  } catch (error) {
    logger.error(`Error updating manager permissions: ${error.message}`);
    next(error);
  }
};

const getManagerStats = async (req, res, next) => {
  try {
    const manager = await Manager.findById(req.user._id);
    if (!manager) {
      return next(createError(404, "Yönetici bulunamadı"));
    }

    const totalEarnings = manager.totalEarnings || 0;
    const totalWithdrawals = manager.totalWithdrawals || 0;
    const commissionRate = manager.commissionRate || 10;

    // Calculate commission amount
    const commissionAmount = (totalEarnings * commissionRate) / 100;

    // Calculate withdrawable amount (total earnings - commission - total withdrawals)
    const withdrawableAmount =
      totalEarnings - commissionAmount - totalWithdrawals;

    res.status(200).json({
      status: "success",
      data: {
        totalEarnings: totalEarnings,
        totalWithdrawals: totalWithdrawals,
        commissionRate: commissionRate,
        withdrawableAmount: Math.max(0, withdrawableAmount), // Ensure it's not negative
      },
    });
  } catch (err) {
    logger.error("Yönetici istatistikleri alınırken hata:", err);
    next(err);
  }
};

module.exports = {
  getAllManagers,
  getManagerById,
  createManager,
  updateManager,
  deleteManager,
  updateManagerPermissions,
  getManagerStats,
};
