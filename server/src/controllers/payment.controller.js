const User = require("../models/user.model");
const createError = require("../utils/createError");
const logger = require("../utils/logger");

// Get IBAN payment details
exports.getIbanDetails = async (req, res, next) => {
  try {
    logger.info(`Fetching IBAN details for user: ${req.user._id}`);

    const user = await User.findById(req.user._id).select("ibanPayment");

    if (!user) {
      logger.error(`User not found: ${req.user._id}`);
      return next(createError(404, "Kullanıcı bulunamadı"));
    }

    res.status(200).json({
      success: true,
      data: {
        ibanPayment: user.ibanPayment || null,
      },
      message: "IBAN bilgileri başarıyla getirildi",
    });
  } catch (error) {
    logger.error(`Error fetching IBAN details: ${error.message}`);
    next(error);
  }
};

// Update IBAN payment details
exports.updateIbanDetails = async (req, res, next) => {
  try {
    const { fullName, iban, bankName } = req.body;

    if (!fullName || !iban || !bankName) {
      return next(createError(400, "Lütfen tüm alanları doldurun"));
    }

    logger.info(`Updating IBAN details for user: ${req.user._id}`);

    const user = await User.findById(req.user._id);

    if (!user) {
      logger.error(`User not found: ${req.user._id}`);
      return next(createError(404, "Kullanıcı bulunamadı"));
    }

    user.ibanPayment = {
      fullName,
      iban,
      bankName,
    };

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        ibanPayment: user.ibanPayment,
      },
      message: "IBAN bilgileri başarıyla güncellendi",
    });
  } catch (error) {
    logger.error(`Error updating IBAN details: ${error.message}`);
    next(error);
  }
};
