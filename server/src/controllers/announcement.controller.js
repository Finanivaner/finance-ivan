const Announcement = require("../models/announcement.model");
const logger = require("../utils/logger");
const createError = require("../utils/createError");

// Create a new announcement (Admin only)
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { content } = req.body;

    const announcement = new Announcement({
      content,
      createdBy: req.user.id,
    });

    await announcement.save();
    logger.info(`New announcement created by admin ${req.user.id}`);

    res.status(201).json({
      success: true,
      data: announcement,
      message: "Duyuru başarıyla oluşturuldu",
    });
  } catch (error) {
    logger.error("Error creating announcement:", error);
    next(createError(500, "Duyuru oluşturulurken bir hata oluştu"));
  }
};

// Get all active announcements (User)
exports.getActiveAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username");

    res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    logger.error("Error fetching announcements:", error);
    next(createError(500, "Duyurular getirilirken bir hata oluştu"));
  }
};

// Get all announcements (Admin only)
exports.getAllAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username");

    res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    logger.error("Error fetching all announcements:", error);
    next(createError(500, "Duyurular getirilirken bir hata oluştu"));
  }
};

// Update announcement (Admin only)
exports.updateAnnouncement = async (req, res, next) => {
  try {
    const { content } = req.body;
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );

    if (!announcement) {
      return next(createError(404, "Duyuru bulunamadı"));
    }

    logger.info(
      `Announcement ${req.params.id} updated by admin ${req.user.id}`
    );

    res.status(200).json({
      success: true,
      data: announcement,
      message: "Duyuru başarıyla güncellendi",
    });
  } catch (error) {
    logger.error("Error updating announcement:", error);
    next(createError(500, "Duyuru güncellenirken bir hata oluştu"));
  }
};

// Delete announcement (Admin only)
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return next(createError(404, "Duyuru bulunamadı"));
    }

    logger.info(
      `Announcement ${req.params.id} deleted by admin ${req.user.id}`
    );

    res.status(200).json({
      success: true,
      message: "Duyuru başarıyla silindi",
    });
  } catch (error) {
    logger.error("Error deleting announcement:", error);
    next(createError(500, "Duyuru silinirken bir hata oluştu"));
  }
};
