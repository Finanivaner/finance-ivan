import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Avatar,
  Divider,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const PostList = () => {
  const theme = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/posts/approved`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gönderiler yüklenemedi");
      }

      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Yorumlar yüklenemedi");
      }

      const data = await response.json();
      setComments(data);
    } catch (err) {
      setCommentError(err.message);
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Beğeni işlemi başarısız");
      }

      const updatedPost = await response.json();
      setPosts(posts.map((post) => (post._id === postId ? updatedPost : post)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleComment = async (postId) => {
    if (!commentContent.trim()) return;

    setCommentLoading(true);
    setCommentError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: commentContent }),
      });

      if (!response.ok) {
        throw new Error("Yorum gönderilemedi");
      }

      setCommentContent("");
      await fetchComments(postId);
    } catch (err) {
      setCommentError(err.message);
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedPost) {
      fetchComments(selectedPost._id);
    }
  }, [selectedPost]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {posts.map((post) => (
        <Paper
          key={post._id}
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.background.paper,
              0.9
            )} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
            backdropFilter: "blur(10px)",
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar src={post.user.avatar} alt={post.user.username}>
              {post.user.username[0]}
            </Avatar>
            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle1">{post.user.username}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(post.createdAt).toLocaleString("tr-TR")}
              </Typography>
            </Box>
          </Box>

          <Typography variant="body1" sx={{ mb: 2 }}>
            {post.content}
          </Typography>

          {post.imagePath && (
            <Box
              component="img"
              src={`${API_URL}/${post.imagePath}`}
              alt="Post"
              sx={{
                width: "100%",
                maxHeight: 400,
                objectFit: "cover",
                borderRadius: 2,
                mb: 2,
              }}
            />
          )}

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={() => handleLike(post._id)}
              color={
                post.likes.includes(localStorage.getItem("userId"))
                  ? "primary"
                  : "default"
              }
            >
              {post.likes.includes(localStorage.getItem("userId")) ? (
                <FavoriteIcon />
              ) : (
                <FavoriteBorderIcon />
              )}
            </IconButton>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {post.likes.length}
            </Typography>

            <IconButton onClick={() => setSelectedPost(post)}>
              <CommentIcon />
            </IconButton>
            <Typography variant="body2">{post.commentCount || 0}</Typography>
          </Box>
        </Paper>
      ))}

      <Dialog
        open={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Yorumlar
          <IconButton
            onClick={() => setSelectedPost(null)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {commentError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {commentError}
            </Alert>
          )}

          {comments.map((comment) => (
            <Box key={comment._id} sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Avatar
                  src={comment.user.avatar}
                  alt={comment.user.username}
                  sx={{ width: 32, height: 32 }}
                >
                  {comment.user.username[0]}
                </Avatar>
                <Box sx={{ ml: 1 }}>
                  <Typography variant="subtitle2">
                    {comment.user.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(comment.createdAt).toLocaleString("tr-TR")}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2">{comment.content}</Typography>
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}

          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Yorumunuzu yazın..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              disabled={commentLoading}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button
                variant="contained"
                onClick={() => handleComment(selectedPost._id)}
                disabled={!commentContent.trim() || commentLoading}
              >
                {commentLoading ? <CircularProgress size={24} /> : "Gönder"}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PostList;
