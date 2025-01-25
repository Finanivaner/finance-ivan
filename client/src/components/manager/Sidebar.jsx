import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Divider,
  useTheme,
  Avatar,
  Paper,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Dashboard,
  People,
  AccountBalance,
  LocalShipping,
  Campaign,
  Forum,
  Logout,
  SupervisorAccount,
} from "@mui/icons-material";

const ManagerSidebar = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const manager = JSON.parse(localStorage.getItem("manager"));

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/manager/dashboard" },
  ];

  // Add menu items based on permissions
  if (manager?.permissions?.users?.read) {
    menuItems.push({
      text: "Kullanıcılar",
      icon: <People />,
      path: "/manager/users",
    });
  }
  if (manager?.permissions?.deliveries?.read) {
    menuItems.push({
      text: "Teslimatlar",
      icon: <LocalShipping />,
      path: "/manager/deliveries",
    });
  }
  if (manager?.permissions?.accounting?.read) {
    menuItems.push({
      text: "Muhasebe",
      icon: <AccountBalance />,
      path: "/manager/accounting",
    });
  }
  if (manager?.permissions?.announcements?.read) {
    menuItems.push({
      text: "Duyurular",
      icon: <Campaign />,
      path: "/manager/announcements",
    });
  }
  if (manager?.permissions?.posts?.read) {
    menuItems.push({
      text: "Gönderiler",
      icon: <Forum />,
      path: "/manager/posts",
    });
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("manager");
    navigate("/manager/login");
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: 280,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: "blur(12px)",
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        display: "flex",
        flexDirection: "column",
        zIndex: 1200,
      }}
    >
      {/* Header with Logo */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          }}
        >
          <SupervisorAccount />
        </Avatar>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Yönetici Paneli
        </Typography>
      </Box>

      <Divider sx={{ opacity: 0.1 }} />

      {/* User Profile Section */}
      <Box sx={{ p: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            background: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                fontSize: "1.2rem",
                fontWeight: 600,
              }}
            >
              {manager?.fullName?.charAt(0)}
            </Avatar>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                {manager?.fullName}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: alpha(theme.palette.text.secondary, 0.8),
                  fontSize: "0.875rem",
                }}
              >
                {manager?.username}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, px: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              key={item.path}
              component={Link}
              to={item.path}
              sx={{
                borderRadius: 2,
                mb: 1,
                color: isActive
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
                bgcolor: isActive
                  ? alpha(theme.palette.primary.main, 0.1)
                  : "transparent",
                "&:hover": {
                  bgcolor: isActive
                    ? alpha(theme.palette.primary.main, 0.15)
                    : alpha(theme.palette.primary.main, 0.05),
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActive
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: "0.9375rem",
                  fontWeight: isActive ? 600 : 500,
                }}
              />
              {isActive && (
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    bgcolor: theme.palette.primary.main,
                    ml: 1,
                  }}
                />
              )}
            </ListItem>
          );
        })}
      </List>

      {/* Logout Section */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          color="error"
          onClick={handleLogout}
          sx={{
            py: 1,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
            "&:hover": {
              background: `linear-gradient(135deg, ${theme.palette.error.dark} 0%, ${theme.palette.error.main} 100%)`,
            },
            textTransform: "none",
            fontSize: "0.9375rem",
            fontWeight: 600,
          }}
          startIcon={<Logout />}
        >
          Çıkış Yap
        </Button>
      </Box>
    </Paper>
  );
};

export default ManagerSidebar;
