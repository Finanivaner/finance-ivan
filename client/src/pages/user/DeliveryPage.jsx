import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  useTheme,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PendingActions,
} from "@mui/icons-material";
import DeliverySection from "../../components/DeliverySection";

const StatCard = ({ icon, title, value, color, bgColor }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        background: bgColor,
        borderRadius: 4,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
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
        {value}
      </Typography>
    </Paper>
  );
};

const DeliveryPage = () => {
  const theme = useTheme();
  const [counts, setCounts] = useState({
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  const handleUpdateCounts = (newCounts) => {
    setCounts(newCounts);
  };

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box mb={4}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: "linear-gradient(45deg, #3b82f6, #60a5fa)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0px 2px 5px rgba(0,0,0,0.2)",
            }}
          >
            Teslimat Merkezi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Teslimat fişlerinizi yönetin ve durumlarını anlık olarak takip edin
          </Typography>
        </Box>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              icon={
                <CheckCircleIcon
                  sx={{ fontSize: 32, color: theme.palette.success.main }}
                />
              }
              title="Onaylanan Teslimatlar"
              value={counts.approved}
              color={theme.palette.success.main}
              bgColor={theme.palette.success.main + "0a"}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              icon={
                <PendingActions
                  sx={{ fontSize: 32, color: theme.palette.warning.main }}
                />
              }
              title="Bekleyen Teslimatlar"
              value={counts.pending}
              color={theme.palette.warning.main}
              bgColor={theme.palette.warning.main + "0a"}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              icon={
                <CancelIcon
                  sx={{ fontSize: 32, color: theme.palette.error.main }}
                />
              }
              title="Reddedilen Teslimatlar"
              value={counts.rejected}
              color={theme.palette.error.main}
              bgColor={theme.palette.error.main + "0a"}
            />
          </Grid>
        </Grid>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            background:
              "linear-gradient(145deg, rgba(30,41,59,0.9), rgba(30,41,59,0.7))",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Box p={3}>
            <DeliverySection onUpdateCounts={handleUpdateCounts} />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default DeliveryPage;
