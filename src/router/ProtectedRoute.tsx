import { Navigate, Outlet } from "react-router-dom";
import { useIsLoggedIn } from "@/store/authStore";

export default function ProtectedRoute() {
  const isLoggedIn = useIsLoggedIn();
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}
