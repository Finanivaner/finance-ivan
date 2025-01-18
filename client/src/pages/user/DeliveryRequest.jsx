import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const DeliveryRequest = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === "application/pdf") {
        if (file.size <= 5 * 1024 * 1024) {
          // 5MB limit
          setSelectedFile(file);
        } else {
          setErrorMessage("Dosya boyutu 5MB'dan büyük olamaz");
          setErrorDialogOpen(true);
          event.target.value = null;
        }
      } else {
        setErrorMessage("Lütfen PDF formatında bir dosya seçin");
        setErrorDialogOpen(true);
        event.target.value = null;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setErrorMessage("Lütfen bir teslimat fişi seçin");
      setErrorDialogOpen(true);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("receipt", selectedFile);

    try {
      const response = await axios.post(
        `${API_URL}/api/delivery/submit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Teslimat başarıyla gönderildi", {
          onClose: () => navigate("/dashboard/delivery"),
          autoClose: 2000,
        });
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Teslimat fişi yüklenirken bir hata oluştu";
      setErrorMessage(errorMsg);
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Yeni Teslimat
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Bilgilendirme</AlertTitle>
          Lütfen teslimat fişinizi PDF formatında yükleyin. Dosya boyutu en
          fazla 5MB olabilir.
        </Alert>

        <Box component="form" onSubmit={handleSubmit}>
          <Button
            component="label"
            variant={selectedFile ? "outlined" : "contained"}
            startIcon={<CloudUploadIcon />}
            sx={{
              width: "100%",
              height: 100,
              mb: 3,
              borderStyle: "dashed",
              borderWidth: 2,
            }}
            disabled={loading}
          >
            {selectedFile ? (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  {selectedFile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Değiştirmek için tıklayın
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  PDF Fiş Yükle
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  veya buraya sürükleyin
                </Typography>
              </Box>
            )}
            <VisuallyHiddenInput
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              disabled={loading}
            />
          </Button>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              type="button"
              onClick={() => navigate("/dashboard/delivery")}
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!selectedFile || loading}
            >
              {loading ? <CircularProgress size={24} /> : "Gönder"}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Dialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningIcon color="error" />
            <Typography>Hata</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>{errorMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialogOpen(false)} variant="contained">
            Tamam
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliveryRequest;
