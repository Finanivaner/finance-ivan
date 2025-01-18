import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PendingActions as PendingIcon,
  Visibility as VisibilityIcon,
  LocalShipping as LocalShippingIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DeliveryManagement = () => {
  const theme = useTheme();
  const [deliveries, setDeliveries] = useState([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchDeliveries();
  }, []);

  useEffect(() => {
    // Calculate statistics when deliveries change
    const newStats = deliveries.reduce(
      (acc, delivery) => {
        acc.total++;
        acc[delivery.status]++;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0 }
    );
    setStats(newStats);
  }, [deliveries]);

  const fetchDeliveries = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/delivery/pending`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setDeliveries(response.data.data);
    } catch (error) {
      toast.error("Teslimatlar yüklenirken bir hata oluştu");
    }
  };

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

  const handleReviewDelivery = async (action) => {
    if (action === "reject" && !rejectionReason.trim()) {
      toast.error("Lütfen red sebebi belirtin");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/delivery/review/${selectedDelivery._id}`,
        {
          action,
          rejectionReason: rejectionReason.trim(),
          notes: notes.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(
        `Teslimat başarıyla ${
          action === "approve" ? "onaylandı" : "reddedildi"
        }`
      );
      setReviewDialogOpen(false);
      setRejectionReason("");
      setNotes("");
      fetchDeliveries();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "İşlem sırasında bir hata oluştu"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircleIcon color="success" />;
      case "rejected":
        return <CancelIcon color="error" />;
      default:
        return <PendingIcon color="warning" />;
    }
  };

  const getStatusChip = (status) => {
    const config = {
      approved: {
        color: "success",
        label: "Onaylandı",
        icon: <CheckCircleIcon />,
      },
      rejected: { color: "error", label: "Reddedildi", icon: <CancelIcon /> },
      pending: { color: "warning", label: "Beklemede", icon: <PendingIcon /> },
    };

    const { color, label, icon } = config[status] || config.pending;

    return (
      <Chip
        icon={icon}
        label={label}
        color={color}
        size="small"
        variant="outlined"
        sx={{ minWidth: 100 }}
      />
    );
  };

  return (
    <Box>
      {/* Header Section */}
      <Box
        sx={{
          background: "linear-gradient(45deg, #1e293b 30%, #334155 90%)",
          borderRadius: 3,
          p: 3,
          mb: 4,
          boxShadow: "0 3px 5px 2px rgba(30, 41, 59, .3)",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              sx={{
                background: "linear-gradient(45deg, #60a5fa 30%, #3b82f6 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                mb: 1,
              }}
            >
              Teslimat Yönetimi
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Teslimat taleplerini inceleyin ve onaylayın
            </Typography>
          </Box>
          <AssessmentIcon
            sx={{ fontSize: 40, color: "primary.light", opacity: 0.8 }}
          />
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              background: "linear-gradient(45deg, #1e293b 30%, #334155 90%)",
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <LocalShippingIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Toplam Teslimat
                  </Typography>
                  <Typography variant="h4">{stats.total}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              background: "linear-gradient(45deg, #064e3b 30%, #065f46 90%)",
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Onaylanan
                  </Typography>
                  <Typography variant="h4">{stats.approved}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              background: "linear-gradient(45deg, #854d0e 30%, #a16207 90%)",
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <PendingIcon color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Bekleyen
                  </Typography>
                  <Typography variant="h4">{stats.pending}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              background: "linear-gradient(45deg, #7f1d1d 30%, #991b1b 90%)",
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CancelIcon color="error" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Reddedilen
                  </Typography>
                  <Typography variant="h4">{stats.rejected}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Deliveries Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "background.paper" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Kullanıcı</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Tarih</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Durum</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deliveries.map((delivery) => (
              <TableRow
                key={delivery._id}
                hover
                sx={{
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {delivery.userId.username}
                  </Typography>
                </TableCell>
                <TableCell>
                  {new Date(delivery.createdAt).toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell>{getStatusChip(delivery.status)}</TableCell>
                <TableCell>
                  <Button
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewReceipt(delivery._id)}
                    sx={{
                      mr: 1,
                      borderRadius: 2,
                      textTransform: "none",
                    }}
                  >
                    Fiş Görüntüle
                  </Button>
                  {delivery.status === "pending" && (
                    <Button
                      variant="contained"
                      onClick={() => {
                        setSelectedDelivery(delivery);
                        setReviewDialogOpen(true);
                      }}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        background:
                          "linear-gradient(45deg, #3b82f6 30%, #2563eb 90%)",
                        boxShadow: "0 3px 5px 2px rgba(59, 130, 246, .3)",
                        "&:hover": {
                          background:
                            "linear-gradient(45deg, #2563eb 30%, #1d4ed8 90%)",
                        },
                      }}
                    >
                      İncele
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {deliveries.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={2}
                  >
                    <LocalShippingIcon sx={{ fontSize: 48 }} color="disabled" />
                    <Typography color="textSecondary">
                      Bekleyen teslimat bulunmuyor
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => !loading && setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <AssessmentIcon color="primary" />
            <Typography variant="h6">Teslimat İnceleme</Typography>
          </Box>
          {!loading && (
            <IconButton
              onClick={() => setReviewDialogOpen(false)}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedDelivery && (
            <Box>
              <Box
                sx={{
                  backgroundColor: "background.paper",
                  borderRadius: 2,
                  p: 2,
                  mb: 3,
                }}
              >
                <Typography variant="body1" gutterBottom>
                  <strong>Kullanıcı:</strong> {selectedDelivery.userId.username}
                </Typography>
                <Typography variant="body1">
                  <strong>Tarih:</strong>{" "}
                  {new Date(selectedDelivery.createdAt).toLocaleDateString(
                    "tr-TR",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Not (Opsiyonel)"
                multiline
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Red Sebebi"
                multiline
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                disabled={loading}
                required
                error={!rejectionReason.trim()}
                helperText={!rejectionReason.trim() && "Red sebebi zorunludur"}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => handleReviewDelivery("reject")}
            color="error"
            disabled={loading}
            startIcon={<CancelIcon />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              minWidth: 100,
            }}
          >
            Reddet
          </Button>
          <Button
            onClick={() => handleReviewDelivery("approve")}
            color="success"
            variant="contained"
            disabled={loading}
            startIcon={<CheckCircleIcon />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              minWidth: 100,
            }}
          >
            Onayla
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliveryManagement;
