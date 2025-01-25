import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  TablePagination,
  Tooltip,
  Chip,
  InputAdornment,
  Divider,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FileDownload as FileDownloadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  AccountBalance as AccountBalanceIcon,
  AccountBalanceWallet,
} from "@mui/icons-material";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { alpha } from "@mui/material/styles";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const StatCard = ({ title, value = 0, icon, color, bgColor, trend }) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        height: "100%",
        background: bgColor,
        borderRadius: 4,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateY(-5px)",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -15,
          right: -15,
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: `linear-gradient(45deg, ${color}22, ${color}11)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Typography variant="body2" color="text.secondary" mb={1}>
        {title}
      </Typography>
      <Typography variant="h4" fontWeight="bold" color={color}>
        {(value || 0).toLocaleString("tr-TR", {
          style: "currency",
          currency: "TRY",
        })}
      </Typography>
      {trend && (
        <Box mt={2} display="flex" alignItems="center">
          <Chip
            size="small"
            icon={trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
            label={`${Math.abs(trend)}% ${trend > 0 ? "artış" : "azalış"}`}
            color={trend > 0 ? "success" : "error"}
            sx={{ borderRadius: 1 }}
          />
        </Box>
      )}
    </Paper>
  );
};

const Accounting = () => {
  const [entries, setEntries] = useState([]);
  const [totals, setTotals] = useState({
    office_income: 0,
    office_expense: 0,
    system_revenue: 0,
    system_expense: 0,
    office_net: 0,
    system_net: 0,
    user_earnings: {
      total: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [selectedType, setSelectedType] = useState("all");
  const [formData, setFormData] = useState({
    type: "",
    amount: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem("token");
      let url = `${API_URL}/api/accounting?`;

      if (dateRange.startDate) url += `&startDate=${dateRange.startDate}`;
      if (dateRange.endDate) url += `&endDate=${dateRange.endDate}`;
      if (selectedType !== "all") url += `&type=${selectedType}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Muhasebe kayıtları getirilemedi");
      }

      const data = await response.json();
      if (data.success) {
        setEntries(data.data.entries);
        setTotals({
          ...data.data.totals,
          office_net: data.data.office_net,
          system_net: data.data.system_net,
          user_earnings: data.data.user_earnings,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
    // Set up interval to fetch data every 30 seconds
    const interval = setInterval(fetchEntries, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [dateRange, selectedType]);

  const filteredEntries = entries.filter((entry) =>
    entry.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (entry = null) => {
    if (entry) {
      setSelectedEntry(entry);
      setFormData({
        type: entry.type,
        amount: entry.amount,
        description: entry.description,
        date: format(new Date(entry.date), "yyyy-MM-dd"),
      });
    } else {
      setSelectedEntry(null);
      setFormData({
        type: "",
        amount: "",
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEntry(null);
    setFormData({
      type: "",
      amount: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const url = selectedEntry
        ? `${API_URL}/api/accounting/${selectedEntry._id}`
        : `${API_URL}/api/accounting`;
      const method = selectedEntry ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("İşlem başarısız");
      }

      handleCloseDialog();
      fetchEntries();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu kaydı silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/accounting/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Kayıt silinemedi");
      }

      fetchEntries();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExportData = () => {
    const csvContent = [
      ["Tarih", "Tür", "Açıklama", "Tutar"],
      ...filteredEntries.map((entry) => [
        format(new Date(entry.date), "dd.MM.yyyy"),
        entry.type === "office_income"
          ? "Ofis Geliri"
          : entry.type === "office_expense"
          ? "Ofis Gideri"
          : entry.type === "system_revenue"
          ? "Sistem Geliri"
          : "Sistem Gideri",
        entry.description,
        entry.amount.toLocaleString("tr-TR", {
          style: "currency",
          currency: "TRY",
        }),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `muhasebe_${format(new Date(), "dd_MM_yyyy")}.csv`;
    link.click();
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

  const getTypeColor = (type) => {
    switch (type) {
      case "office_income":
        return "#4caf50";
      case "office_expense":
        return "#f44336";
      case "system_revenue":
        return "#2196f3";
      case "system_expense":
        return "#ff9800";
      default:
        return "#757575";
    }
  };

  return (
    <Box>
      <Box
        mb={4}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h4" fontWeight="bold" color="primary">
          Muhasebe
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportData}
            sx={{ mr: 2 }}
          >
            Dışa Aktar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Yeni Kayıt
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ofis Geliri"
            value={totals.office_income}
            icon={<TrendingUpIcon sx={{ fontSize: 40, color: "#4caf50" }} />}
            color="#4caf50"
            bgColor="#E8F5E9"
            trend={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ofis Gideri"
            value={totals.office_expense}
            icon={<TrendingDownIcon sx={{ fontSize: 40, color: "#f44336" }} />}
            color="#f44336"
            bgColor="#FFEBEE"
            trend={-8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sistem Geliri"
            value={totals.system_revenue}
            icon={<TrendingUpIcon sx={{ fontSize: 40, color: "#2196f3" }} />}
            color="#2196f3"
            bgColor="#E3F2FD"
            trend={15}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sistem Gideri"
            value={totals.system_expense}
            icon={<TrendingDownIcon sx={{ fontSize: 40, color: "#ff9800" }} />}
            color="#ff9800"
            bgColor="#FFF3E0"
            trend={-5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Kullanıcı Kazancı"
            value={totals.user_earnings?.total || 0}
            icon={
              <AccountBalanceIcon sx={{ fontSize: 40, color: "#9c27b0" }} />
            }
            color="#9c27b0"
            bgColor="#F3E5F5"
          />
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 4 }} elevation={2}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              variant="outlined"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterIcon />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="all">Tüm Kayıtlar</MenuItem>
              <MenuItem value="office_income">Ofis Geliri</MenuItem>
              <MenuItem value="office_expense">Ofis Gideri</MenuItem>
              <MenuItem value="system_revenue">Sistem Geliri</MenuItem>
              <MenuItem value="system_expense">Sistem Gideri</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={5}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  variant="outlined"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRangeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  variant="outlined"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                  size="small"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Data Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tarih</TableCell>
              <TableCell>Tür</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell align="right">Tutar</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEntries
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((entry) => (
                <TableRow
                  key={entry._id}
                  sx={{
                    "&:hover": { backgroundColor: "action.hover" },
                  }}
                >
                  <TableCell>
                    {format(new Date(entry.date), "dd.MM.yyyy")}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        entry.type === "office_income"
                          ? "Ofis Geliri"
                          : entry.type === "office_expense"
                          ? "Ofis Gideri"
                          : entry.type === "system_revenue"
                          ? "Sistem Geliri"
                          : "Sistem Gideri"
                      }
                      size="small"
                      sx={{
                        backgroundColor: `${getTypeColor(entry.type)}22`,
                        color: getTypeColor(entry.type),
                        fontWeight: "bold",
                      }}
                    />
                  </TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell align="right">
                    <Typography
                      color={
                        entry.type.includes("income") ||
                        entry.type.includes("revenue")
                          ? "success.main"
                          : "error.main"
                      }
                      fontWeight="bold"
                    >
                      {(entry.amount || 0).toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Düzenle">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(entry)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(entry._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredEntries.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Sayfa başına kayıt:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count}`
          }
        />
      </TableContainer>

      {/* User Earnings Table */}
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          p: 3,
          background: (theme) =>
            `linear-gradient(145deg, ${alpha(
              theme.palette.background.paper,
              0.9
            )} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
          backdropFilter: "blur(10px)",
          border: (theme) =>
            `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
          <AccountBalanceWallet sx={{ color: "primary.main", fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Kullanıcı Kazançları
          </Typography>
        </Box>

        <TableContainer
          sx={{
            borderRadius: 2,
            "& .MuiTableCell-root": {
              borderColor: (theme) => alpha(theme.palette.divider, 0.1),
            },
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>Tarih</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>
                  Kullanıcı Adı
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, py: 2 }}>
                  Kazanç
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {totals?.user_earnings?.details?.map((user, index) => (
                <TableRow
                  key={user.username}
                  sx={{
                    transition: "all 0.2s",
                    "&:hover": {
                      backgroundColor: (theme) =>
                        alpha(theme.palette.primary.main, 0.05),
                    },
                    // Alternate row colors
                    ...(index % 2 === 0 && {
                      backgroundColor: (theme) =>
                        alpha(theme.palette.background.default, 0.3),
                    }),
                  }}
                >
                  <TableCell>
                    {new Date(user.date).toLocaleDateString("tr-TR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.1),
                          color: "primary.main",
                          fontSize: "0.875rem",
                        }}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                      {user.username}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: "success.main",
                        bgcolor: (theme) =>
                          alpha(theme.palette.success.main, 0.1),
                        py: 0.5,
                        px: 1.5,
                        borderRadius: 2,
                        display: "inline-block",
                      }}
                    >
                      {user.earnings.toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      })}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow
                sx={{
                  "& .MuiTableCell-root": {
                    borderTop: (theme) =>
                      `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    py: 2.5,
                  },
                }}
              >
                <TableCell
                  colSpan={2}
                  sx={{ fontWeight: 700, fontSize: "1rem" }}
                >
                  Toplam Kullanıcı Kazancı
                </TableCell>
                <TableCell align="right">
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      color: "primary.main",
                      bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, 0.1),
                      py: 1,
                      px: 2,
                      borderRadius: 2,
                      display: "inline-block",
                    }}
                  >
                    {totals?.user_earnings?.total?.toLocaleString("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    })}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedEntry ? "Kaydı Düzenle" : "Yeni Kayıt Ekle"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Tür"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  required
                >
                  <MenuItem value="office_income">Ofis Geliri</MenuItem>
                  <MenuItem value="office_expense">Ofis Gideri</MenuItem>
                  <MenuItem value="system_revenue">Sistem Geliri</MenuItem>
                  <MenuItem value="system_expense">Sistem Gideri</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tutar"
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₺</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Açıklama"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Tarih"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={selectedEntry ? <EditIcon /> : <AddIcon />}
          >
            {selectedEntry ? "Güncelle" : "Ekle"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Accounting;
