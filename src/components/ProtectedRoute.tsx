import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem("jwt_token");
  const location = useLocation();

  if (!token) {
    // Redirect to login page and keep track of the location they came from
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
