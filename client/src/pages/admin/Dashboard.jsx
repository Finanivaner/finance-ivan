import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  useMediaQuery,
  Button,
  Tooltip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  PeopleAlt,
  AccountBalance,
  TrendingUp,
  TrendingDown,
  Assessment,
  NotificationsActive,
  AccessTime,
  CheckCircle,
  Warning,
  LocalShipping,
  Payments,
  Person,
  PersonAdd,
  Refresh,
  MoreVert,
  AttachMoney,
  CreditCard,
  Receipt,
  Payment,
  Percent,
} from "@mui/icons-material";
import axios from "axios";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { alpha } from "@mui/material/styles";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Enhanced stat card component
const StatCard = ({
  title,
  value,
  icon,
  color,
  trend,
  loading,
  prefix,
  suffix,
  subtitle,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        height: "100%",
        borderRadius: 4,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
        border: "1px solid",
        borderColor: theme.palette.divider,
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 4px 20px ${theme.palette.primary.main}20`,
          borderColor: theme.palette.primary.main,
        },
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: `${color || theme.palette.primary.main}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {React.cloneElement(icon, {
            sx: {
              color: color || theme.palette.primary.main,
              fontSize: isMobile ? "1.5rem" : "2rem",
            },
          })}
        </Box>
        {trend !== undefined && !loading && (
          <Box sx={{ ml: "auto" }}>
            <Tooltip title={trend > 0 ? "Artış" : "Azalış"}>
              <IconButton
                size="small"
                sx={{
                  bgcolor: trend > 0 ? "success.dark" : "error.dark",
                  color: "#fff",
                  "&:hover": {
                    bgcolor: trend > 0 ? "success.main" : "error.main",
                  },
                }}
              >
                {trend > 0 ? (
                  <TrendingUp fontSize="small" />
                ) : (
                  <TrendingDown fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      <Typography
        variant={isMobile ? "h5" : "h4"}
        component="div"
        sx={{
          fontWeight: "bold",
          mb: 0.5,
          color: "text.primary",
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <>
            {prefix}
            {typeof value === "number" ? value.toLocaleString("tr-TR") : value}
            {suffix}
          </>
        )}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {title}
      </Typography>

      {subtitle && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 1 }}
        >
          {subtitle}
        </Typography>
      )}

      {trend !== undefined && !loading && (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="caption"
            sx={{
              color: trend > 0 ? "success.main" : "error.main",
              fontWeight: "bold",
            }}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            geçen aydan
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

// Enhanced activity item component
const ActivityItem = ({ icon, primary, secondary, time, status, onClick }) => {
  const theme = useTheme();
  return (
    <ListItem
      sx={{
        px: { xs: 2, sm: 3 },
        py: 2,
        borderRadius: 2,
        transition: "all 0.2s ease-in-out",
        cursor: onClick ? "pointer" : "default",
        "&:hover": {
          bgcolor: theme.palette.background.default,
          transform: onClick ? "translateX(4px)" : "none",
        },
      }}
      onClick={onClick}
    >
      <ListItemIcon>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: `${
              status === "success"
                ? theme.palette.success.main
                : status === "warning"
                ? theme.palette.warning.main
                : theme.palette.info.main
            }15`,
            color:
              status === "success"
                ? "success.main"
                : status === "warning"
                ? "warning.main"
                : "info.main",
          }}
        >
          {icon}
        </Box>
      </ListItemIcon>
      <ListItemText
        primary={primary}
        secondary={secondary}
        primaryTypographyProps={{
          variant: "subtitle2",
          color: "text.primary",
          fontWeight: "medium",
        }}
        secondaryTypographyProps={{
          variant: "caption",
          color: "text.secondary",
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
        {time}
      </Typography>
    </ListItem>
  );
};

const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalWithdrawals: 0,
    totalUsers: 0,
    totalManagers: 0,
    loading: true,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true }));
      const token = localStorage.getItem("token");

      // Fetch users and managers in parallel
      const [usersResponse, managersResponse] = await Promise.all([
        axios.get("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/managers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Set users and managers
      setUsers(usersResponse.data.data.users);
      setManagers(managersResponse.data.data);

      // Calculate totals
      const totalEarnings = managersResponse.data.data.reduce(
        (sum, manager) => sum + (manager.totalEarnings || 0),
        0
      );

      const totalWithdrawals = managersResponse.data.data.reduce(
        (sum, manager) => sum + (manager.totalWithdrawals || 0),
        0
      );

      // Update stats
      setStats({
        totalEarnings,
        totalWithdrawals,
        totalUsers: usersResponse.data.data.users.length,
        totalManagers: managersResponse.data.data.length,
        loading: false,
      });

      setError(null);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError(
        err.response?.data?.message ||
          "Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
      setStats((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Admin Paneli
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>
          Sistem istatistiklerini görüntüleyin
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Kazanç"
            value={new Intl.NumberFormat("tr-TR", {
              style: "currency",
              currency: "TRY",
            }).format(stats.totalEarnings || 0)}
            icon={<AccountBalance />}
            color={theme.palette.primary.main}
            loading={stats.loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Çekim"
            value={new Intl.NumberFormat("tr-TR", {
              style: "currency",
              currency: "TRY",
            }).format(stats.totalWithdrawals || 0)}
            icon={<Payment />}
            color={theme.palette.info.main}
            loading={stats.loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Kullanıcı"
            value={stats.totalUsers || 0}
            icon={<PeopleAlt />}
            color={theme.palette.success.main}
            loading={stats.loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Yönetici"
            value={stats.totalManagers || 0}
            icon={<Person />}
            color={theme.palette.warning.main}
            loading={stats.loading}
          />
        </Grid>
      </Grid>

      {/* Users Table */}
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          fontWeight: 700,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Kullanıcılar
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          mb: 4,
          borderRadius: 2,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(8px)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Kazanç</TableCell>
              <TableCell>Çekim</TableCell>
              <TableCell>Doğrulama Durumu</TableCell>
              <TableCell>Son Giriş</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users
              .filter((user) => user.verificationStatus === "approved")
              .map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? "Aktif" : "Pasif"}
                      color={user.isActive ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    }).format(user.earnings || 0)}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    }).format(user.withdrawals || 0)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        {
                          pending: "Beklemede",
                          submitted: "İnceleniyor",
                          approved: "Onaylandı",
                          rejected: "Reddedildi",
                        }[user.verificationStatus] || "Beklemede"
                      }
                      color={
                        {
                          pending: "warning",
                          submitted: "info",
                          approved: "success",
                          rejected: "error",
                        }[user.verificationStatus] || "warning"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.lastLogin
                      ? format(new Date(user.lastLogin), "dd.MM.yyyy HH:mm", {
                          locale: tr,
                        })
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Managers Table */}
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          fontWeight: 700,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Yöneticiler
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(8px)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ad Soyad</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Toplam Kazanç</TableCell>
              <TableCell>Toplam Çekim</TableCell>
              <TableCell>Komisyon Oranı</TableCell>
              <TableCell>Son Giriş</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {managers.map((manager) => (
              <TableRow key={manager._id}>
                <TableCell>{manager.fullName}</TableCell>
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
                <TableCell>
                  {new Intl.NumberFormat("tr-TR", {
                    style: "currency",
                    currency: "TRY",
                  }).format(manager.totalWithdrawals || 0)}
                </TableCell>
                <TableCell>%{manager.commissionRate || 10}</TableCell>
                <TableCell>
                  {manager.lastLogin
                    ? format(new Date(manager.lastLogin), "dd.MM.yyyy HH:mm", {
                        locale: tr,
                      })
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminDashboard;
