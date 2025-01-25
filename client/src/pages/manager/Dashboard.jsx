import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  AccountBalance,
  TrendingUp,
  Payment,
  Percent,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const StatCard = ({ title, value, icon, trend, color = "primary" }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: "blur(8px)",
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(135deg, ${alpha(
              theme.palette[color].main,
              0.2
            )} 0%, ${alpha(theme.palette[color].main, 0.1)} 100%)`,
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        {typeof value === "number"
          ? new Intl.NumberFormat("tr-TR", {
              style: "currency",
              currency: "TRY",
            }).format(value)
          : value}
      </Typography>
      {trend && (
        <Typography
          variant="body2"
          sx={{
            color: trend >= 0 ? "success.main" : "error.main",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            mt: 1,
          }}
        >
          {trend >= 0 ? "+" : ""}
          {trend}%
        </Typography>
      )}
    </Paper>
  );
};

const ManagerDashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/api/managers/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("İstatistikler alınamadı");
        }

        const data = await response.json();
        setStats(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
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
          Yönetici Paneli
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", mt: 1 }}>
          Finansal durumunuzu ve istatistiklerinizi görüntüleyin
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Kazanç"
            value={stats?.totalEarnings || 0}
            icon={<AccountBalance sx={{ color: theme.palette.primary.main }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Çekilebilir Tutar"
            value={stats?.withdrawableAmount || 0}
            icon={<TrendingUp sx={{ color: theme.palette.success.main }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Çekim"
            value={stats?.totalWithdrawals || 0}
            icon={<Payment sx={{ color: theme.palette.info.main }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Komisyon Oranı"
            value={`%${stats?.commissionRate || 0}`}
            icon={<Percent sx={{ color: theme.palette.warning.main }} />}
            color="warning"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManagerDashboard;
