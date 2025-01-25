const mongoose = require("mongoose");

const accountingSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "office_income",
        "office_expense",
        "system_revenue",
        "system_expense",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
accountingSchema.index({ type: 1, date: -1 });
accountingSchema.index({ addedBy: 1, date: -1 });

const Accounting = mongoose.model("Accounting", accountingSchema);

module.exports = Accounting;
