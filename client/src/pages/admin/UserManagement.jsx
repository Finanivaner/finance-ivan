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
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Tooltip,
  LinearProgress,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  InputAdornment,
  Warning,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  RemoveCircle,
  Visibility,
  AccessTime,
  PeopleAlt,
  HourglassEmpty,
  VerifiedUser,
  ContentCopy,
  AccountBalance,
  AccountBalanceWallet,
  Key,
  Login,
  Logout,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Enhanced stat card component
const StatCard = ({ title, value, icon, color }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        borderRadius: 4,
        background: `linear-gradient(135deg, ${alpha(
          theme.palette[color].main,
          0.05
        )} 0%, ${alpha(theme.palette[color].main, 0.1)} 100%)`,
        border: "1px solid",
        borderColor: alpha(theme.palette[color].main, 0.1),
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 8px 24px ${alpha(theme.palette[color].main, 0.15)}`,
          borderColor: alpha(theme.palette[color].main, 0.25),
          "& .icon-wrapper": {
            transform: "scale(1.1)",
            bgcolor: alpha(theme.palette[color].main, 0.2),
          },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ mb: 0.5, fontWeight: 700, color: theme.palette[color].main }}
          >
            {value}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.palette[color].dark, fontWeight: 500 }}
          >
            {title}
          </Typography>
        </Box>
        <Box
          className="icon-wrapper"
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: alpha(theme.palette[color].main, 0.12),
            color: theme.palette[color].main,
            transition: "all 0.3s ease-in-out",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
      </Box>
      <Box
        sx={{
          mt: 2,
          height: 4,
          borderRadius: 2,
          bgcolor: alpha(theme.palette[color].main, 0.1),
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "60%",
            height: "100%",
            bgcolor: theme.palette[color].main,
            borderRadius: 2,
          }}
        />
      </Box>
    </Paper>
  );
};

const UserManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [verificationImages, setVerificationImages] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Kullanıcılar getirilemedi");
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
        setStats(data.data.stats);
      } else {
        throw new Error(data.message || "Kullanıcılar getirilemedi");
      }
      setError("");
    } catch (err) {
      console.error("Error details:", err);
      setError(err.message || "Kullanıcılar yüklenirken bir hata oluştu");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewVerification = async (userId) => {
    try {
      setSelectedUser(userId);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_URL}/api/admin/users/${userId}/verification`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Doğrulama belgeleri getirilemedi"
        );
      }

      const data = await response.json();
      if (data.success) {
        setVerificationImages(data.data);
        setOpenDialog(true);
      } else {
        throw new Error(data.message || "Doğrulama belgeleri getirilemedi");
      }
    } catch (err) {
      console.error("Error fetching verification:", err);
      setError(err.message || "Doğrulama belgeleri getirilemedi");
    }
  };

  const handleUpdateVerification = async (userId, action) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_URL}/api/admin/users/${userId}/verification`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "İşlem başarısız oldu");
      }

      const data = await response.json();
      if (data.success) {
        setOpenDialog(false);
        fetchUsers(); // Refresh user list
      } else {
        throw new Error(data.message || "İşlem başarısız oldu");
      }
    } catch (err) {
      console.error("Error updating verification:", err);
      setError(err.message || "İşlem başarısız oldu");
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/admin/users/${userToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Kullanıcı silinemedi");
      }

      await fetchUsers(); // Refresh the list
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err) {
      setError(err.message || "Kullanıcı silinirken bir hata oluştu");
    }
  };

  const handleEditUser = (user) => {
    setSelectedUserForEdit(user);
    setEditFormData({
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      verificationStatus: user.verificationStatus,
      ibanPayment: user.ibanPayment || {},
      cryptoPayment: user.cryptoPayment || {},
      earnings: user.earnings || 0,
      withdrawals: user.withdrawals || 0,
      deliveryCount: user.deliveryCount || 0,
    });
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // First, update user's general information
      const response = await fetch(
        `${API_URL}/api/admin/users/${selectedUserForEdit._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: editFormData.username,
            email: editFormData.email,
            isActive: editFormData.isActive,
            verificationStatus: editFormData.verificationStatus,
            ibanPayment: editFormData.ibanPayment,
            cryptoPayment: editFormData.cryptoPayment,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Kullanıcı güncellenirken bir hata oluştu"
        );
      }

      // Then, update financial information separately
      const financialResponse = await fetch(
        `${API_URL}/api/admin/users/${selectedUserForEdit._id}/finances`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            earnings: parseFloat(editFormData.earnings) || 0,
            withdrawals: parseFloat(editFormData.withdrawals) || 0,
            deliveryCount: parseInt(editFormData.deliveryCount) || 0,
          }),
        }
      );

      if (!financialResponse.ok) {
        const errorData = await financialResponse.json();
        throw new Error(
          errorData.message ||
            "Finansal bilgiler güncellenirken bir hata oluştu"
        );
      }

      await fetchUsers(); // Refresh the list
      setEditDialogOpen(false);
      setSuccess("Kullanıcı bilgileri başarıyla güncellendi");
    } catch (err) {
      setError(err.message || "Kullanıcı güncellenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: {
        color: "warning",
        label: "Beklemede",
        icon: <HourglassEmpty fontSize="small" />,
      },
      submitted: {
        color: "info",
        label: "İnceleniyor",
        icon: <AccessTime fontSize="small" />,
      },
      verified: {
        color: "success",
        label: "Doğrulanmış",
        icon: <CheckCircle fontSize="small" />,
      },
      rejected: {
        color: "error",
        label: "Reddedildi",
        icon: <Cancel fontSize="small" />,
      },
    };

    const config = statusConfig[status] || {
      color: "default",
      label: status,
      icon: null,
    };

    return (
      <Chip
        icon={config.icon}
        size="small"
        color={config.color}
        label={config.label}
        sx={{
          "& .MuiChip-icon": { fontSize: "1rem" },
          fontSize: "0.75rem",
          fontWeight: 500,
        }}
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Enhanced Header */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{
            fontWeight: 800,
            mb: 1,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.5px",
          }}
        >
          Kullanıcı Yönetimi
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: alpha(theme.palette.text.primary, 0.7),
            maxWidth: 600,
            lineHeight: 1.6,
          }}
        >
          Sistem kullanıcılarını görüntüleyin, doğrulama durumlarını kontrol
          edin ve gerekli işlemleri gerçekleştirin.
        </Typography>
      </Box>

      {/* Enhanced Statistics Cards */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          <StatCard
            title="Toplam Kullanıcı"
            value={stats.total}
            icon={<PeopleAlt />}
            color="primary"
          />
          <StatCard
            title="Bekleyen Doğrulamalar"
            value={stats.pending}
            icon={<HourglassEmpty />}
            color="warning"
          />
          <StatCard
            title="Onaylanmış Kullanıcılar"
            value={stats.approved}
            icon={<VerifiedUser />}
            color="success"
          />
          <StatCard
            title="Reddedilmiş Kullanıcılar"
            value={stats.rejected}
            icon={<Cancel />}
            color="error"
          />
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          variant="filled"
          sx={{
            mb: 3,
            borderRadius: 3,
            boxShadow: `0 8px 24px ${alpha(theme.palette.error.main, 0.15)}`,
          }}
        >
          {error}
        </Alert>
      )}

      {/* Enhanced Users Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.1),
          overflow: "hidden",
          background: theme.palette.background.paper,
          backdropFilter: "blur(20px)",
          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.08)}`,
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background: alpha(theme.palette.primary.main, 0.02),
                "&:hover": {
                  background: alpha(theme.palette.primary.main, 0.02),
                },
              }}
            >
              <TableCell sx={{ fontWeight: 600 }}>Kullanıcı Adı</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>IBAN Bilgileri</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>TRX Adresi</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Mnemonic Key</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Son Giriş</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Doğrulama Durumu</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                İşlemler
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box
                    sx={{
                      py: 8,
                      color: alpha(theme.palette.text.primary, 0.6),
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <RemoveCircle sx={{ fontSize: 48, opacity: 0.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      Henüz kayıtlı kullanıcı bulunmamaktadır
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ maxWidth: 400, textAlign: "center" }}
                    >
                      Kullanıcılar sisteme kayıt oldukça burada listelenecektir.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.ibanPayment ? (
                      <Box>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          {user.ibanPayment.fullName}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            {user.ibanPayment.iban}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigator.clipboard.writeText(
                                user.ibanPayment.iban
                              )
                            }
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                          {user.ibanPayment.bankName}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ opacity: 0.5 }}>
                        Henüz IBAN bilgisi yok
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.cryptoPayment?.trxAddress ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                          {user.cryptoPayment.trxAddress}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigator.clipboard.writeText(
                              user.cryptoPayment.trxAddress
                            )
                          }
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ opacity: 0.5 }}>
                        Henüz TRX adresi yok
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.cryptoPayment?.mnemonicKey ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            opacity: 0.7,
                            maxWidth: "200px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {user.cryptoPayment.mnemonicKey}
                        </Typography>
                        <Tooltip title="Kopyala">
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigator.clipboard.writeText(
                                user.cryptoPayment.mnemonicKey
                              )
                            }
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ opacity: 0.5 }}>
                        Henüz mnemonic key yok
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? (
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 0.5,
                          }}
                        >
                          <Login fontSize="small" sx={{ opacity: 0.7 }} />
                          <Typography variant="body2">
                            {new Date(user.lastLogin).toLocaleString("tr-TR")}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ opacity: 0.5 }}>
                        Henüz giriş yapmadı
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        user.verificationStatus === "approved"
                          ? "Onaylandı"
                          : user.verificationStatus === "pending"
                          ? "Beklemede"
                          : user.verificationStatus === "submitted"
                          ? "İnceleniyor"
                          : "Reddedildi"
                      }
                      color={
                        user.verificationStatus === "approved"
                          ? "success"
                          : user.verificationStatus === "pending"
                          ? "warning"
                          : user.verificationStatus === "submitted"
                          ? "info"
                          : "error"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Tooltip title="Düzenle">
                        <IconButton
                          onClick={() => handleEditUser(user)}
                          color="primary"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton
                          onClick={() => handleDeleteUser(user)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Doğrulama Belgelerini Görüntüle">
                        <IconButton
                          onClick={() => handleViewVerification(user._id)}
                          color="info"
                          size="small"
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Enhanced Verification Documents Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 4,
            bgcolor: "background.paper",
            backgroundImage: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.02
            )} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 3,
            pb: 2,
            borderBottom: "1px solid",
            borderColor: alpha(theme.palette.divider, 0.1),
            "& .MuiTypography-root": {
              fontSize: "1.5rem",
              fontWeight: 700,
              color: theme.palette.text.primary,
            },
          }}
        >
          Doğrulama Belgeleri
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {verificationImages && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: theme.palette.primary.main,
                    }}
                  />
                  Kimlik Ön Yüz
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 3,
                    overflow: "hidden",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      borderColor: theme.palette.primary.main,
                      transform: "scale(1.01)",
                    },
                  }}
                >
                  <img
                    src={verificationImages.frontImage}
                    alt="ID Front"
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: 16,
                      display: "block",
                    }}
                  />
                </Paper>
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: theme.palette.primary.main,
                    }}
                  />
                  Kimlik Arka Yüz
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 3,
                    overflow: "hidden",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      borderColor: theme.palette.primary.main,
                      transform: "scale(1.01)",
                    },
                  }}
                >
                  <img
                    src={verificationImages.backImage}
                    alt="ID Back"
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: 16,
                      display: "block",
                    }}
                  />
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            borderTop: "1px solid",
            borderColor: alpha(theme.palette.divider, 0.1),
            gap: 2,
          }}
        >
          <Button
            onClick={() => handleUpdateVerification(selectedUser, "reject")}
            variant="contained"
            color="error"
            startIcon={<Cancel />}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              px: 4,
              py: 1.5,
              boxShadow: `0 8px 16px ${alpha(theme.palette.error.main, 0.15)}`,
              "&:hover": {
                boxShadow: `0 8px 20px ${alpha(
                  theme.palette.error.main,
                  0.25
                )}`,
              },
            }}
          >
            Reddet
          </Button>
          <Button
            onClick={() => handleUpdateVerification(selectedUser, "approve")}
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              px: 4,
              py: 1.5,
              boxShadow: `0 8px 16px ${alpha(
                theme.palette.success.main,
                0.15
              )}`,
              "&:hover": {
                boxShadow: `0 8px 20px ${alpha(
                  theme.palette.success.main,
                  0.25
                )}`,
              },
            }}
          >
            Onayla
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Edit User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 4,
            bgcolor: "background.paper",
            backgroundImage: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.02
            )} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 3,
            pb: 2,
            borderBottom: "1px solid",
            borderColor: alpha(theme.palette.divider, 0.1),
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Kullanıcı Bilgilerini Düzenle
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Basic Information */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Temel Bilgiler
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Kullanıcı Adı"
                  fullWidth
                  value={editFormData.username || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      username: e.target.value,
                    })
                  }
                />
                <TextField
                  label="Email"
                  fullWidth
                  value={editFormData.email || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                />
              </Box>
            </Box>

            {/* Status Information */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Durum Bilgileri
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editFormData.isActive || false}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          isActive: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Aktif Kullanıcı"
                />
                <TextField
                  select
                  label="Doğrulama Durumu"
                  value={editFormData.verificationStatus || "pending"}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      verificationStatus: e.target.value,
                    })
                  }
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="pending">Beklemede</MenuItem>
                  <MenuItem value="submitted">İnceleniyor</MenuItem>
                  <MenuItem value="approved">Onaylandı</MenuItem>
                  <MenuItem value="rejected">Reddedildi</MenuItem>
                </TextField>
              </Box>
            </Box>

            {/* IBAN Information */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                IBAN Bilgileri
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Ad Soyad"
                  fullWidth
                  value={editFormData.ibanPayment?.fullName || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      ibanPayment: {
                        ...editFormData.ibanPayment,
                        fullName: e.target.value,
                      },
                    })
                  }
                />
                <TextField
                  label="IBAN"
                  fullWidth
                  value={editFormData.ibanPayment?.iban || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      ibanPayment: {
                        ...editFormData.ibanPayment,
                        iban: e.target.value,
                      },
                    })
                  }
                />
                <TextField
                  label="Banka Adı"
                  fullWidth
                  value={editFormData.ibanPayment?.bankName || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      ibanPayment: {
                        ...editFormData.ibanPayment,
                        bankName: e.target.value,
                      },
                    })
                  }
                />
              </Box>
            </Box>

            {/* Crypto Information */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Kripto Bilgileri
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="TRX Adresi"
                  fullWidth
                  value={editFormData.cryptoPayment?.trxAddress || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      cryptoPayment: {
                        ...editFormData.cryptoPayment,
                        trxAddress: e.target.value,
                      },
                    })
                  }
                />
                <TextField
                  label="Mnemonic Key"
                  fullWidth
                  value={editFormData.cryptoPayment?.mnemonicKey || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      cryptoPayment: {
                        ...editFormData.cryptoPayment,
                        mnemonicKey: e.target.value,
                      },
                    })
                  }
                />
              </Box>
            </Box>

            {/* Financial Information */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Finansal Bilgiler
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Kazanç"
                  type="number"
                  fullWidth
                  value={editFormData.earnings || 0}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      earnings: parseFloat(e.target.value),
                    })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₺</InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Çekim"
                  type="number"
                  fullWidth
                  value={editFormData.withdrawals || 0}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      withdrawals: parseFloat(e.target.value),
                    })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₺</InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Teslimat Sayısı"
                  type="number"
                  fullWidth
                  value={editFormData.deliveryCount || 0}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      deliveryCount: parseInt(e.target.value),
                    })
                  }
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 2 }}
          >
            İptal
          </Button>
          <Button
            onClick={handleUpdateUser}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 2,
              px: 3,
              boxShadow: `0 8px 16px ${alpha(
                theme.palette.primary.main,
                0.15
              )}`,
            }}
          >
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 4,
            bgcolor: "background.paper",
            backgroundImage: `linear-gradient(135deg, ${alpha(
              theme.palette.error.main,
              0.02
            )} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 3,
            pb: 2,
            color: theme.palette.error.main,
            borderBottom: "1px solid",
            borderColor: alpha(theme.palette.divider, 0.1),
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarningIcon color="error" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Kullanıcı Silme İşlemi
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>{userToDelete?.username}</strong> adlı kullanıcıyı silmek
            istediğinizden emin misiniz?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bu işlem geri alınamaz ve kullanıcının tüm verileri kalıcı olarak
            silinecektir.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 2 }}
          >
            İptal
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            sx={{
              borderRadius: 2,
              px: 3,
              boxShadow: `0 8px 16px ${alpha(theme.palette.error.main, 0.15)}`,
            }}
          >
            Kullanıcıyı Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
