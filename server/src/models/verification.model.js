const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    idCardFront: {
      type: String,
      required: true,
    },
    idCardBack: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "submitted", "verified", "rejected"],
      default: "pending",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Endeksleri ekle
verificationSchema.index({ userId: 1 }, { unique: true });
verificationSchema.index({ status: 1 });
verificationSchema.index({ updatedAt: -1 });

const Verification = mongoose.model("Verification", verificationSchema);

module.exports = Verification;
