import { Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const ALLOWED_ROLES = ["user", "staff", "admin"];

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || loading) return;
    const role = String(user.role || "").toLowerCase();
    const normalized = role === "client" ? "user" : role;
    if (!ALLOWED_ROLES.includes(normalized)) {
      console.warn("ProtectedRoute: invalid role, logging out", user);
      logout();
      window.alert("Session invalid. Please log in again.");
      navigate("/login", { replace: true });
    }
  }, [user, loading, logout, navigate]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const role = String(user.role || "").toLowerCase();
  const normalized = role === "client" ? "user" : role;
  if (!ALLOWED_ROLES.includes(normalized)) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(normalized)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;

