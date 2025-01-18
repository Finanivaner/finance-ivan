const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Kullanıcı adı zorunludur"],
    unique: true,
    trim: true,
    minlength: [3, "Kullanıcı adı en az 3 karakter olmalıdır"],
  },
  password: {
    type: String,
    required: [true, "Şifre zorunludur"],
    minlength: [6, "Şifre en az 6 karakter olmalıdır"],
    select: false,
  },
  email: {
    type: String,
    required: [true, "Email zorunludur"],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Geçerli bir email adresi giriniz"],
  },
  role: {
    type: String,
    default: "admin",
    immutable: true,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Şifre hashleme middleware
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Şifre karşılaştırma metodu
adminSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
