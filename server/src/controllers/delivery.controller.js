const Delivery = require("../models/delivery.model");
const User = require("../models/user.model");
const logger = require("../utils/logger");
const createError = require("../utils/createError");
const path = require("path");
const fs = require("fs").promises;

// Submit new delivery receipt
exports.submitDelivery = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(createError(400, "Lütfen bir teslimat fişi yükleyin"));
    }

    if (req.file.mimetype !== "application/pdf") {
      // Delete the uploaded file if it's not a PDF
      await fs.unlink(req.file.path);
      return next(
        createError(400, "Sadece PDF formatında dosya yükleyebilirsiniz")
      );
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (req.file.size > maxSize) {
      await fs.unlink(req.file.path);
      return next(createError(400, "Dosya boyutu 5MB'dan büyük olamaz"));
    }

    const delivery = new Delivery({
      userId: req.user._id,
      receiptFile: {
        path: req.file.path,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
      status: "pending",
      submittedAt: new Date(),
    });

    await delivery.save();
    logger.info(`New delivery submitted by user: ${req.user._id}`);

    res.status(201).json({
      success: true,
      message: "Teslimat fişi başarıyla yüklendi ve incelemeye alındı",
      data: {
        id: delivery._id,
        status: delivery.status,
        submittedAt: delivery.submittedAt,
      },
    });
  } catch (error) {
    // Clean up uploaded file if there's an error
    if (req.file) {
      await fs
        .unlink(req.file.path)
        .catch((err) => logger.error("Error deleting file:", err));
    }
    logger.error("Error submitting delivery:", error);
    next(createError(500, "Teslimat fişi yüklenirken bir hata oluştu"));
  }
};

// Get user's deliveries with pagination and filtering
exports.getUserDeliveries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const query = { userId: req.user._id };
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query.status = status;
    }

    const [deliveries, total] = await Promise.all([
      Delivery.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-receiptFile.path"),
      Delivery.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        deliveries,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error("Error getting user deliveries:", error);
    next(createError(500, "Teslimatlar alınırken bir hata oluştu"));
  }
};

// Get delivery receipt file
exports.getDeliveryReceipt = async (req, res, next) => {
  try {
    const delivery = await Delivery.findOne({
      _id: req.params.deliveryId,
      userId: req.user._id,
    });

    if (!delivery) {
      return next(createError(404, "Teslimat bulunamadı"));
    }

    const filePath = delivery.receiptFile.path;
    if (
      !filePath ||
      !(await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false))
    ) {
      return next(createError(404, "Teslimat fişi bulunamadı"));
    }

    res.sendFile(path.resolve(filePath));
  } catch (error) {
    logger.error("Error fetching delivery receipt:", error);
    next(createError(500, "Teslimat fişi getirilirken bir hata oluştu"));
  }
};

// Admin: Get all pending deliveries with pagination and search
exports.getPendingDeliveries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;

    let query = { status: "pending" };
    if (search) {
      const users = await User.find({
        username: { $regex: search, $options: "i" },
      }).select("_id");
      query.userId = { $in: users.map((user) => user._id) };
    }

    const [deliveries, total] = await Promise.all([
      Delivery.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "username email")
        .select("-receiptFile.path"),
      Delivery.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: deliveries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    logger.error("Error fetching pending deliveries:", error);
    next(createError(500, "Bekleyen teslimatlar getirilirken bir hata oluştu"));
  }
};

// Admin: Review delivery
exports.reviewDelivery = async (req, res, next) => {
  try {
    const { action, rejectionReason, notes } = req.body;
    const deliveryId = req.params.deliveryId;

    if (!["approve", "reject"].includes(action)) {
      return next(createError(400, "Geçersiz işlem"));
    }

    if (action === "reject" && !rejectionReason?.trim()) {
      return next(createError(400, "Red sebebi belirtilmelidir"));
    }

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return next(createError(404, "Teslimat bulunamadı"));
    }

    if (delivery.status !== "pending") {
      return next(createError(400, "Bu teslimat zaten incelenmiş"));
    }

    const session = await Delivery.startSession();
    session.startTransaction();

    try {
      // Update delivery status
      delivery.status = action === "approve" ? "approved" : "rejected";
      delivery.reviewedBy = req.user._id;
      delivery.reviewedAt = new Date();
      delivery.rejectionReason = rejectionReason;
      delivery.notes = notes;

      // If approved, update user's delivery count
      if (action === "approve") {
        const user = await User.findById(delivery.userId);
        if (!user) {
          throw new Error("Kullanıcı bulunamadı");
        }

        user.deliveryCount = (user.deliveryCount || 0) + 1;
        await user.save({ session });
      }

      await delivery.save({ session });
      await session.commitTransaction();

      res.status(200).json({
        success: true,
        message: `Teslimat başarıyla ${action === "approve" ? "onaylandı" : "reddedildi"}`,
        data: delivery,
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    logger.error("Error reviewing delivery:", error);
    next(createError(500, "Teslimat incelenirken bir hata oluştu"));
  }
};

// Admin: Get user's all deliveries
exports.getUserAllDeliveries = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const deliveries = await Delivery.find({ userId })
      .sort({ createdAt: -1 })
      .select("-receiptFile.path");

    res.status(200).json({
      success: true,
      data: deliveries,
    });
  } catch (error) {
    logger.error("Error fetching user deliveries:", error);
    next(
      createError(500, "Kullanıcı teslimatları getirilirken bir hata oluştu")
    );
  }
};

// Delete delivery
exports.deleteDelivery = async (req, res, next) => {
  try {
    const delivery = await Delivery.findOne({
      _id: req.params.deliveryId,
      userId: req.user._id,
    });

    if (!delivery) {
      return next(createError(404, "Teslimat bulunamadı"));
    }

    // Only allow deletion of pending deliveries
    if (delivery.status !== "pending") {
      return next(
        createError(400, "Sadece bekleyen durumdaki teslimatlar silinebilir")
      );
    }

    // Delete the receipt file
    if (delivery.receiptFile?.path) {
      await fs
        .unlink(delivery.receiptFile.path)
        .catch((err) => logger.error("Error deleting receipt file:", err));
    }

    await delivery.deleteOne();

    res.json({
      success: true,
      message: "Teslimat başarıyla silindi",
    });
  } catch (error) {
    logger.error("Error deleting delivery:", error);
    next(createError(500, "Teslimat silinirken bir hata oluştu"));
  }
};
