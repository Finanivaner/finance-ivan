const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const AppError = require("../utils/appError");

// Dosya tipi kontrolü
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError("Sadece JPEG, JPG ve PNG dosyaları yüklenebilir.", 400),
      false
    );
  }
};

// Storage konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/verification");
  },
  filename: (req, file, cb) => {
    // Güvenli dosya adı oluşturma
    const randomName = crypto.randomBytes(16).toString("hex");
    cb(null, `${randomName}${path.extname(file.originalname)}`);
  },
});

// Multer konfigürasyonu
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// ID kartı yükleme middleware'i
const uploadIdCards = upload.fields([
  { name: "idCardFront", maxCount: 1 },
  { name: "idCardBack", maxCount: 1 },
]);

// Hata yakalama middleware'i
const handleUpload = (req, res, next) => {
  uploadIdCards(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new AppError("Dosya boyutu 5MB'dan büyük olamaz.", 400));
      }
      return next(new AppError("Dosya yükleme hatası.", 400));
    } else if (err) {
      return next(err);
    }

    // Dosyalar yüklendi mi kontrolü
    if (!req.files?.idCardFront || !req.files?.idCardBack) {
      return next(
        new AppError(
          "Lütfen kimlik kartınızın ön ve arka yüzünü yükleyin.",
          400
        )
      );
    }

    next();
  });
};

module.exports = {
  handleUpload,
};
