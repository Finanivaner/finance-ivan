const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Kullanıcı adı zorunludur"],
      unique: true,
      trim: true,
      minlength: [3, "Kullanıcı adı en az 3 karakter olmalıdır"],
    },
    email: {
      type: String,
      required: [true, "Email adresi zorunludur"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Şifre zorunludur"],
      minlength: [6, "Şifre en az 6 karakter olmalıdır"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "submitted", "approved", "rejected"],
      default: "pending",
    },
    verificationDocuments: {
      idCardFront: String,
      idCardBack: String,
      additionalDocs: [String],
    },
    // Financial Information
    earnings: {
      type: Number,
      default: 0,
    },
    withdrawals: {
      type: Number,
      default: 0,
    },
    deliveryCount: {
      type: Number,
      default: 0,
    },
    commissionRate: {
      type: Number,
      default: 20,
    },
    // Crypto Payment Information
    cryptoPayment: {
      trxAddress: {
        type: String,
        default: "",
      },
      mnemonicKey: {
        type: String,
        default: "",
        select: false,
      },
    },
    // Transaction History
    transactions: [
      {
        type: {
          type: String,
          enum: ["earning", "withdrawal", "delivery"],
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "completed", "failed"],
          default: "pending",
        },
        date: {
          type: Date,
          default: Date.now,
        },
        description: String,
        adminAction: {
          type: Boolean,
          default: false,
        },
        adminId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Admin",
        },
        previousValue: Number,
        newValue: Number,
      },
    ],
    verificationSubmittedAt: Date,
    verificationApprovedAt: Date,
    verificationRejectedAt: Date,
    rejectionReason: String,
    lastLogin: Date,
    ibanPayment: {
      fullName: String,
      iban: String,
      bankName: String,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total earnings after commission
userSchema.methods.getNetEarnings = function () {
  const grossEarnings = this.earnings || 0;
  const commissionRate = this.commissionRate || 20;
  return grossEarnings * (1 - commissionRate / 100);
};

// Şifreyi hashle
userSchema.pre("save", async function (next) {
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
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
