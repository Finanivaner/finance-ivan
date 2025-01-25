const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.middleware");
const postController = require("../controllers/post.controller");

// Public routes (require authentication)
router.get("/approved", protect, postController.getApprovedPosts);
router.post("/", protect, postController.createPost);
router.post("/:id/like", protect, postController.toggleLike);
router.post("/:id/comments", protect, postController.addComment);
router.get("/:id/comments", protect, postController.getApprovedComments);

// Admin only routes
router.use(protect, authorize("admin"));
router.get("/all", postController.getAllPosts);
router.put("/:id/status", postController.updatePostStatus);

module.exports = router;
