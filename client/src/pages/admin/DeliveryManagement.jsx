import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
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
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DeliveryManagement = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [adminComment, setAdminComment] = useState("");

  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/delivery/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Teslimatlar getirilemedi");
      }

      const data = await response.json();
      if (data.success) {
        setDeliveries(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleStatusUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/delivery/${selectedDelivery._id}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
            adminComment,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Durum güncellenemedi");
      }

      const data = await response.json();
      if (data.success) {
        setDeliveries((prevDeliveries) =>
          prevDeliveries.map((delivery) =>
            delivery._id === selectedDelivery._id
              ? { ...delivery, status: newStatus, adminComment }
              : delivery
          )
        );
        setStatusDialogOpen(false);
        setSelectedDelivery(null);
        setNewStatus("");
        setAdminComment("");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewReceipt = (delivery) => {
    setSelectedDelivery(delivery);
    setViewDialogOpen(true);
  };

  const handleStatusClick = (delivery) => {
    setSelectedDelivery(delivery);
    setNewStatus(delivery.status);
    setAdminComment(delivery.adminComment || "");
    setStatusDialogOpen(true);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
        Teslimat Yönetimi
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Kullanıcı</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deliveries.map((delivery) => (
              <TableRow key={delivery._id}>
                <TableCell>{delivery.user.username}</TableCell>
                <TableCell>
                  {new Date(delivery.createdAt).toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      px: 2,
                      py: 0.5,
                      borderRadius: "9999px",
                      fontSize: "0.875rem",
                      fontWeight: "medium",
                      ...(delivery.status === "pending"
                        ? {
                            color: "#f59e0b",
                            bgcolor: "rgba(245, 158, 11, 0.1)",
                          }
                        : delivery.status === "approved"
                        ? {
                            color: "#10b981",
                            bgcolor: "rgba(16, 185, 129, 0.1)",
                          }
                        : delivery.status === "rejected"
                        ? {
                            color: "#ef4444",
                            bgcolor: "rgba(239, 68, 68, 0.1)",
                          }
                        : {}),
                    }}
                  >
                    {delivery.status === "pending"
                      ? "İnceleniyor"
                      : delivery.status === "approved"
                      ? "Onaylandı"
                      : delivery.status === "rejected"
                      ? "Reddedildi"
                      : delivery.status}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleViewReceipt(delivery)}
                    sx={{ color: "#3b82f6" }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleStatusClick(delivery)}
                    sx={{
                      color:
                        delivery.status === "approved"
                          ? "#10b981"
                          : delivery.status === "rejected"
                          ? "#ef4444"
                          : "#f59e0b",
                    }}
                  >
                    {delivery.status === "approved" ? (
                      <CheckCircleIcon />
                    ) : delivery.status === "rejected" ? (
                      <CancelIcon />
                    ) : (
                      <CheckCircleIcon />
                    )}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Teslimat Durumunu Güncelle</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Durum"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          >
            <MenuItem value="pending">İnceleniyor</MenuItem>
            <MenuItem value="approved">Onayla</MenuItem>
            <MenuItem value="rejected">Reddet</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Admin Yorumu"
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>İptal</Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Receipt Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Teslimat Makbuzu</DialogTitle>
        <DialogContent>
          {selectedDelivery && (
            <Box
              component="iframe"
              src={`${API_URL}/${selectedDelivery.receiptPath}`}
              width="100%"
              height="600px"
              sx={{ border: "none" }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliveryManagement;
