import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DeliverySection = ({ onUpdateCounts }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/delivery`, {
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
        // Update counts
        const counts = data.data.reduce(
          (acc, delivery) => {
            acc[delivery.status]++;
            return acc;
          },
          { approved: 0, pending: 0, rejected: 0 }
        );
        onUpdateCounts(counts);
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

  const handleDeleteClick = (delivery) => {
    setSelectedDelivery(delivery);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/delivery/${selectedDelivery._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Teslimat silinemedi");
      }

      const data = await response.json();
      if (data.success) {
        setDeliveries((prevDeliveries) =>
          prevDeliveries.filter((d) => d._id !== selectedDelivery._id)
        );
        setDeleteDialogOpen(false);
        setSelectedDelivery(null);

        // Update counts
        const counts = deliveries
          .filter((d) => d._id !== selectedDelivery._id)
          .reduce(
            (acc, delivery) => {
              acc[delivery.status]++;
              return acc;
            },
            { approved: 0, pending: 0, rejected: 0 }
          );
        onUpdateCounts(counts);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewReceipt = (delivery) => {
    setSelectedDelivery(delivery);
    setViewDialogOpen(true);
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
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
        <Button
          component={Link}
          to="/dashboard/delivery/new"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            background: "linear-gradient(45deg, #3b82f6, #8b5cf6)",
            borderRadius: "12px",
            textTransform: "none",
            px: 4,
            py: 1.5,
            "&:hover": {
              background: "linear-gradient(45deg, #2563eb, #7c3aed)",
              transform: "translateY(-2px)",
              boxShadow: "0 10px 20px -10px rgba(59, 130, 246, 0.5)",
            },
          }}
        >
          Yeni Teslimat
        </Button>
      </Box>

      {deliveries.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
          }}
        >
          <Typography variant="h6" sx={{ color: "text.secondary", mb: 2 }}>
            Henüz teslimat bulunmuyor
          </Typography>
          <Button
            component={Link}
            to="/dashboard/delivery/new"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              background: "linear-gradient(45deg, #3b82f6, #8b5cf6)",
              borderRadius: "12px",
              textTransform: "none",
              px: 4,
              py: 1.5,
              "&:hover": {
                background: "linear-gradient(45deg, #2563eb, #7c3aed)",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 20px -10px rgba(59, 130, 246, 0.5)",
              },
            }}
          >
            İlk Teslimatı Oluştur
          </Button>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tarih</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery._id}>
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
                    {delivery.status === "pending" && (
                      <IconButton
                        onClick={() => handleDeleteClick(delivery)}
                        sx={{ color: "#ef4444" }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
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
        <DialogTitle sx={{ color: "white" }}>Teslimatı Sil</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "white" }}>
            Bu teslimatı silmek istediğinizden emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              color: "white",
              "&:hover": {
                bgcolor: "rgba(148, 163, 184, 0.1)",
              },
            }}
          >
            İptal
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            sx={{
              background: "linear-gradient(45deg, #ef4444, #dc2626)",
              color: "white",
              "&:hover": {
                background: "linear-gradient(45deg, #dc2626, #b91c1c)",
              },
            }}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Receipt Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: "rgba(30, 41, 59, 0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(148, 163, 184, 0.1)",
            borderRadius: "20px",
          },
        }}
      >
        <DialogTitle sx={{ color: "white" }}>Teslimat Makbuzu</DialogTitle>
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
          <Button
            onClick={() => setViewDialogOpen(false)}
            sx={{
              color: "white",
              "&:hover": {
                bgcolor: "rgba(148, 163, 184, 0.1)",
              },
            }}
          >
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliverySection;
