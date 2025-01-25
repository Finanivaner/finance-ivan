import React, { useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Box,
  IconButton,
  Typography,
  Collapse,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  Divider,
  alpha,
} from "@mui/material";
import {
  Dashboard,
  Payment,
  Assessment,
  History,
  Person,
  Logout,
  ChevronRight,
  ExpandMore,
  AccountBalanceWallet,
  CurrencyBitcoin,
  Menu as MenuIcon,
  LocalShipping,
  Share,
} from "@mui/icons-material";
import SharePost from "../components/posts/SharePost";

const DRAWER_WIDTH = 280;

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paymentMethodsOpen, setPaymentMethodsOpen] = useState(false);
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    {
      text: "Dashboard",
      icon: <Dashboard />,
      path: "/dashboard",
    },
    {
      text: "Ödeme ve Teslimat",
      icon: <Payment />,
      submenu: [
        {
          text: "IBAN İle",
          icon: <AccountBalanceWallet />,
          path: "/dashboard/payment/iban",
        },
        {
          text: "Tether TRX Adresi İle",
          icon: <CurrencyBitcoin />,
          path: "/dashboard/payment/crypto",
        },
        {
          text: "Teslimatlarım",
          icon: <LocalShipping />,
          path: "/dashboard/delivery",
        },
      ],
    },
    {
      text: "Raporlar",
      icon: <Assessment />,
      path: "/dashboard/reports",
    },
    {
      text: "Profil",
      icon: <Person />,
      path: "/dashboard/profile",
    },
  ];

  const drawer = (
    <Box
      sx={{
        height: "100%",
        bgcolor: "#0f172a",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: "white" }}>
          Finans
          <Box
            component="span"
            sx={{
              background: "linear-gradient(45deg, #3b82f6 30%, #60a5fa 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              ml: 0.5,
            }}
          >
            Platform
          </Box>
        </Typography>
      </Box>

      {/* User Section */}
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "12px",
            bgcolor: "rgba(59, 130, 246, 0.1)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Person
            sx={{
              fontSize: 20,
              color: "#60a5fa",
            }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "white",
              lineHeight: 1.2,
            }}
          >
            {userData.username}
          </Typography>
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "rgba(255, 255, 255, 0.5)",
              mt: 0.5,
            }}
          >
            Doğrulanmış Kullanıcı
          </Typography>
        </Box>
      </Box>

      {/* Share Post Section */}
      <Box sx={{ p: 2 }}>
        <SharePost />
      </Box>

      {/* Navigation Menu */}
      <List sx={{ px: 2, py: 2, flex: 1 }}>
        {menuItems.map((item) => (
          <Box key={item.text} sx={{ mb: 0.5 }}>
            {item.submenu ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => setPaymentMethodsOpen(!paymentMethodsOpen)}
                    sx={{
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.05)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{ color: "rgba(255, 255, 255, 0.7)", minWidth: 40 }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        color: "white",
                        fontWeight: paymentMethodsOpen ? 600 : 500,
                      }}
                    />
                    {paymentMethodsOpen ? <ExpandMore /> : <ChevronRight />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={paymentMethodsOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.submenu.map((subItem) => (
                      <ListItem key={subItem.text} disablePadding>
                        <ListItemButton
                          component={Link}
                          to={subItem.path}
                          selected={isActive(subItem.path)}
                          sx={{
                            pl: 5,
                            borderRadius: 2,
                            "&.Mui-selected": {
                              bgcolor: "rgba(59, 130, 246, 0.1)",
                              "&:hover": {
                                bgcolor: "rgba(59, 130, 246, 0.15)",
                              },
                            },
                            "&:hover": {
                              bgcolor: "rgba(255, 255, 255, 0.05)",
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              color: "rgba(255, 255, 255, 0.7)",
                              minWidth: 40,
                            }}
                          >
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={subItem.text}
                            primaryTypographyProps={{
                              color: "white",
                              fontSize: "0.875rem",
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={isActive(item.path)}
                  sx={{
                    borderRadius: 2,
                    "&.Mui-selected": {
                      bgcolor: "rgba(59, 130, 246, 0.1)",
                      "&:hover": {
                        bgcolor: "rgba(59, 130, 246, 0.15)",
                      },
                    },
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{ color: "rgba(255, 255, 255, 0.7)", minWidth: 40 }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      color: "white",
                      fontWeight: isActive(item.path) ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )}
          </Box>
        ))}
      </List>

      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2, borderColor: "rgba(255, 255, 255, 0.1)" }} />
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            "&:hover": {
              bgcolor: "rgba(239, 68, 68, 0.1)",
            },
          }}
        >
          <ListItemIcon sx={{ color: "#ef4444", minWidth: 40 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText
            primary="Çıkış Yap"
            primaryTypographyProps={{
              color: "#ef4444",
              fontWeight: 500,
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Mobile Menu Button */}
      {isMobile && (
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            position: "fixed",
            left: 16,
            top: 16,
            zIndex: 1200,
            bgcolor: "background.paper",
            "&:hover": { bgcolor: "background.paper" },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { md: DRAWER_WIDTH },
          flexShrink: { md: 0 },
        }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH,
                borderRight: "1px solid",
                borderColor: "divider",
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH,
                borderRight: "1px solid",
                borderColor: "divider",
                boxShadow: 1,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          pt: { xs: 8, md: 3 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default UserLayout;
