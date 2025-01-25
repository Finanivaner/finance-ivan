import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  CalendarToday,
  DateRange,
  EventNote,
  Assessment,
} from "@mui/icons-material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ReportCard = ({ title, icon, data, loading, error }) => {
  // Calculate net income
  const netIncome = (data.totalIncome || 0) - (data.totalExpense || 0);
  const isPositive = netIncome >= 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        background: "rgba(30, 41, 59, 0.5)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "20px",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-5px)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
          {title}
        </Typography>
        {!loading && !error && (
          <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
            {isPositive ? (
              <TrendingUp sx={{ color: "success.main", fontSize: 20 }} />
            ) : (
              <TrendingDown sx={{ color: "error.main", fontSize: 20 }} />
            )}
          </Box>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Toplam Gelir
              </Typography>
              <Typography
                variant="body1"
                color="success.main"
                sx={{ fontWeight: 600 }}
              >
                {data.totalIncome?.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}{" "}
                ₺
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Toplam Gider
              </Typography>
              <Typography
                variant="body1"
                color="error.main"
                sx={{ fontWeight: 600 }}
              >
                {data.totalExpense?.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}{" "}
                ₺
              </Typography>
            </Box>
            <Divider sx={{ my: 1, borderColor: "rgba(255, 255, 255, 0.1)" }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Net Kazanç
              </Typography>
              <Typography
                variant="body1"
                color={isPositive ? "success.main" : "error.main"}
                sx={{ fontWeight: 700 }}
              >
                {netIncome.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}{" "}
                ₺
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Toplam Komisyon
              </Typography>
              <Typography
                variant="body1"
                color="info.main"
                sx={{ fontWeight: 600 }}
              >
                {data.totalCommission?.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}{" "}
                ₺
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                İşlem Sayısı
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {data.transactionCount} İşlem
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Paper>
  );
};

const Reports = () => {
  const [reports, setReports] = useState({
    daily: null,
    weekly: null,
    monthly: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
      }

      const response = await fetch(`${API_URL}/api/admin/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Raporlar getirilemedi");
      }

      const data = await response.json();
      if (data.success) {
        setReports(data.data);
        setError("");
      } else {
        throw new Error(data.message || "Raporlar getirilemedi");
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Raporlar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Prepare chart data
  const chartData = [
    {
      name: "Günlük",
      gelir: reports.daily?.totalIncome || 0,
      gider: reports.daily?.totalExpense || 0,
      komisyon: reports.daily?.totalCommission || 0,
    },
    {
      name: "Haftalık",
      gelir: reports.weekly?.totalIncome || 0,
      gider: reports.weekly?.totalExpense || 0,
      komisyon: reports.weekly?.totalCommission || 0,
    },
    {
      name: "Aylık",
      gelir: reports.monthly?.totalIncome || 0,
      gider: reports.monthly?.totalExpense || 0,
      komisyon: reports.monthly?.totalCommission || 0,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          mb: 4,
          p: 3,
          background: "rgba(30, 41, 59, 0.3)",
          borderRadius: "20px",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Assessment sx={{ fontSize: 40, color: "primary.main" }} />
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "primary.main" }}
            >
              Finansal Raporlar
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Günlük, haftalık ve aylık finansal istatistikler
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <ReportCard
            title="Günlük Rapor"
            icon={<CalendarToday sx={{ color: "primary.main" }} />}
            data={reports.daily || {}}
            loading={loading}
            error={error}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <ReportCard
            title="Haftalık Rapor"
            icon={<DateRange sx={{ color: "primary.main" }} />}
            data={reports.weekly || {}}
            loading={loading}
            error={error}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <ReportCard
            title="Aylık Rapor"
            icon={<EventNote sx={{ color: "primary.main" }} />}
            data={reports.monthly || {}}
            loading={loading}
            error={error}
          />
        </Grid>

        {/* Charts Section */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mt: 3,
              background: "rgba(30, 41, 59, 0.5)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "20px",
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Finansal Trend Analizi
            </Typography>
            <Box sx={{ width: "100%", height: 400 }}>
              <ResponsiveContainer>
                <AreaChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(30, 41, 59, 0.9)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                    }}
                    formatter={(value) =>
                      `${value.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                      })} ₺`
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="gelir"
                    name="Gelir"
                    stackId="1"
                    stroke="#4ade80"
                    fill="#4ade80"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="gider"
                    name="Gider"
                    stackId="2"
                    stroke="#f87171"
                    fill="#f87171"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="komisyon"
                    name="Komisyon"
                    stackId="3"
                    stroke="#60a5fa"
                    fill="#60a5fa"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
