import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
  useTheme,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AdminPanelSettings,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ManagerManagement = () => {
  const theme = useTheme();
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Selected manager state
  const [selectedManager, setSelectedManager] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    isActive: true,
    totalEarnings: 0,
    totalWithdrawals: 0,
    commissionRate: 10,
    permissions: {
      users: { create: false, read: true, update: false, delete: false },
      deliveries: { create: false, read: true, update: false, delete: false },
      accounting: { create: false, read: true, update: false, delete: false },
      announcements: {
        create: false,
        read: true,
        update: false,
        delete: false,
      },
      posts: { create: false, read: true, update: false, delete: false },
    },
  });

  const moduleTranslations = {
    users: "Kullanıcılar",
    deliveries: "Teslimatlar",
    accounting: "Muhasebe",
    announcements: "Duyurular",
    posts: "Gönderiler",
  };

  const actionTranslations = {
    create: "Oluşturma",
    read: "Görüntüleme",
    update: "Düzenleme",
    delete: "Silme",
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/managers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Müdürler getirilemedi");
      }

      const data = await response.json();
      setManagers(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManager = async () => {
    try {
      setError("");

      // Validate password length
      if (formData.password.length < 6) {
        setError("Şifre en az 6 karakter olmalıdır");
        return;
      }

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/managers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific validation errors
        if (data.message && data.message.includes("validation failed")) {
          if (data.message.includes("password")) {
            throw new Error("Şifre en az 6 karakter olmalıdır");
          } else if (data.message.includes("username")) {
            throw new Error("Bu kullanıcı adı zaten kullanılıyor");
          } else if (data.message.includes("email")) {
            throw new Error("Bu email adresi zaten kullanılıyor");
          }
        }
        throw new Error(data.message || "Müdür oluşturulamadı");
      }

      await fetchManagers();
      setCreateDialogOpen(false);
      setSuccess("Müdür başarıyla oluşturuldu");
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateManager = async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/managers/${selectedManager._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Müdür güncellenemedi");
      }

      await fetchManagers();
      setEditDialogOpen(false);
      setSuccess("Müdür başarıyla güncellendi");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdatePermissions = async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/managers/${selectedManager._id}/permissions`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ permissions: formData.permissions }),
        }
      );

      if (!response.ok) {
        throw new Error("Yetkiler güncellenemedi");
      }

      await fetchManagers();
      setPermissionsDialogOpen(false);
      setSuccess("Yetkiler başarıyla güncellendi");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteManager = async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/managers/${selectedManager._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Müdür silinemedi");
      }

      await fetchManagers();
      setDeleteDialogOpen(false);
      setSuccess("Müdür başarıyla silindi");
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      fullName: "",
      isActive: true,
      totalEarnings: 0,
      totalWithdrawals: 0,
      commissionRate: 10,
      permissions: {
        users: { create: false, read: true, update: false, delete: false },
        deliveries: { create: false, read: true, update: false, delete: false },
        accounting: { create: false, read: true, update: false, delete: false },
        announcements: {
          create: false,
          read: true,
          update: false,
          delete: false,
        },
        posts: { create: false, read: true, update: false, delete: false },
      },
    });
  };

  const handleEditClick = (manager) => {
    setSelectedManager(manager);
    setFormData({
      username: manager.username,
      email: manager.email,
      fullName: manager.fullName,
      isActive: manager.isActive,
      totalEarnings: manager.totalEarnings || 0,
      totalWithdrawals: manager.totalWithdrawals || 0,
      commissionRate: manager.commissionRate || 10,
      permissions: manager.permissions,
    });
    setEditDialogOpen(true);
  };

  const handlePermissionsClick = (manager) => {
    setSelectedManager(manager);
    setFormData({ ...formData, permissions: manager.permissions });
    setPermissionsDialogOpen(true);
  };

  const handleDeleteClick = (manager) => {
    setSelectedManager(manager);
    setDeleteDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Müdür Yönetimi
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>
            Sistem müdürlerini ve yetkilerini yönetin
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          }}
        >
          Yeni Müdür
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Managers Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: theme.shadows[3],
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(8px)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ad Soyad</TableCell>
              <TableCell>Kullanıcı Adı</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Toplam Kazanç</TableCell>
              <TableCell>Komisyon</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : managers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Henüz müdür bulunmuyor
                </TableCell>
              </TableRow>
            ) : (
              managers.map((manager) => (
                <TableRow key={manager._id}>
                  <TableCell>{manager.fullName}</TableCell>
                  <TableCell>{manager.username}</TableCell>
                  <TableCell>{manager.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={manager.isActive ? "Aktif" : "Pasif"}
                      color={manager.isActive ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    }).format(manager.totalEarnings || 0)}
                  </TableCell>
                  <TableCell>%{manager.commissionRate || 10}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Yetkileri Düzenle">
                      <IconButton
                        onClick={() => handlePermissionsClick(manager)}
                        color="primary"
                      >
                        <SecurityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzenle">
                      <IconButton
                        onClick={() => handleEditClick(manager)}
                        color="info"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton
                        onClick={() => handleDeleteClick(manager)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog
        open={createDialogOpen || editDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditDialogOpen(false);
          resetForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {createDialogOpen ? "Yeni Müdür Oluştur" : "Müdür Düzenle"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ad Soyad"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kullanıcı Adı"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Grid>
            {createDialogOpen && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Şifre"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  error={
                    formData.password.length > 0 && formData.password.length < 6
                  }
                  helperText={
                    formData.password.length > 0 && formData.password.length < 6
                      ? "Şifre en az 6 karakter olmalıdır"
                      : ""
                  }
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                }
                label="Aktif"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                }}
              >
                Finansal Bilgiler
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Toplam Kazanç"
                type="number"
                value={formData.totalEarnings || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalEarnings: parseFloat(e.target.value),
                  })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₺</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Toplam Çekim"
                type="number"
                value={formData.totalWithdrawals || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalWithdrawals: parseFloat(e.target.value),
                  })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₺</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Komisyon Oranı (%)"
                type="number"
                value={formData.commissionRate || 10}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    commissionRate: parseFloat(e.target.value),
                  })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateDialogOpen(false);
              setEditDialogOpen(false);
              resetForm();
            }}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={
              createDialogOpen ? handleCreateManager : handleUpdateManager
            }
          >
            {createDialogOpen ? "Oluştur" : "Güncelle"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog
        open={permissionsDialogOpen}
        onClose={() => setPermissionsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Müdür Yetkileri</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {Object.entries(formData.permissions).map(
              ([module, permissions]) => (
                <Grid item xs={12} key={module}>
                  <Paper
                    sx={{
                      p: 2,
                      background: alpha(theme.palette.background.paper, 0.6),
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                      }}
                    >
                      {moduleTranslations[module]} Yetkileri
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(permissions).map(([action, value]) => (
                        <Grid item xs={6} sm={3} key={action}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={value}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    permissions: {
                                      ...formData.permissions,
                                      [module]: {
                                        ...formData.permissions[module],
                                        [action]: e.target.checked,
                                      },
                                    },
                                  })
                                }
                                color="primary"
                              />
                            }
                            label={actionTranslations[action]}
                            sx={{
                              "& .MuiTypography-root": {
                                fontSize: "0.9rem",
                                color: theme.palette.text.secondary,
                              },
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>
              )
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionsDialogOpen(false)}>İptal</Button>
          <Button variant="contained" onClick={handleUpdatePermissions}>
            Yetkileri Güncelle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Müdür Sil</DialogTitle>
        <DialogContent>
          <Typography>
            {selectedManager?.fullName} isimli müdürü silmek istediğinizden emin
            misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteManager}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagerManagement;
