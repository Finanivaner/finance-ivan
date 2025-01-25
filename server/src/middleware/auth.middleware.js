const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/user.model");
const Admin = require("../models/Admin");
const Manager = require("../models/manager.model");
const { createError } = require("../utils/error");

/**
 * Protect routes - Verify JWT token
 */
exports.protect = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return next(createError(401, "Lütfen giriş yapın"));
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (!decoded) {
      return next(createError(401, "Geçersiz token"));
    }

    // Get user based on role
    let user;
    const userId = decoded.id || decoded._id;

    if (decoded.role === "admin") {
      user = await Admin.findById(userId);
    } else if (decoded.role === "manager") {
      user = await Manager.findById(userId);
    } else {
      user = await User.findById(userId);
    }

    if (!user) {
      return next(createError(401, "Token'a ait kullanıcı bulunamadı"));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(createError(401, "Hesabınız pasif durumdadır"));
    }

    // Add user and role to request
    req.user = user;
    req.role = decoded.role || user.role;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(createError(401, "Geçersiz token"));
    }
    if (error.name === "TokenExpiredError") {
      return next(createError(401, "Oturum süresi doldu"));
    }
    next(error);
  }
};

/**
 * Authorize roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user.role || !roles.includes(req.user.role)) {
      return next(
        createError(
          403,
          `${req.user.role || "Bilinmeyen"} rolü bu işlem için yetkili değil.`
        )
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
