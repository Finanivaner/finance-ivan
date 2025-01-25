const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Duyuru içeriği zorunludur"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Announcement = mongoose.model("Announcement", announcementSchema);

module.exports = Announcement;
