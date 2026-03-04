import { type ReactNode, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// 코드 스플리팅 — 각 페이지를 필요할 때만 로드
const MainPage = lazy(() => import("./pages/MainPage.tsx"));
const DailyLogPage = lazy(() => import("./pages/DailyLogPage.tsx"));
const SalaryPage = lazy(() => import("./pages/SalaryPage.tsx"));
const SchedulePage = lazy(() => import("./pages/SchedulePage.tsx"));
const NoticePage = lazy(() => import("./pages/NoticePage.tsx"));
const AdminExportPage = lazy(() => import("./pages/AdminExportPage.tsx"));
const AllowedNamesManagement = lazy(() => import("./pages/AllowedNamesManagement.tsx"));
const SettingsPage = lazy(() => import("./pages/SettingsPage.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const Register = lazy(() => import("./pages/Register.tsx"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
      <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: '40px' }}>progress_activity</span>
    </div>
  );
}

function ProtectedRoute({ children, role }: { children: ReactNode; role: string | string[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  const allowedRoles = Array.isArray(role) ? role : [role];
  if (role && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/daily-log"
              element={
                <ProtectedRoute role="worker">
                  <DailyLogPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/salary"
              element={
                <ProtectedRoute role="worker">
                  <SalaryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/schedule"
              element={
                <ProtectedRoute role={['worker', 'boss', 'admin']}>
                  <SchedulePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notices"
              element={
                <ProtectedRoute role={['worker', 'boss', 'admin']}>
                  <NoticePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute role={['worker', 'manager', 'boss', 'admin']}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/export"
              element={
                <ProtectedRoute role={['boss', 'admin']}>
                  <AdminExportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/allowed-names"
              element={
                <ProtectedRoute role={['boss', 'admin']}>
                  <AllowedNamesManagement />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
