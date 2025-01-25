const Accounting = require("../models/accounting.model");
const User = require("../models/user.model");
const logger = require("../utils/logger");
const createError = require("../utils/createError");

// Add new accounting entry
exports.addEntry = async (req, res, next) => {
  try {
    const { type, amount, description } = req.body;

    const entry = new Accounting({
      type,
      amount,
      description,
      addedBy: req.user.id,
    });

    await entry.save();
    logger.info(`New accounting entry added by admin ${req.user.id}: ${type}`);

    res.status(201).json({
      success: true,
      data: entry,
      message: "Muhasebe kaydı başarıyla eklendi",
    });
  } catch (error) {
    logger.error("Error adding accounting entry:", error);
    next(createError(500, "Muhasebe kaydı eklenirken bir hata oluştu"));
  }
};

// Get accounting entries by type and date range
exports.getEntries = async (req, res, next) => {
  try {
    const { type, startDate, endDate } = req.query;
    const query = {};

    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const entries = await Accounting.find(query)
      .sort({ date: -1 })
      .populate("addedBy", "username");

    // Calculate totals
    const totals = {
      office_income: 0,
      office_expense: 0,
      system_revenue: 0,
      system_expense: 0,
    };

    entries.forEach((entry) => {
      totals[entry.type] += entry.amount;
    });

    // Get user earnings with details
    const users = await User.find(
      { earnings: { $gt: 0 } },
      "username earnings createdAt"
    ).sort({ earnings: -1 });

    const userEarningsDetails = users.map((user) => ({
      username: user.username,
      earnings: user.earnings,
      date: user.createdAt,
    }));

    const totalUserEarnings = users.reduce(
      (sum, user) => sum + (user.earnings || 0),
      0
    );

    res.status(200).json({
      success: true,
      data: {
        entries,
        totals,
        office_net: totals.office_income - totals.office_expense,
        system_net: totals.system_revenue - totals.system_expense,
        user_earnings: {
          total: totalUserEarnings,
          details: userEarningsDetails,
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching accounting entries:", error);
    next(createError(500, "Muhasebe kayıtları getirilirken bir hata oluştu"));
  }
};

// Delete accounting entry
exports.deleteEntry = async (req, res, next) => {
  try {
    const entry = await Accounting.findByIdAndDelete(req.params.id);

    if (!entry) {
      return next(createError(404, "Muhasebe kaydı bulunamadı"));
    }

    logger.info(
      `Accounting entry deleted by admin ${req.user.id}: ${entry._id}`
    );

    res.status(200).json({
      success: true,
      message: "Muhasebe kaydı başarıyla silindi",
    });
  } catch (error) {
    logger.error("Error deleting accounting entry:", error);
    next(createError(500, "Muhasebe kaydı silinirken bir hata oluştu"));
  }
};

// Update accounting entry
exports.updateEntry = async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    const entry = await Accounting.findByIdAndUpdate(
      req.params.id,
      { amount, description },
      { new: true }
    );

    if (!entry) {
      return next(createError(404, "Muhasebe kaydı bulunamadı"));
    }

    logger.info(
      `Accounting entry updated by admin ${req.user.id}: ${entry._id}`
    );

    res.status(200).json({
      success: true,
      data: entry,
      message: "Muhasebe kaydı başarıyla güncellendi",
    });
  } catch (error) {
    logger.error("Error updating accounting entry:", error);
    next(createError(500, "Muhasebe kaydı güncellenirken bir hata oluştu"));
  }
};
