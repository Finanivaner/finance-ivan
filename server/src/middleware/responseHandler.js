const logger = require("../utils/logger");

// Başarılı response'lar için
exports.success = (req, res, data, message = "İşlem başarılı", code = 200) => {
  logger.info(`[${req.method}] ${req.originalUrl} - ${code} ${message}`);
  logger.debug("Response data:", data);

  res.status(code).json({
    success: true,
    message,
    data,
  });
};

// Hata response'ları için
exports.error = (req, res, error, message = "Bir hata oluştu", code = 500) => {
  logger.error(`[${req.method}] ${req.originalUrl} - ${code} ${message}`, {
    error,
  });
  logger.debug("Error details:", { error, message, code });

  res.status(code).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? error : undefined,
  });
};

// Response middleware
exports.responseMiddleware = (req, res, next) => {
  res.success = (data, message, code) =>
    exports.success(req, res, data, message, code);
  res.error = (error, message, code) =>
    exports.error(req, res, error, message, code);
  next();
};
