const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiptFile: {
      path: {
        type: String,
        required: true,
      },
      originalName: String,
      mimeType: String,
      size: Number,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    reviewedAt: Date,
    rejectionReason: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
deliverySchema.index({ userId: 1, status: 1 });
deliverySchema.index({ createdAt: -1 });
deliverySchema.index({ status: 1, createdAt: -1 });

const Delivery = mongoose.model("Delivery", deliverySchema);

module.exports = Delivery;
