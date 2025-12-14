import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { role } = useAuth();

  if (!role && allowedRoles.length > 0) {
    // not logged in
    return <Navigate to="/L" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // logged in but not allowed
    return <Navigate to="/" replace />;
  }

  return children;
}
