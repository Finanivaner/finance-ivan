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
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Dashboard,
  Settings,
  Assessment,
  People,
  AdminPanelSettings,
  AccountBalance,
  Description,
  Logout,
  ChevronRight,
  LocalShipping,
} from "@mui/icons-material";

const menuItems = [
  { text: "Admin Dashboard", icon: <Dashboard />, path: "/admin/dashboard" },
  { text: "Sistem Ayarları", icon: <Settings />, path: "/admin/settings" },
  { text: "Log Kayıtları", icon: <Description />, path: "/admin/logs" },
  { text: "Raporlar", icon: <Assessment />, path: "/admin/reports" },
  {
    text: "Admin Yönetimi",
    icon: <AdminPanelSettings />,
    path: "/admin/admins",
  },
  { text: "Kullanıcı Yönetimi", icon: <People />, path: "/admin/users" },
  { text: "Muhasebe", icon: <AccountBalance />, path: "/admin/accounting" },
  {
    text: "Teslimatlar",
    icon: <LocalShipping />,
    path: "/admin/deliveries",
  },
];

const Sidebar = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  return (
    <Box
      sx={{
        width: 280,
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        bgcolor: theme.palette.background.paper,
        borderRight: "1px solid",
        borderColor: alpha(theme.palette.primary.main, 0.08),
        display: "flex",
        flexDirection: "column",
        boxShadow: `4px 0 8px ${alpha(theme.palette.primary.main, 0.02)}`,
        zIndex: theme.zIndex.drawer,
      }}
    >
      {/* Enhanced Logo and Title */}
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.05
          )} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
        }}
      >
        <Typography
          variant="h5"
          component={Link}
          to="/admin/dashboard"
          sx={{
            color: theme.palette.text.primary,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            fontWeight: 800,
            letterSpacing: "-0.5px",
            transition: "all 0.3s ease",
            "&:hover": {
              color: theme.palette.primary.main,
              "& .icon": {
                transform: "rotate(360deg)",
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          <AdminPanelSettings
            className="icon"
            sx={{
              fontSize: 32,
              transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              color: alpha(theme.palette.primary.main, 0.8),
            }}
          />
          <Box component="span" sx={{ fontSize: "1.2rem" }}>
            Admin Paneli
          </Box>
        </Typography>
      </Box>

      <Divider sx={{ borderColor: alpha(theme.palette.primary.main, 0.08) }} />

      {/* Enhanced Main Menu */}
      <List sx={{ flexGrow: 1, px: 2, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              key={item.path}
              component={Link}
              to={item.path}
              sx={{
                borderRadius: 3,
                mb: 0.5,
                color: isActive
                  ? theme.palette.primary.main
                  : alpha(theme.palette.text.primary, 0.8),
                bgcolor: isActive
                  ? alpha(theme.palette.primary.main, 0.08)
                  : "transparent",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: isActive
                    ? alpha(theme.palette.primary.main, 0.12)
                    : alpha(theme.palette.primary.main, 0.04),
                  color: theme.palette.primary.main,
                  "& .MuiListItemIcon-root": {
                    color: theme.palette.primary.main,
                  },
                  "& .arrow": {
                    opacity: 1,
                    transform: "translateX(0)",
                  },
                },
                position: "relative",
                pl: 2,
                pr: 1,
                py: 1,
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive
                    ? theme.palette.primary.main
                    : alpha(theme.palette.text.primary, 0.6),
                  minWidth: 40,
                  transition: "color 0.3s ease",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: "0.9rem",
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: "0.02em",
                }}
              />
              <ChevronRight
                className="arrow"
                sx={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? "translateX(0)" : "translateX(-8px)",
                  transition: "all 0.3s ease",
                  color: theme.palette.primary.main,
                  fontSize: 20,
                }}
              />
            </ListItem>
          );
        })}
      </List>

      {/* Enhanced Bottom Section - Profile and Logout */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.08),
          background: `linear-gradient(0deg, ${alpha(
            theme.palette.primary.main,
            0.03
          )} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
        }}
      >
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 600,
            }}
          >
            A
          </Avatar>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: theme.palette.text.primary }}
            >
              Admin User
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: alpha(theme.palette.text.primary, 0.6) }}
            >
              System Administrator
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Oturumu Sonlandır">
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{
              borderRadius: 3,
              py: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              boxShadow: "none",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                bgcolor: theme.palette.primary.main,
                color: "#fff",
                "& .MuiSvgIcon-root": {
                  transform: "translateX(2px)",
                },
              },
              "& .MuiSvgIcon-root": {
                transition: "transform 0.3s ease",
              },
            }}
          >
            Çıkış Yap
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default Sidebar;
