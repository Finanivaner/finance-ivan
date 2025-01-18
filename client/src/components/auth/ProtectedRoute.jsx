import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import authService from "../../services/auth.service";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = authService.getCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
