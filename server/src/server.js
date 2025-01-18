const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs").promises;
const { connectDB } = require("./config/database");
const config = require("./config/config");
const logger = require("./utils/logger");
const { responseMiddleware } = require("./middleware/responseHandler");
const createError = require("http-errors");

// Routes
const authRoutes = require("./routes/auth.routes");
const verificationRoutes = require("./routes/verification.routes");
const adminVerificationRoutes = require("./routes/admin/verification.routes");
const adminRoutes = require("./routes/admin.routes");
const userRoutes = require("./routes/user.routes");
const deliveryRoutes = require("./routes/delivery.routes");

class Server {
  constructor() {
    this.app = express();
    this.setupDirectories();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  async setupDirectories() {
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, "../uploads");
      const receiptsDir = path.join(uploadsDir, "receipts");

      await fs.mkdir(uploadsDir, { recursive: true });
      await fs.mkdir(receiptsDir, { recursive: true });

      logger.info("✅ Upload directories created successfully");
    } catch (error) {
      logger.error("❌ Error creating upload directories:", error);
    }
  }

  setupMiddleware() {
    // Güvenlik Middleware'leri
    this.app.use(
      helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
      })
    );

    // CORS ayarları
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    // Serve static files
    this.app.use(
      "/uploads",
      express.static(path.join(__dirname, "../uploads"))
    );

    // Body parsing
    this.app.use(express.json({ limit: "10kb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10kb" }));

    // Request logging
    if (process.env.NODE_ENV === "development") {
      this.app.use(morgan("dev"));
    } else {
      this.app.use(
        morgan("combined", {
          stream: { write: (message) => logger.info(message.trim()) },
        })
      );
    }

    // Rate Limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 dakika
      max: 100, // her IP için 15 dakikada maksimum 100 istek
      message: "Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.",
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use("/api/", limiter);

    // Response handler
    this.app.use(responseMiddleware);
  }

  setupRoutes() {
    // API Routes
    this.app.use("/api/auth", authRoutes);
    this.app.use("/api/verification", verificationRoutes);
    this.app.use("/api/admin", adminRoutes);
    this.app.use("/api/admin/verification", adminVerificationRoutes);
    this.app.use("/api/users", userRoutes);
    this.app.use("/api/delivery", deliveryRoutes);

    // Ana route
    this.app.get("/", (req, res) => {
      res.success(null, "Finans Yönetim Sistemi API'sine Hoş Geldiniz");
    });

    // 404 handler
    this.app.all("*", (req, res) => {
      res.error(null, `${req.originalUrl} - Bu endpoint bulunamadı`, 404);
    });
  }

  setupErrorHandling() {
    // Global error handler
    this.app.use((err, req, res, next) => {
      err.statusCode = err.statusCode || 500;
      err.status = err.status || "error";

      if (process.env.NODE_ENV === "development") {
        logger.error("❌ Hata detayı:", {
          message: err.message,
          stack: err.stack,
          status: err.status,
          statusCode: err.statusCode,
        });

        res.error(err, err.message, err.statusCode);
      } else {
        // Production'da stack trace'i gizle
        logger.error("❌ Hata:", {
          message: err.message,
          status: err.status,
          statusCode: err.statusCode,
        });

        // Operational, trusted error: send message to client
        if (err.isOperational) {
          res.error(null, err.message, err.statusCode);
        }
        // Programming or other unknown error: don't leak error details
        else {
          res.error(null, "Bir hata oluştu", 500);
        }
      }
    });
  }

  async start() {
    try {
      // Veritabanı bağlantısı
      await connectDB();

      // Sunucuyu başlat
      const port = config.port || 5000;
      this.app.listen(port, () => {
        logger.info(`✅ Sunucu ${port} portunda çalışıyor`);
        logger.info(`🌍 Ortam: ${config.nodeEnv}`);
      });
    } catch (error) {
      logger.error("❌ Sunucu başlatma hatası:", error);
      process.exit(1);
    }
  }
}

// Sunucuyu oluştur ve başlat
const server = new Server();
server.start();
