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

// Officer Pages
import OfficerDashboard from "./pages/officer/OfficerDashboard";
import OfficerClaimsPage from "./pages/officer/OfficerClaimsPage";
import OfficerClaimDetailsPage from "./pages/officer/OfficerClaimDetailsPage";
import OfficerDocumentsPage from "./pages/officer/OfficerDocumentsPage";
import OfficerSurveysPage from "./pages/officer/OfficerSurveysPage";
import OfficerSettlementsPage from "./pages/officer/OfficerSettlementsPage";

// Surveyor Pages
import SurveyorDashboard from "./pages/surveyor/SurveyorDashboard";
import SurveyorClaimsPage from "./pages/surveyor/SurveyorClaimsPage";
import SurveyorClaimDetailsPage from "./pages/surveyor/SurveyorClaimDetailsPage";
import SurveyorSurveysPage from "./pages/surveyor/SurveyorSurveysPage";

// Manager Pages
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerApprovalsPage from "./pages/manager/ManagerApprovalsPage";
import ManagerClaimsPage from "./pages/manager/ManagerClaimsPage";
import ManagerClaimReviewPage from "./pages/manager/ManagerClaimReviewPage";
import ManagerSurveysPage from "./pages/manager/ManagerSurveysPage";
import ManagerSettlementsPage from "./pages/manager/ManagerSettlementsPage";

// Staff Shared Pages
import StaffNotificationsPage from "./pages/staff/StaffNotificationsPage";
import StaffProfilePage from "./pages/staff/StaffProfilePage";

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

        {/* Insurance Officer Portal Protected Routes */}
        <Route
          path="/officer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["officer"]}>
              <OfficerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/claims"
          element={
            <ProtectedRoute allowedRoles={["officer"]}>
              <OfficerClaimsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/claims/:id"
          element={
            <ProtectedRoute allowedRoles={["officer"]}>
              <OfficerClaimDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/documents"
          element={
            <ProtectedRoute allowedRoles={["officer"]}>
              <OfficerDocumentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/surveys"
          element={
            <ProtectedRoute allowedRoles={["officer"]}>
              <OfficerSurveysPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/settlements"
          element={
            <ProtectedRoute allowedRoles={["officer"]}>
              <OfficerSettlementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/notifications"
          element={
            <ProtectedRoute allowedRoles={["officer"]}>
              <StaffNotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer/profile"
          element={
            <ProtectedRoute allowedRoles={["officer"]}>
              <StaffProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Surveyor Portal Protected Routes */}
        <Route
          path="/surveyor/dashboard"
          element={
            <ProtectedRoute allowedRoles={["surveyor"]}>
              <SurveyorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/surveyor/claims"
          element={
            <ProtectedRoute allowedRoles={["surveyor"]}>
              <SurveyorClaimsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/surveyor/claims/:id"
          element={
            <ProtectedRoute allowedRoles={["surveyor"]}>
              <SurveyorClaimDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/surveyor/surveys"
          element={
            <ProtectedRoute allowedRoles={["surveyor"]}>
              <SurveyorSurveysPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/surveyor/notifications"
          element={
            <ProtectedRoute allowedRoles={["surveyor"]}>
              <StaffNotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/surveyor/profile"
          element={
            <ProtectedRoute allowedRoles={["surveyor"]}>
              <StaffProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Manager Portal Protected Routes */}
        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/approvals"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <ManagerApprovalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/claims"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <ManagerClaimsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/claims/:id"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <ManagerClaimReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/surveys"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <ManagerSurveysPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/settlements"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <ManagerSettlementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/notifications"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <StaffNotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/profile"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <StaffProfilePage />
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
