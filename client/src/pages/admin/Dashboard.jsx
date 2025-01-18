import React, { useState, useEffect } from "react";
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
} from "@mui/icons-material";
import axios from "axios";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

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

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingVerifications: 0,
    verifiedUsers: 0,
    totalDeliveries: 0,
    totalEarnings: 0,
    todayEarnings: 0,
    monthlyEarnings: 0,
    pendingPayments: 0,
    completedPayments: 0,
    recentActivities: [],
    loading: true,
    error: null,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${API_URL}/api/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setStats({
        totalUsers: response.data.totalUsers || 0,
        pendingVerifications: response.data.pendingVerifications || 0,
        verifiedUsers: response.data.verifiedUsers || 0,
        totalDeliveries: response.data.totalDeliveries || 0,
        totalEarnings: response.data.totalEarnings || 0,
        todayEarnings: response.data.todayEarnings || 0,
        monthlyEarnings: response.data.monthlyEarnings || 0,
        pendingPayments: response.data.pendingPayments || 0,
        completedPayments: response.data.completedPayments || 0,
        recentActivities: response.data.recentActivities || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: "Dashboard verilerini getirirken bir hata oluştu.",
      }));
    } finally {
      setRefreshing(false);
    }
  };

  if (stats.loading) {
    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Box
        sx={{
          mb: { xs: 3, sm: 4, md: 5 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          gap: { xs: 2, sm: 0 },
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            gutterBottom
            sx={{
              fontWeight: "bold",
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Yönetici Paneli
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchDashboardData}
          disabled={refreshing}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 3,
          }}
        >
          {refreshing ? "Yenileniyor..." : "Yenile"}
        </Button>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Kullanıcı"
            value={stats.totalUsers}
            icon={<PeopleAlt />}
            color={theme.palette.primary.main}
            trend={12}
            loading={stats.loading}
            subtitle={`${stats.verifiedUsers} onaylı kullanıcı`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Onay Bekleyen"
            value={stats.pendingVerifications}
            icon={<PersonAdd />}
            color={theme.palette.warning.main}
            loading={stats.loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Teslimat"
            value={stats.totalDeliveries}
            icon={<LocalShipping />}
            color={theme.palette.success.main}
            trend={8}
            loading={stats.loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Günlük Kazanç"
            value={stats.todayEarnings}
            icon={<AttachMoney />}
            color={theme.palette.info.main}
            prefix="₺"
            loading={stats.loading}
            subtitle={`Bu ay: ₺${stats.monthlyEarnings.toLocaleString(
              "tr-TR"
            )}`}
          />
        </Grid>
      </Grid>

      {/* Second Row Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Toplam Kazanç"
            value={stats.totalEarnings}
            icon={<AccountBalance />}
            color={theme.palette.success.main}
            prefix="₺"
            loading={stats.loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Bekleyen Ödemeler"
            value={stats.pendingPayments}
            icon={<CreditCard />}
            color={theme.palette.warning.main}
            prefix="₺"
            loading={stats.loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Tamamlanan Ödemeler"
            value={stats.completedPayments}
            icon={<Receipt />}
            color={theme.palette.info.main}
            prefix="₺"
            loading={stats.loading}
          />
        </Grid>
      </Grid>

      {/* Activity Timeline */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              height: "100%",
              border: "1px solid",
              borderColor: theme.palette.divider,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              <Typography variant="h6" fontWeight="600">
                Son Aktiviteler
              </Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
            <List>
              {stats.recentActivities.map((activity, index) => (
                <React.Fragment key={index}>
                  <ActivityItem
                    icon={
                      activity.type === "verification" ? (
                        <PersonAdd />
                      ) : activity.type === "delivery" ? (
                        <LocalShipping />
                      ) : activity.type === "payment" ? (
                        <Payments />
                      ) : (
                        <NotificationsActive />
                      )
                    }
                    primary={activity.message}
                    secondary={activity.user}
                    time={format(new Date(activity.timestamp), "HH:mm")}
                    status={activity.status}
                    onClick={() => {
                      /* Handle activity click */
                    }}
                  />
                  {index < stats.recentActivities.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              height: "100%",
              border: "1px solid",
              borderColor: theme.palette.divider,
            }}
          >
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Hızlı İstatistikler
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Onaylı Kullanıcı Oranı
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box sx={{ flexGrow: 1, mr: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(stats.verifiedUsers / stats.totalUsers) * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {Math.round((stats.verifiedUsers / stats.totalUsers) * 100)}%
                </Typography>
              </Box>

              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Ödeme Tamamlanma Oranı
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box sx={{ flexGrow: 1, mr: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={
                      (stats.completedPayments /
                        (stats.completedPayments + stats.pendingPayments)) *
                      100
                    }
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(
                    (stats.completedPayments /
                      (stats.completedPayments + stats.pendingPayments)) *
                      100
                  )}
                  %
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
