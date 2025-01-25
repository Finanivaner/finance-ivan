const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const logger = require("../utils/logger");
const createError = require("../utils/createError");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads");
const postsDir = path.join(uploadsDir, "posts");

(async () => {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(postsDir, { recursive: true });
    logger.info("Posts uploads directory created successfully");
  } catch (error) {
    logger.error("Error creating posts uploads directory:", error);
  }
})();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, postsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Sadece resim dosyaları yüklenebilir!"));
  },
}).single("image");

// Create a new post
exports.createPost = async (req, res, next) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return next(createError(400, "Dosya yükleme hatası: " + err.message));
    } else if (err) {
      return next(createError(400, err.message));
    }

    try {
      const { content } = req.body;
      const post = new Post({
        content,
        user: req.user.id,
        imagePath: req.file ? `/uploads/posts/${req.file.filename}` : null,
        status: "pending",
      });

      await post.save();
      logger.info(`New post created by user ${req.user.id}`);

      const populatedPost = await Post.findById(post._id)
        .populate("user", "username avatar")
        .populate({
          path: "likes",
          select: "username avatar",
        });

      res.status(201).json(populatedPost);
    } catch (error) {
      logger.error("Error creating post:", error);
      next(createError(500, "Gönderi oluşturulurken bir hata oluştu"));
    }
  });
};

// Get approved posts
exports.getApprovedPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .populate("user", "username avatar")
      .populate({
        path: "likes",
        select: "username avatar",
      });

    res.status(200).json(posts);
  } catch (error) {
    logger.error("Error fetching posts:", error);
    next(createError(500, "Gönderiler getirilirken bir hata oluştu"));
  }
};

// Get all posts (Admin)
exports.getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", "username avatar");

    res.status(200).json(posts);
  } catch (error) {
    logger.error("Error fetching all posts:", error);
    next(createError(500, "Gönderiler getirilirken bir hata oluştu"));
  }
};

// Update post status (Admin)
exports.updatePostStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user", "username avatar");

    if (!post) {
      return next(createError(404, "Gönderi bulunamadı"));
    }

    logger.info(
      `Post ${req.params.id} status updated to ${status} by admin ${req.user.id}`
    );

    res.status(200).json(post);
  } catch (error) {
    logger.error("Error updating post status:", error);
    next(createError(500, "Gönderi durumu güncellenirken bir hata oluştu"));
  }
};

// Like/Unlike post
exports.toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return next(createError(404, "Gönderi bulunamadı"));
    }

    const likeIndex = post.likes.indexOf(req.user.id);
    if (likeIndex === -1) {
      post.likes.push(req.user.id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate("user", "username avatar")
      .populate({
        path: "likes",
        select: "username avatar",
      });

    res.status(200).json(populatedPost);
  } catch (error) {
    logger.error("Error toggling like:", error);
    next(createError(500, "Beğeni işlemi sırasında bir hata oluştu"));
  }
};

// Add comment
exports.addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(createError(404, "Gönderi bulunamadı"));
    }

    const comment = new Comment({
      content,
      user: req.user.id,
      post: post._id,
      status: "pending",
    });

    await comment.save();
    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();

    logger.info(`New comment added to post ${post._id} by user ${req.user.id}`);

    const populatedComment = await Comment.findById(comment._id).populate(
      "user",
      "username avatar"
    );

    res.status(201).json(populatedComment);
  } catch (error) {
    logger.error("Error adding comment:", error);
    next(createError(500, "Yorum eklenirken bir hata oluştu"));
  }
};

// Get approved comments for a post
exports.getApprovedComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({
      post: req.params.id,
      status: "approved",
    })
      .sort({ createdAt: -1 })
      .populate("user", "username avatar");

    res.status(200).json(comments);
  } catch (error) {
    logger.error("Error fetching comments:", error);
    next(createError(500, "Yorumlar getirilirken bir hata oluştu"));
  }
};
