import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LandingPage from "./pages/LandingPage";
import AdminLogin from "./pages/AdminLogin";
import ManagerLogin from "./pages/ManagerLogin";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSettings from "./pages/admin/Settings";
import AdminLogs from "./pages/admin/Logs";
import AdminReports from "./pages/admin/Reports";
import AdminManagement from "./pages/admin/AdminManagement";
import UserManagement from "./pages/admin/UserManagement";
import Accounting from "./pages/admin/Accounting";
import DeliveryManagement from "./pages/admin/DeliveryManagement";
import PrivateRoute from "./components/auth/PrivateRoute";
import Register from "./pages/Register";
import Verification from "./pages/Verification";
import UserDashboard from "./pages/UserDashboard";
import CryptoPayment from "./pages/payment/CryptoPayment";
import IbanPayment from "./pages/payment/IbanPayment";
import DeliveryPage from "./pages/user/DeliveryPage";
import DeliveryRequest from "./pages/user/DeliveryRequest";
import Profile from "./pages/user/Profile";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#3b82f6",
      light: "#60a5fa",
      dark: "#2563eb",
    },
    secondary: {
      main: "#8b5cf6",
      light: "#a78bfa",
      dark: "#7c3aed",
    },
    background: {
      default: "#0f172a",
      paper: "#1e293b",
    },
    success: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
    },
    info: {
      main: "#3b82f6",
      light: "#60a5fa",
      dark: "#2563eb",
    },
    text: {
      primary: "#f1f5f9",
      secondary: "#94a3b8",
    },
    divider: "rgba(148, 163, 184, 0.1)",
  },
  typography: {
    fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          textDecoration: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "rgba(148, 163, 184, 0.1)",
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/manager/login" element={<ManagerLogin />} />
          <Route
            path="/verification"
            element={
              <PrivateRoute>
                <Verification />
              </PrivateRoute>
            }
          />

          {/* User Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <UserLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<UserDashboard />} />
            <Route path="payment/iban" element={<IbanPayment />} />
            <Route path="payment/crypto" element={<CryptoPayment />} />
            <Route path="delivery" element={<DeliveryPage />} />
            <Route path="delivery/request" element={<DeliveryRequest />} />
            <Route path="reports" element={<div>Reports</div>} />
            <Route path="transactions" element={<div>Transactions</div>} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="logs" element={<AdminLogs />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="admins" element={<AdminManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="accounting" element={<Accounting />} />
            <Route path="deliveries" element={<DeliveryManagement />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
