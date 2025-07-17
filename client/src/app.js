import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import DailyLogs from './pages/DailyLogs';
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';
import TranscriptPreview from './pages/TranscriptPreview';
import HomeschoolMapPage from './pages/HomeschoolMapPage';
import ActivitiesPage from './pages/ActivitiesPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import UpgradePremiumPage from './pages/UpgradePremiumPage';
import StateRequirementsPage from './pages/StateRequirementsPage';
import ContactChatPage from './pages/ContactChatPage';
import AdminDashboardLayout from './components/admin/AdminDashboardLayout';
import UsersPage from './pages/admin/UsersPage';
import AdminAllChatsPage from './pages/admin/AdminAllChatsPage';
import AdminChatPage from './pages/admin/AdminChatPage';
import AdminSubscriptionsPage from './pages/admin/AdminSubscriptionsPage';
import AdminStatesPage from './pages/admin/AdminStatesPage';
import AdminEditStatePage from "./pages/admin/AdminEditStatePage";
import AdminResourceManagerPage from './pages/admin/AdminResourceManagerPage';
import RoleBasedNotFound from "./pages/RoleBasedNotFound";
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected User/Admin Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Students />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <DailyLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/transcript/:id"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <TranscriptPreview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/map"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <HomeschoolMapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activities"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ActivitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upgrade"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UpgradePremiumPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ContactChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requirements"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <StateRequirementsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard and Nested Routes - Protected! */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="users" element={<UsersPage />} />
          <Route path="states/:id/edit" element={<AdminEditStatePage />} />
          <Route path="resources" element={<AdminResourceManagerPage />} />
          <Route path="states" element={<AdminStatesPage />} />
          <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
          <Route path="support" element={<AdminAllChatsPage />} />
          <Route path="support/:username" element={<AdminChatPage />} />
        </Route>

        {/* Role-based not found page */}
        <Route path="*" element={<RoleBasedNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
