import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRoute() {
  // Auth enforcement lands in Milestone 1.
  return <Outlet />;
}

export function PublicOnlyRoute() {
  return <Outlet />;
}

export function RootRedirect() {
  return <Navigate to="/dashboard" replace />;
}
