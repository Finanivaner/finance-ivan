const mongoose = require("mongoose");
require("dotenv").config();

const db = mongoose.connection;

// Bağlantı olaylarını dinle
db.once("open", () => {
  console.log("✅ MongoDB Bağlantısı Başarılı");
});

db.on("error", (error) => {
  console.error("❌ MongoDB Bağlantı Hatası:", error);
  process.exit(1);
});

db.on("disconnected", () => {
  console.log("⚠️ MongoDB Bağlantısı Kesildi");
});

db.on("reconnected", () => {
  console.log("✅ MongoDB Yeniden Bağlandı");
});

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // IPv4'ü zorla
      maxPoolSize: 10,
      connectTimeoutMS: 10000,
    };

    // MongoDB URI'nin varlığını kontrol et
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error("MONGODB_URI çevre değişkeni tanımlanmamış!");
    }

    console.log("📡 MongoDB'ye bağlanılıyor...");
    await mongoose.connect(mongoURI, options);
  } catch (error) {
    console.error("❌ MongoDB Bağlantı Hatası:");
    if (error.name === "MongooseServerSelectionError") {
      console.error(
        "🔍 Detay: MongoDB sunucusuna erişilemiyor. Lütfen şunları kontrol edin:"
      );
      console.error("  - MongoDB servisinin çalışır durumda olduğunu");
      console.error("  - Bağlantı URI'sinin doğru olduğunu");
      console.error("  - Ağ bağlantınızın aktif olduğunu");
      console.error("  - Güvenlik duvarı ayarlarını");
    } else {
      console.error("🔍 Hata Detayı:", error.message);
    }
    process.exit(1);
  }
};

module.exports = {
  connectDB,
};
