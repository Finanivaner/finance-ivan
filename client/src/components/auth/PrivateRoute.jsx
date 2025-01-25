import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  // Check if user is logged in
  if (!token) {
    return (
      <Navigate
        to="/"
        state={{ from: location, message: "Lütfen önce giriş yapın." }}
        replace
      />
    );
  }

  // Handle admin routes
  if (location.pathname.startsWith("/admin")) {
    if (userData.role !== "admin") {
      return (
        <Navigate
          to="/"
          state={{ message: "Bu sayfaya erişim yetkiniz yok." }}
          replace
        />
      );
    }
  }

  // Special handling for verification page
  if (location.pathname === "/verification") {
    // Only allow access if user is not verified and status is pending
    if (userData.isVerified || userData.verificationStatus !== "pending") {
      return (
        <Navigate
          to="/"
          state={{ message: "Bu sayfaya erişim yetkiniz yok." }}
          replace
        />
      );
    }
  }

  // Special handling for dashboard
  if (location.pathname === "/dashboard") {
    // Only allow access if user is verified
    if (!userData.isVerified) {
      return (
        <Navigate
          to="/verification"
          state={{ message: "Lütfen önce hesabınızı doğrulayın." }}
          replace
        />
      );
    }
  }

  return children;
};

export default PrivateRoute;
