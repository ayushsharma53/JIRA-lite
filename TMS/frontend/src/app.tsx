import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "./features/auth/auth-page";
import { DashboardPage } from "./features/dashboard/dashboard-page";
import { LandingPage } from "./features/dashboard/landing-page";
import { AuthProvider, RequireAuth } from "./features/auth/auth-context";
import { useUiStore } from "./store/ui-store";

export default function App() {
  const darkMode = useUiStore(state => state.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/demo" element={<DashboardPage isDemo={true} />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
