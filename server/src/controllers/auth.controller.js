const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/user.model");
const Admin = require("../models/Admin");
const config = require("../config/config");
const logger = require("../utils/logger");
const AppError = require("../utils/appError");

// Generate JWT Token
const generateToken = (user) => {
  try {
    return jwt.sign(
      {
        id: user._id,
        role: user.role,
        username: user.username,
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRE }
    );
  } catch (error) {
    logger.error("Token oluşturma hatası:", error);
    throw new AppError("Kimlik doğrulama hatası", 500);
  }
};

// Validation sonuçlarını kontrol et
const checkValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors
      .array()
      .map((err) => err.msg)
      .join(", ");
    throw new AppError(messages, 400, errors.array());
  }
};

// Admin login controller
exports.adminLogin = async (req, res) => {
  try {
    checkValidation(req);

    const { username, password } = req.body;
    logger.info(`Admin giriş denemesi: ${username}`);

    // Find admin by username
    const admin = await Admin.findOne({ username }).select("+password");
    if (!admin) {
      logger.warn(`Başarısız admin girişi - Kullanıcı bulunamadı: ${username}`);
      return res.error(null, "Kullanıcı adı veya şifre hatalı", 401);
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      logger.warn(`Başarısız admin girişi - Yanlış şifre: ${username}`);
      return res.error(null, "Kullanıcı adı veya şifre hatalı", 401);
    }

    // Check if admin is active
    if (!admin.isActive) {
      logger.warn(`Devre dışı admin hesabı giriş denemesi: ${username}`);
      return res.error(null, "Bu hesap devre dışı bırakılmış", 401);
    }

    // Update last login
    admin.lastLogin = Date.now();
    await admin.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(admin);
    logger.info(`Başarılı admin girişi: ${username}`);

    // Send response
    return res.success(
      {
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          lastLogin: admin.lastLogin,
        },
      },
      "Giriş başarılı"
    );
  } catch (error) {
    logger.error("Admin giriş hatası:", error);
    return res.error(
      error,
      error instanceof AppError
        ? error.message
        : "Giriş yapılırken bir hata oluştu",
      error.statusCode || 500
    );
  }
};

// Login controller for all roles
exports.login = async (req, res) => {
  try {
    checkValidation(req);

    const { email, password, role } = req.body;
    logger.info(`Kullanıcı giriş denemesi: ${email} (${role})`);

    // Find user by email and role
    const user = await User.findOne({ email, role }).select("+password");
    if (!user) {
      logger.warn(
        `Başarısız kullanıcı girişi - Kullanıcı bulunamadı: ${email}`
      );
      return res.error(null, "Geçersiz kimlik bilgileri", 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn(`Başarısız kullanıcı girişi - Yanlış şifre: ${email}`);
      return res.error(null, "Geçersiz kimlik bilgileri", 401);
    }

    // Generate token for both verified and unverified users
    const token = generateToken(user);

    // Check verification status for user role
    if (user.role === "user" && !user.isVerified) {
      const verificationStatus = {
        pending:
          "Hesabınız henüz doğrulanmamış. Lütfen kimlik belgelerinizi yükleyin.",
        submitted: "Hesabınız inceleme aşamasında. Lütfen onay bekleyin.",
        rejected: `Hesabınız reddedildi. Sebep: ${user.rejectionReason || "Belirtilmemiş"}`,
      };

      logger.info(
        `Doğrulanmamış kullanıcı girişi: ${email} (${user.verificationStatus})`
      );

      // Return error with token and user data
      return res.error(
        {
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            verificationStatus: user.verificationStatus,
            rejectionReason: user.rejectionReason,
          },
        },
        verificationStatus[user.verificationStatus] ||
          "Hesabınız doğrulanmamış",
        403
      );
    }

    // For verified users, send success response
    return res.success(
      {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          verificationStatus: user.verificationStatus,
        },
      },
      "Giriş başarılı"
    );
  } catch (error) {
    logger.error("Kullanıcı giriş hatası:", error);
    return res.error(
      error,
      error instanceof AppError
        ? error.message
        : "Giriş yapılırken bir hata oluştu",
      error.statusCode || 500
    );
  }
};

// Register controller
exports.register = async (req, res) => {
  try {
    checkValidation(req);

    const { username, email, password, role } = req.body;
    logger.info(`Yeni kayıt denemesi: ${email}`);

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      logger.warn(`Kayıt başarısız - Kullanıcı zaten mevcut: ${email}`);
      return res.error(
        null,
        existingUser.email === email
          ? "Bu email adresi zaten kullanımda"
          : "Bu kullanıcı adı zaten kullanımda",
        400
      );
    }

    // Create user
    const user = new User({
      username,
      email,
      password,
      role: role || "user",
    });

    await user.save();
    logger.info(`Yeni kullanıcı kaydedildi: ${email} (${user.role})`);

    // Generate token
    const token = generateToken(user);

    // Send response
    return res.success(
      {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      "Kayıt başarılı",
      201
    );
  } catch (error) {
    logger.error("Kayıt hatası:", error);
    return res.error(
      error,
      error instanceof AppError
        ? error.message
        : "Kayıt sırasında bir hata oluştu",
      error.statusCode || 500
    );
  }
};
