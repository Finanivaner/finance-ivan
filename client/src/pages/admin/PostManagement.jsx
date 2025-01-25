import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  Avatar,
} from "@mui/material";
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Comment as CommentIcon,
} from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const PostManagement = () => {
  const theme = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [imageDialog, setImageDialog] = useState(null);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/posts/all`, {
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
      setError(err.message);
    }
  };

  const handleUpdateStatus = async (postId, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/posts/${postId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Durum güncellenemedi");
      }

      await fetchPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Bu gönderiyi silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gönderi silinemedi");
      }

      await fetchPosts();
    } catch (err) {
      setError(err.message);
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
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.background.paper,
            0.9
          )} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
          backdropFilter: "blur(10px)",
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Gönderi Yönetimi
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Kullanıcı gönderilerini yönetin ve onaylayın
        </Typography>
      </Paper>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(10px)",
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          borderRadius: 3,
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Kullanıcı</TableCell>
              <TableCell>İçerik</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post._id}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                      src={post.user.avatar}
                      alt={post.user.username}
                      sx={{ width: 32, height: 32, mr: 1 }}
                    >
                      {post.user.username[0]}
                    </Avatar>
                    <Typography variant="body2">
                      {post.user.username}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      maxWidth: 300,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {post.content}
                  </Typography>
                  {post.imagePath && (
                    <Tooltip title="Resmi görüntüle">
                      <IconButton
                        size="small"
                        onClick={() => setImageDialog(post)}
                        sx={{ ml: 1 }}
                      >
                        <ImageIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      post.status === "approved"
                        ? "Onaylandı"
                        : post.status === "rejected"
                        ? "Reddedildi"
                        : "Beklemede"
                    }
                    color={
                      post.status === "approved"
                        ? "success"
                        : post.status === "rejected"
                        ? "error"
                        : "warning"
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(post.createdAt).toLocaleString("tr-TR")}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    {post.status === "pending" && (
                      <>
                        <Tooltip title="Onayla">
                          <IconButton
                            onClick={() =>
                              handleUpdateStatus(post._id, "approved")
                            }
                            color="success"
                          >
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reddet">
                          <IconButton
                            onClick={() =>
                              handleUpdateStatus(post._id, "rejected")
                            }
                            color="error"
                          >
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="Yorumları Görüntüle">
                      <IconButton
                        onClick={() => setSelectedPost(post)}
                        color="primary"
                      >
                        <CommentIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton
                        onClick={() => handleDelete(post._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Comments Dialog */}
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
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog
        open={!!imageDialog}
        onClose={() => setImageDialog(null)}
        maxWidth="md"
      >
        <DialogTitle>
          Gönderi Resmi
          <IconButton
            onClick={() => setImageDialog(null)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {imageDialog && (
            <Box
              component="img"
              src={`${API_URL}/${imageDialog.imagePath}`}
              alt="Post"
              sx={{
                width: "100%",
                height: "auto",
                maxHeight: "70vh",
                objectFit: "contain",
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PostManagement;
