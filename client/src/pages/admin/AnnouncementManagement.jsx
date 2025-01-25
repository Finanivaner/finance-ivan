import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Tooltip,
  Fade,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Campaign as CampaignIcon,
} from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AnnouncementManagement = () => {
  const theme = useTheme();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    content: "",
  });

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/announcements/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Duyurular getirilemedi");
      }

      const data = await response.json();
      if (data.success) {
        setAnnouncements(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenDialog = (announcement = null) => {
    if (announcement) {
      setSelectedAnnouncement(announcement);
      setFormData({
        content: announcement.content,
      });
    } else {
      setSelectedAnnouncement(null);
      setFormData({
        content: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAnnouncement(null);
    setFormData({
      content: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const url = selectedAnnouncement
        ? `${API_URL}/api/announcements/${selectedAnnouncement._id}`
        : `${API_URL}/api/announcements`;
      const method = selectedAnnouncement ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: formData.content,
        }),
      });

      if (!response.ok) {
        throw new Error("Duyuru kaydedilemedi");
      }

      await fetchAnnouncements();
      handleCloseDialog();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu duyuruyu silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/announcements/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Duyuru silinemedi");
      }

      await fetchAnnouncements();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box
        className="flex items-center justify-center min-h-screen"
        sx={{ bgcolor: "background.default" }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.1
          )} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CampaignIcon
              sx={{
                fontSize: 40,
                color: theme.palette.primary.main,
                transform: "rotate(-10deg)",
              }}
            />
            <Box>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Duyuru Yönetimi
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Kullanıcılara iletilecek duyuruları buradan yönetebilirsiniz
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Yeni Duyuru Ekle" arrow>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                boxShadow: theme.shadows[4],
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: theme.shadows[8],
                },
                transition: "all 0.3s ease",
              }}
            >
              Yeni Duyuru
            </Button>
          </Tooltip>
        </Box>
      </Paper>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 4,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
          }}
        >
          {error}
        </Alert>
      )}

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  fontWeight: 600,
                  py: 2,
                }}
              >
                İçerik
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  fontWeight: 600,
                  py: 2,
                  width: "120px",
                }}
              >
                İşlemler
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {announcements.map((announcement) => (
              <TableRow
                key={announcement._id}
                sx={{
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  },
                  transition: "background-color 0.2s ease",
                }}
              >
                <TableCell sx={{ py: 2.5 }}>{announcement.content}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Düzenle" arrow>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(announcement)}
                      sx={{
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Sil" arrow>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(announcement._id)}
                      sx={{
                        ml: 1,
                        "&:hover": {
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {announcements.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">
                    Henüz hiç duyuru eklenmemiş
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <CampaignIcon sx={{ color: theme.palette.primary.main }} />
          {selectedAnnouncement ? "Duyuru Düzenle" : "Yeni Duyuru"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Duyuru İçeriği"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              margin="normal"
              required
              multiline
              rows={4}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{
              borderRadius: 2,
              px: 3,
              color: theme.palette.text.secondary,
              "&:hover": {
                bgcolor: alpha(theme.palette.text.secondary, 0.05),
              },
            }}
          >
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 2,
              px: 3,
              boxShadow: theme.shadows[2],
              "&:hover": {
                boxShadow: theme.shadows[4],
              },
            }}
          >
            {selectedAnnouncement ? "Güncelle" : "Oluştur"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AnnouncementManagement;
