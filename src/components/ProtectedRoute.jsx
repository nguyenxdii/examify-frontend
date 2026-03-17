import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) return <Navigate to="/login" replace />;
  if (requiredRole) {
    const userRole = String(user.role || "").toUpperCase().replace("ROLE_", "");
    const targetRole = String(requiredRole).toUpperCase().replace("ROLE_", "");
    if (userRole !== targetRole) return <Navigate to="/dashboard" replace />;
  }

  return children;
}
