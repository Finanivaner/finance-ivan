import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PendingActions as PendingIcon,
  Receipt as ReceiptIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DeliveryPage = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [error, setError] = useState(null);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${API_URL}/api/delivery/my-deliveries`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setDeliveries(response.data.data?.deliveries || []);
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      setError("Teslimatlar yüklenirken bir hata oluştu");
      toast.error("Teslimatlar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleViewReceipt = async (deliveryId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/delivery/receipt/${deliveryId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "receipt.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Fiş görüntülenirken bir hata oluştu");
    }
  };

  const handleDeleteClick = (delivery) => {
    setSelectedDelivery(delivery);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDelivery) return;

    try {
      const response = await axios.delete(
        `${API_URL}/api/delivery/${selectedDelivery._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        await fetchDeliveries();
        toast.success("Teslimat başarıyla silindi");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Teslimat silinirken bir hata oluştu");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedDelivery(null);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      approved: {
        color: "success",
        label: "Onaylandı",
        icon: <CheckCircleIcon />,
      },
      rejected: {
        color: "error",
        label: "Reddedildi",
        icon: <CancelIcon />,
      },
      pending: {
        color: "warning",
        label: "Beklemede",
        icon: <PendingIcon />,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h1">
          Teslimatlarım
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/dashboard/delivery/request")}
        >
          Yeni Teslimat
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tarih</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Fiş</TableCell>
              <TableCell>Not</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    Henüz teslimat bulunmamaktadır
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              deliveries.map((delivery) => (
                <TableRow key={delivery._id}>
                  <TableCell>
                    {new Date(delivery.submittedAt).toLocaleString("tr-TR")}
                  </TableCell>
                  <TableCell>{getStatusChip(delivery.status)}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleViewReceipt(delivery._id)}
                      size="small"
                    >
                      <ReceiptIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>{delivery.rejectionReason || "-"}</TableCell>
                  <TableCell>
                    {delivery.status === "pending" && (
                      <IconButton
                        onClick={() => handleDeleteClick(delivery)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningIcon color="warning" />
            <Typography>Teslimat Silme Onayı</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Bu teslimatı silmek istediğinizden emin misiniz? Bu işlem geri
            alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliveryPage;
