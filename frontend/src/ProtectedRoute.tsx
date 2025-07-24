import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, role }: { children: ReactNode; role: string }) {
  const location = useLocation();

  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
  const userRole = sessionStorage.getItem("userRole");

  if (!isLoggedIn || userRole !== role) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
