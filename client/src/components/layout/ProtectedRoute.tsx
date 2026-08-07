import { Box, CircularProgress } from "@mui/material";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

function AuthLoadingScreen() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress color="secondary" />
    </Box>
  );
}

export function ProtectedRoute() {
  const { isAuthenticated, bootstrapping } = useAuth();
  const location = useLocation();

  if (bootstrapping) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, bootstrapping } = useAuth();

  if (bootstrapping) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export function RootRedirect() {
  const { isAuthenticated, bootstrapping } = useAuth();

  if (bootstrapping) {
    return <AuthLoadingScreen />;
  }

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}
