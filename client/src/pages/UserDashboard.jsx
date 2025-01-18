import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  AccountBalance,
  MonetizationOn,
  LocalShipping,
  Percent,
  TrendingUp,
  TrendingDown,
  AccessTime,
  CheckCircle,
  AdminPanelSettings,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const UserDashboard = () => {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const [financialData, setFinancialData] = useState({
    earnings: 0,
    withdrawals: 0,
    deliveryCount: 0,
    commissionRate: 20,
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFinancialData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/users/financial-summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Finansal veriler getirilemedi");
      }

      const data = await response.json();
      if (data.success) {
        setFinancialData(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchFinancialData, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      title: "Kazanç",
      value: `₺${financialData.earnings.toFixed(2)}`,
      trend: "+0%",
      trendDirection: "up",
      icon: <MonetizationOn sx={{ fontSize: 32, color: "#3b82f6" }} />,
      bgGradient:
        "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%)",
      borderColor: "rgba(59, 130, 246, 0.2)",
      iconBg: "rgba(59, 130, 246, 0.1)",
    },
    {
      title: "Çekim",
      value: `₺${financialData.withdrawals.toFixed(2)}`,
      trend: "+0%",
      trendDirection: "up",
      icon: <AccountBalance sx={{ fontSize: 32, color: "#10b981" }} />,
      bgGradient:
        "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%)",
      borderColor: "rgba(16, 185, 129, 0.2)",
      iconBg: "rgba(16, 185, 129, 0.1)",
    },
    {
      title: "Teslimat",
      value: financialData.deliveryCount.toString(),
      trend: "0",
      trendDirection: "neutral",
      icon: <LocalShipping sx={{ fontSize: 32, color: "#8b5cf6" }} />,
      bgGradient:
        "linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)",
      borderColor: "rgba(139, 92, 246, 0.2)",
      iconBg: "rgba(139, 92, 246, 0.1)",
    },
    {
      title: "Komisyon Oranı",
      value: `%${financialData.commissionRate}`,
      trend: "Sabit",
      trendDirection: "neutral",
      icon: <Percent sx={{ fontSize: 32, color: "#f59e0b" }} />,
      bgGradient:
        "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.08) 100%)",
      borderColor: "rgba(245, 158, 11, 0.2)",
      iconBg: "rgba(245, 158, 11, 0.1)",
    },
  ];

  // Add this helper function for formatting time differences
  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} gün önce`;
    if (hours > 0) return `${hours} saat önce`;
    if (minutes > 0) return `${minutes} dakika önce`;
    return "Az önce";
  };

  // Add this helper function for transaction icons
  const getTransactionIcon = (transaction) => {
    if (transaction.adminAction) {
      return <AdminPanelSettings sx={{ fontSize: 20, color: "#8b5cf6" }} />;
    }

    switch (transaction.type) {
      case "delivery":
        return <LocalShipping sx={{ fontSize: 20, color: "#8b5cf6" }} />;
      case "withdrawal":
        return <AccountBalance sx={{ fontSize: 20, color: "#10b981" }} />;
      default:
        return <MonetizationOn sx={{ fontSize: 20, color: "#3b82f6" }} />;
    }
  };

  if (loading) {
    return (
      <Box className="min-h-screen bg-[#0f172a] py-12 flex items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-[#0f172a] py-12">
      <Container maxWidth="lg">
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Welcome Section */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            sx={{
              color: "white",
              fontWeight: 700,
              mb: 1,
              letterSpacing: "-0.5px",
            }}
          >
            Hoş Geldiniz, {userData.username}
          </Typography>
          <Typography
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "1rem",
            }}
          >
            Finansal durumunuza genel bir bakış
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  position: "relative",
                  p: 3,
                  height: "100%",
                  background: card.bgGradient,
                  border: `1px solid ${card.borderColor}`,
                  borderRadius: "20px",
                  backdropFilter: "blur(20px)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 8px 24px -4px ${card.borderColor}`,
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        color: "rgba(255, 255, 255, 0.7)",
                        mb: 1,
                        letterSpacing: "0.1px",
                      }}
                    >
                      {card.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "1.75rem",
                        fontWeight: 700,
                        color: "white",
                        letterSpacing: "-0.5px",
                        mb: 1,
                      }}
                    >
                      {card.value}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      {card.trendDirection === "up" ? (
                        <TrendingUp sx={{ fontSize: 16, color: "#10b981" }} />
                      ) : card.trendDirection === "down" ? (
                        <TrendingDown sx={{ fontSize: 16, color: "#ef4444" }} />
                      ) : null}
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color:
                            card.trendDirection === "up"
                              ? "#10b981"
                              : card.trendDirection === "down"
                              ? "#ef4444"
                              : "rgba(255, 255, 255, 0.5)",
                        }}
                      >
                        {card.trend}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "16px",
                      bgcolor: card.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 4px 12px -2px ${card.borderColor}`,
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Recent Activity Section */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            background: "rgba(30, 41, 59, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "20px",
            backdropFilter: "blur(20px)",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "white",
              fontWeight: 600,
              mb: 3,
            }}
          >
            Son İşlemler
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {financialData.recentTransactions.map((transaction, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <Divider
                    sx={{
                      borderColor: "rgba(255, 255, 255, 0.1)",
                    }}
                  />
                )}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "12px",
                        bgcolor: transaction.adminAction
                          ? "rgba(139, 92, 246, 0.1)"
                          : "rgba(59, 130, 246, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      {getTransactionIcon(transaction)}
                      {transaction.adminAction && (
                        <Box
                          sx={{
                            position: "absolute",
                            right: -2,
                            bottom: -2,
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            bgcolor: "#8b5cf6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {transaction.newValue > transaction.previousValue ? (
                            <ArrowUpward
                              sx={{ fontSize: 12, color: "white" }}
                            />
                          ) : (
                            <ArrowDownward
                              sx={{ fontSize: 12, color: "white" }}
                            />
                          )}
                        </Box>
                      )}
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          color: "white",
                          fontWeight: 500,
                          fontSize: "0.875rem",
                        }}
                      >
                        {transaction.adminAction ? (
                          <Box
                            component="span"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            Admin Güncellemesi
                            <Box
                              component="span"
                              sx={{
                                fontSize: "0.75rem",
                                px: 1,
                                py: 0.5,
                                borderRadius: "4px",
                                bgcolor: "rgba(139, 92, 246, 0.1)",
                                color: "#8b5cf6",
                              }}
                            >
                              {transaction.type === "earning"
                                ? "Kazanç"
                                : transaction.type === "withdrawal"
                                ? "Çekim"
                                : "Teslimat"}
                            </Box>
                          </Box>
                        ) : transaction.type === "earning" ? (
                          "Kazanç"
                        ) : transaction.type === "withdrawal" ? (
                          "Çekim"
                        ) : (
                          "Teslimat"
                        )}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <AccessTime
                          sx={{
                            fontSize: 14,
                            color: "rgba(255, 255, 255, 0.5)",
                          }}
                        />
                        <Typography
                          sx={{
                            color: "rgba(255, 255, 255, 0.5)",
                            fontSize: "0.75rem",
                          }}
                        >
                          {getTimeAgo(transaction.date)}
                        </Typography>
                        {transaction.adminAction && (
                          <Typography
                            sx={{
                              color: "rgba(255, 255, 255, 0.5)",
                              fontSize: "0.75rem",
                            }}
                          >
                            • {transaction.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    {transaction.type !== "delivery" && (
                      <Typography
                        sx={{
                          color: "white",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          justifyContent: "flex-end",
                        }}
                      >
                        {transaction.adminAction && (
                          <Typography
                            component="span"
                            sx={{
                              fontSize: "0.75rem",
                              color: "rgba(255, 255, 255, 0.5)",
                            }}
                          >
                            {transaction.previousValue.toFixed(2)} →
                          </Typography>
                        )}
                        ₺
                        {transaction.newValue?.toFixed(2) ||
                          transaction.amount.toFixed(2)}
                      </Typography>
                    )}
                    {transaction.type === "delivery" &&
                      transaction.adminAction && (
                        <Typography
                          sx={{
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                          }}
                        >
                          {transaction.previousValue} → {transaction.newValue}
                        </Typography>
                      )}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        justifyContent: "flex-end",
                      }}
                    >
                      <CheckCircle
                        sx={{
                          fontSize: 14,
                          color: transaction.adminAction
                            ? "#8b5cf6"
                            : transaction.status === "completed"
                            ? "#10b981"
                            : transaction.status === "pending"
                            ? "#f59e0b"
                            : "#ef4444",
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: transaction.adminAction
                            ? "#8b5cf6"
                            : transaction.status === "completed"
                            ? "#10b981"
                            : transaction.status === "pending"
                            ? "#f59e0b"
                            : "#ef4444",
                        }}
                      >
                        {transaction.adminAction
                          ? "Admin"
                          : transaction.status === "completed"
                          ? "Tamamlandı"
                          : transaction.status === "pending"
                          ? "İşleniyor"
                          : "Başarısız"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </React.Fragment>
            ))}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default UserDashboard;
