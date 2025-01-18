import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PendingActions as PendingIcon,
} from "@mui/icons-material";
import { API_URL } from "../config";
import axios from "axios";
import { toast } from "react-toastify";

const DeliverySection = () => {
  const theme = useTheme();
  const [deliveries, setDeliveries] = useState([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/delivery/my-deliveries`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setDeliveries(response.data.data);
    } catch (error) {
      toast.error("Teslimatlar yüklenirken bir hata oluştu");
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      toast.error("Lütfen PDF formatında bir dosya seçin");
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !amount) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("receipt", selectedFile);
    formData.append("amount", amount);

    try {
      await axios.post(`${API_URL}/api/delivery/submit`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Teslimat fişi başarıyla yüklendi");
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setAmount("");
      fetchDeliveries();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Teslimat fişi yüklenirken bir hata oluştu"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
      case "rejected":
        return <CancelIcon sx={{ color: theme.palette.error.main }} />;
      default:
        return <PendingIcon sx={{ color: theme.palette.warning.main }} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Onaylandı";
      case "rejected":
        return "Reddedildi";
      default:
        return "İnceleniyor";
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" component="h2">
          Teslimatlarım
        </Typography>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={() => setUploadDialogOpen(true)}
        >
          Yeni Teslimat Ekle
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tarih</TableCell>
              <TableCell>Tutar</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Not</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deliveries.map((delivery) => (
              <TableRow key={delivery._id}>
                <TableCell>
                  {new Date(delivery.createdAt).toLocaleDateString("tr-TR")}
                </TableCell>
                <TableCell>
                  {delivery.amount.toLocaleString("tr-TR")} ₺
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getStatusIcon(delivery.status)}
                    {getStatusText(delivery.status)}
                  </Box>
                </TableCell>
                <TableCell>
                  {delivery.status === "rejected"
                    ? delivery.rejectionReason
                    : delivery.notes || "-"}
                </TableCell>
              </TableRow>
            ))}
            {deliveries.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Henüz teslimat bulunmuyor
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Yeni Teslimat Ekle
          <IconButton
            onClick={() => setUploadDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Teslimat Tutarı"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  InputProps={{
                    endAdornment: <Typography>₺</Typography>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                >
                  {selectedFile ? selectedFile.name : "PDF Fiş Seç"}
                  <input
                    type="file"
                    hidden
                    accept="application/pdf"
                    onChange={handleFileSelect}
                  />
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!selectedFile || !amount || loading}
          >
            {loading ? "Yükleniyor..." : "Gönder"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliverySection;
