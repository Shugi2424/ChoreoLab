import { Route, Routes } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import {
  ProtectedRoute,
  PublicOnlyRoute,
  RootRedirect,
} from "../components/layout/ProtectedRoute";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { MyRoutinesPage } from "../pages/MyRoutinesPage";
import { ProfilePage } from "../pages/ProfilePage";
import { RoutineBuilderPage } from "../pages/RoutineBuilderPage";
import { SignUpPage } from "../pages/SignUpPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/routines" element={<MyRoutinesPage />} />
          <Route path="/routines/:id" element={<RoutineBuilderPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
}
