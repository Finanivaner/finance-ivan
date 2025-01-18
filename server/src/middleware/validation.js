const { body } = require("express-validator");

const registerValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Kullanıcı adı zorunludur")
    .isLength({ min: 3 })
    .withMessage("Kullanıcı adı en az 3 karakter olmalıdır")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email adresi zorunludur")
    .isEmail()
    .withMessage("Geçerli bir email adresi giriniz"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Şifre zorunludur")
    .isLength({ min: 6 })
    .withMessage("Şifre en az 6 karakter olmalıdır")
    .matches(/\d/)
    .withMessage("Şifre en az bir rakam içermelidir")
    .matches(/[a-z]/)
    .withMessage("Şifre en az bir küçük harf içermelidir")
    .matches(/[A-Z]/)
    .withMessage("Şifre en az bir büyük harf içermelidir"),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email adresi zorunludur")
    .isEmail()
    .withMessage("Geçerli bir email adresi giriniz"),

  body("password").trim().notEmpty().withMessage("Şifre zorunludur"),

  body("role")
    .trim()
    .notEmpty()
    .withMessage("Rol bilgisi zorunludur")
    .isIn(["user", "manager", "admin"])
    .withMessage("Geçersiz rol"),
];

module.exports = {
  registerValidation,
  loginValidation,
};
