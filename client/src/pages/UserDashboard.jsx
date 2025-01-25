import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";
import {
  AccountBalance,
  MonetizationOn,
  LocalShipping,
  Percent,
  TrendingUp,
  TrendingDown,
  Close as CloseIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Campaign as CampaignIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import PostList from "../components/posts/PostList";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const UserDashboard = () => {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const [financialData, setFinancialData] = useState({
    earnings: 0,
    withdrawals: 0,
    deliveryCount: 0,
    commissionRate: 20,
  });
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [closedAnnouncements, setClosedAnnouncements] = useState(new Set());
  const [announcementError, setAnnouncementError] = useState("");
  const theme = useTheme();

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

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching announcements...");
      const response = await fetch(`${API_URL}/api/announcements/active`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Duyurular getirilemedi");
      }

      const data = await response.json();
      console.log("Announcements response:", data);
      if (data.success) {
        setAnnouncements(data.data);
        setAnnouncementError("");
      }
    } catch (err) {
      console.error("Duyurular yüklenirken hata:", err);
      setAnnouncementError(err.message);
    }
  };

  useEffect(() => {
    fetchFinancialData();
    fetchAnnouncements();
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchFinancialData();
      fetchAnnouncements();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleCloseAnnouncement = (id) => {
    setClosedAnnouncements((prev) => new Set([...prev, id]));
  };

  const getAnnouncementIcon = (type) => {
    switch (type) {
      case "warning":
        return <WarningIcon sx={{ color: "#f59e0b" }} />;
      case "success":
        return <CheckCircleIcon sx={{ color: "#10b981" }} />;
      case "error":
        return <ErrorIcon sx={{ color: "#ef4444" }} />;
      default:
        return <InfoIcon sx={{ color: "#3b82f6" }} />;
    }
  };

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

  // Format the announcement date
  const formatAnnouncementDate = (date) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(date).toLocaleDateString("tr-TR", options);
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
        <Grid container spacing={3} sx={{ mb: 4 }}>
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
                          fontSize: "0.875rem",
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
                      width: 48,
                      height: 48,
                      borderRadius: "12px",
                      bgcolor: card.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Announcements Section */}
        <Box sx={{ mb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: 2,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.1
              )} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CampaignIcon
                sx={{
                  color: theme.palette.primary.main,
                  fontSize: 28,
                  transform: "rotate(-10deg)",
                }}
              />
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Duyurular
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Güncel bildirimleri buradan takip edebilirsiniz
              </Typography>
            </Box>
            <Box
              sx={{
                ml: "auto",
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: theme.palette.primary.main, fontWeight: 500 }}
              >
                {announcements.length} Duyuru
              </Typography>
            </Box>
          </Paper>
          <Grid container spacing={2}>
            {announcements.map(
              (announcement) =>
                !closedAnnouncements.has(announcement._id) && (
                  <Grid item xs={12} key={announcement._id}>
                    <Collapse in={true}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          background: `linear-gradient(135deg, ${alpha(
                            theme.palette.background.paper,
                            0.9
                          )} 0%, ${alpha(
                            theme.palette.background.paper,
                            0.7
                          )} 100%)`,
                          backdropFilter: "blur(10px)",
                          border: `1px solid ${alpha(
                            theme.palette.primary.main,
                            0.1
                          )}`,
                          borderRadius: 3,
                          position: "relative",
                          overflow: "hidden",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "4px",
                            height: "100%",
                            background: theme.palette.primary.main,
                            borderRadius: "4px 0 0 4px",
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
                          <Box sx={{ flex: 1, pr: 3 }}>
                            <Typography
                              variant="body1"
                              sx={{
                                color: theme.palette.text.primary,
                                fontSize: "1rem",
                                lineHeight: 1.6,
                                mb: 2,
                              }}
                            >
                              {announcement.content}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <AccessTimeIcon
                                  sx={{
                                    fontSize: 16,
                                    color: theme.palette.text.secondary,
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {formatAnnouncementDate(
                                    announcement.createdAt
                                  )}
                                </Typography>
                              </Box>
                              <Chip
                                size="small"
                                label="Yeni"
                                color="primary"
                                variant="outlined"
                                sx={{
                                  height: 24,
                                  "& .MuiChip-label": {
                                    px: 1,
                                    fontSize: "0.75rem",
                                  },
                                }}
                              />
                            </Box>
                          </Box>
                          <IconButton
                            onClick={() =>
                              handleCloseAnnouncement(announcement._id)
                            }
                            sx={{
                              color: theme.palette.text.secondary,
                              "&:hover": {
                                color: theme.palette.error.main,
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                              },
                              transition: "all 0.2s ease",
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Paper>
                    </Collapse>
                  </Grid>
                )
            )}
          </Grid>
        </Box>

        {/* Posts Section */}
        <Box sx={{ mb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.background.paper,
                0.9
              )} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
              backdropFilter: "blur(10px)",
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              borderRadius: 3,
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <CampaignIcon
                sx={{
                  fontSize: 32,
                  mr: 2,
                  transform: "rotate(-10deg)",
                  color: theme.palette.primary.main,
                }}
              />
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                  Gönderiler
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Topluluğumuzun paylaşımları
                </Typography>
              </Box>
            </Box>
          </Paper>
          <PostList />
        </Box>
      </Container>
    </Box>
  );
};

export default UserDashboard;
