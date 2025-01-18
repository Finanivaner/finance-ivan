require("dotenv").config();

// Zorunlu çevre değişkenlerinin kontrolü
const requiredEnvs = ["PORT", "MONGODB_URI", "JWT_SECRET"];
requiredEnvs.forEach((env) => {
  if (!process.env[env]) {
    console.error(`❌ Hata: ${env} çevre değişkeni tanımlanmamış!`);
    process.exit(1);
  }
});

module.exports = {
  port: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || "24h",
  nodeEnv: process.env.NODE_ENV || "development",
};
