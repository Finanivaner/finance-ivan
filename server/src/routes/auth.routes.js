const express = require("express");
const { check } = require("express-validator");
const authController = require("../controllers/auth.controller");

const router = express.Router();

// Admin login validation
const adminLoginValidation = [
  check("username", "Lütfen geçerli bir kullanıcı adı girin").not().isEmpty(),
  check("password", "Şifre zorunludur").exists(),
];

// User login validation
const userLoginValidation = [
  check("email", "Lütfen geçerli bir email adresi girin").isEmail(),
  check("password", "Şifre zorunludur").exists(),
  check("role", "Geçersiz rol").isIn(["user", "manager", "admin"]),
];

// Register validation
const registerValidation = [
  check("username", "Kullanıcı adı zorunludur").not().isEmpty(),
  check("email", "Lütfen geçerli bir email adresi girin").isEmail(),
  check("password", "Şifre en az 6 karakter olmalıdır").isLength({ min: 6 }),
  check("role").optional().isIn(["user", "manager", "admin"]),
];

// Manager login validation
const managerLoginValidation = [
  check("username", "Lütfen geçerli bir kullanıcı adı girin").not().isEmpty(),
  check("password", "Şifre zorunludur").exists(),
];

// Auth routes
router.post("/admin/login", adminLoginValidation, authController.adminLogin);
router.post("/login", userLoginValidation, authController.login);
router.post("/register", registerValidation, authController.register);
router.post(
  "/manager/login",
  managerLoginValidation,
  authController.managerLogin
);

module.exports = router;
