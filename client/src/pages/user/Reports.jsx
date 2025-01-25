import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  AccountBalance,
  MonetizationOn,
  LocalShipping,
  AccessTime,
  CheckCircle,
  AdminPanelSettings,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Reports = () => {
  const [financialData, setFinancialData] = useState({
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

  // Helper function for formatting time differences
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

  // Helper function for transaction icons
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="white">
        Raporlar
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

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
                          <ArrowUpward sx={{ fontSize: 12, color: "white" }} />
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
    </Box>
  );
};

export default Reports;
