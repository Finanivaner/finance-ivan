const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/user.model");
const Admin = require("../models/Admin");
const { createError } = require("../utils/error");

/**
 * Protect routes - Verify JWT token
 */
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return next(
        createError(401, "Yetkilendirme başarısız. Lütfen giriş yapın.")
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return next(
        createError(401, "Yetkilendirme başarısız. Lütfen giriş yapın.")
      );
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);

      // Get user from database - check both User and Admin models
      let user;
      if (decoded.role === "admin") {
        user = await Admin.findById(decoded.id);
      } else {
        user = await User.findById(decoded.id);
      }

      if (!user) {
        return next(createError(401, "Bu token'a ait kullanıcı bulunamadı."));
      }

      // Add user to request
      req.user = user;
      next();
    } catch (err) {
      if (err.name === "JsonWebTokenError") {
        return next(createError(401, "Geçersiz token."));
      }
      if (err.name === "TokenExpiredError") {
        return next(
          createError(401, "Oturum süresi doldu. Lütfen tekrar giriş yapın.")
        );
      }
      throw err;
    }
  } catch (error) {
    next(createError(500, "Yetkilendirme hatası."));
  }
};

/**
 * Authorize roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        createError(403, `${req.user.role} rolü bu işlem için yetkili değil.`)
      );
    }
    next();
  };
};

/**
 * Verify admin role
 */
exports.verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(createError(403, "Bu işlem için admin yetkisi gerekiyor."));
  }
  next();
};

// For backward compatibility
exports.verifyToken = exports.protect;
