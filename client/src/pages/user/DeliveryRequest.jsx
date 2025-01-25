import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DeliveryRequest = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Lütfen sadece PDF dosyası yükleyin");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Dosya boyutu 5MB'dan küçük olmalıdır");
        return;
      }

      setSelectedFile(file);
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Lütfen bir dosya seçin");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("receipt", selectedFile);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/delivery`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Teslimat makbuzu yüklenemedi");
      }

      const data = await response.json();
      if (data.success) {
        navigate("/user/delivery");
      }
    } catch (err) {
      setError(err.message);
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen bg-[#0f172a] py-12">
      <Container maxWidth="md">
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            className="text-white font-bold mb-2"
            sx={{
              background: "linear-gradient(45deg, #3b82f6, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Yeni Teslimat
          </Typography>
          <Typography className="text-gray-400">
            Teslimat makbuzunuzu yükleyin
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 4,
            background: "rgba(30, 41, 59, 0.5)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(148, 163, 184, 0.1)",
            borderRadius: "20px",
          }}
        >
          <Alert
            severity="info"
            sx={{
              mb: 4,
              width: "100%",
              background: "rgba(59, 130, 246, 0.1)",
              color: "white",
              "& .MuiAlert-icon": {
                color: "#3b82f6",
              },
            }}
          >
            <Typography variant="body1" component="div">
              Lütfen aşağıdaki gereksinimlere dikkat edin:
              <ul style={{ marginTop: "8px", marginBottom: "0" }}>
                <li>Sadece PDF formatında dosya yükleyebilirsiniz</li>
                <li>Maksimum dosya boyutu 5MB olmalıdır</li>
                <li>Makbuz üzerindeki bilgiler net ve okunaklı olmalıdır</li>
              </ul>
            </Typography>
          </Alert>

          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            style={{ display: "none" }}
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button
              component="span"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{
                mb: 3,
                color: selectedFile ? "#10b981" : "white",
                borderColor: selectedFile
                  ? "#10b981"
                  : "rgba(255, 255, 255, 0.23)",
                "&:hover": {
                  borderColor: selectedFile ? "#059669" : "white",
                  background: "rgba(255, 255, 255, 0.05)",
                },
              }}
            >
              {selectedFile ? "Dosya Seçildi" : "Dosya Seç"}
            </Button>
          </label>

          {selectedFile && (
            <Typography variant="body2" sx={{ color: "#10b981", mb: 3 }}>
              Seçilen dosya: {selectedFile.name}
            </Typography>
          )}

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !selectedFile}
            sx={{
              background: "linear-gradient(45deg, #3b82f6, #8b5cf6)",
              borderRadius: "12px",
              textTransform: "none",
              px: 4,
              py: 1.5,
              "&:hover": {
                background: "linear-gradient(45deg, #2563eb, #7c3aed)",
              },
              "&.Mui-disabled": {
                background: "rgba(148, 163, 184, 0.1)",
                color: "rgba(255, 255, 255, 0.3)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Gönder"
            )}
          </Button>
        </Box>

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          PaperProps={{
            sx: {
              background: "rgba(30, 41, 59, 0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(148, 163, 184, 0.1)",
              borderRadius: "20px",
              minWidth: "400px",
            },
          }}
        >
          <DialogTitle sx={{ color: "white" }}>Hata</DialogTitle>
          <DialogContent>
            <Typography sx={{ color: "white" }}>{error}</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDialogOpen(false)}
              sx={{
                color: "white",
                "&:hover": {
                  background: "rgba(148, 163, 184, 0.1)",
                },
              }}
            >
              Tamam
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default DeliveryRequest;
