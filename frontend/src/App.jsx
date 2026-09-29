import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Customer Pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import PoliciesPage from "./pages/customer/PoliciesPage";
import PolicyDetailsPage from "./pages/customer/PolicyDetailsPage";
import ClaimsPage from "./pages/customer/ClaimsPage";
import SubmitClaimPage from "./pages/customer/SubmitClaimPage";
import ClaimDetailsPage from "./pages/customer/ClaimDetailsPage";
import DocumentsPage from "./pages/customer/DocumentsPage";
import NotificationsPage from "./pages/customer/NotificationsPage";
import ProfilePage from "./pages/customer/ProfilePage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer Portal Protected Routes */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/policies"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <PoliciesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/policies/:id"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <PolicyDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/claims"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <ClaimsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/claims/new"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <SubmitClaimPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/claims/:id"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <ClaimDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/documents"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <DocumentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/notifications"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
