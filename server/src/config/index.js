require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI:
    process.env.MONGODB_URI ||
    "mongodb+srv://brovski:lmpFdQkGqdC8yce5@darkage.5dbmr.mongodb.net/finance_management",
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "1d",
  NODE_ENV: process.env.NODE_ENV || "development",
};