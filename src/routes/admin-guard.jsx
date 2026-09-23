import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "~/providers/auth-provider";

export default function AdminGuard({ children }) {
  const { user, isAuthenticated } = useAuth();

  const role = user?.role || (Array.isArray(user?.roles) ? user?.roles[0] : null);
  const isAdmin =
    isAuthenticated &&
    Boolean(role) &&
    (String(role).toUpperCase() === "ADMIN" || String(role).toUpperCase() === "ROLE_ADMIN");

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}
