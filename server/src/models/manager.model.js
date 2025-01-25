const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const managerSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Kullanıcı adı zorunludur"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email zorunludur"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Şifre zorunludur"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      default: "manager",
      immutable: true,
    },
    fullName: {
      type: String,
      required: [true, "Ad Soyad zorunludur"],
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: [0, "Toplam kazanç negatif olamaz"],
    },
    totalWithdrawals: {
      type: Number,
      default: 0,
      min: [0, "Toplam çekim negatif olamaz"],
    },
    commissionRate: {
      type: Number,
      default: 10,
      min: [0, "Komisyon oranı negatif olamaz"],
      max: [100, "Komisyon oranı 100'den büyük olamaz"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    permissions: {
      users: {
        create: { type: Boolean, default: false },
        read: { type: Boolean, default: true },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      deliveries: {
        create: { type: Boolean, default: false },
        read: { type: Boolean, default: true },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      accounting: {
        create: { type: Boolean, default: false },
        read: { type: Boolean, default: true },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      announcements: {
        create: { type: Boolean, default: false },
        read: { type: Boolean, default: true },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      posts: {
        create: { type: Boolean, default: false },
        read: { type: Boolean, default: true },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
managerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
managerSchema.methods.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Manager = mongoose.model("Manager", managerSchema);

module.exports = Manager;
