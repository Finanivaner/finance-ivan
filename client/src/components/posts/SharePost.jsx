import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Image as ImageIcon, Close as CloseIcon } from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const SharePost = () => {
  const theme = useTheme();
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Dosya boyutu 5MB'dan küçük olmalıdır");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Sadece resim dosyaları yüklenebilir");
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Gönderi paylaşılamadı");
      }

      setContent("");
      setImage(null);
      setPreview("");
      setSuccess("Gönderi başarıyla paylaşıldı ve onay için gönderildi");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.background.paper,
          0.9
        )} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
        backdropFilter: "blur(10px)",
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        borderRadius: 3,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Gönderi Paylaş
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Ne düşünüyorsun?"
          value={content}
          onChange={(e) => {
            if (e.target.value.length <= 150) {
              setContent(e.target.value);
            }
          }}
          sx={{ mb: 2 }}
          helperText={`${content.length}/150 karakter`}
        />

        {preview && (
          <Box sx={{ position: "relative", mb: 2 }}>
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                bgcolor: "rgba(0, 0, 0, 0.5)",
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.7)",
                },
              }}
              onClick={() => {
                setImage(null);
                setPreview("");
              }}
            >
              <CloseIcon sx={{ color: "white" }} />
            </IconButton>
            <Box
              component="img"
              src={preview}
              alt="Preview"
              sx={{
                width: "100%",
                maxHeight: 200,
                objectFit: "cover",
                borderRadius: 2,
              }}
            />
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            component="label"
            startIcon={<ImageIcon />}
            sx={{ color: theme.palette.text.secondary }}
          >
            Resim Ekle
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={!content.trim() || loading}
          >
            {loading ? <CircularProgress size={24} /> : "Paylaş"}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default SharePost;
