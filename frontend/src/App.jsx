import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PageLoader from "./components/common/PageLoader";

// Public Pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));

// Customer Pages
const CustomerDashboard = lazy(() => import("./pages/customer/CustomerDashboard"));
const PoliciesPage = lazy(() => import("./pages/customer/PoliciesPage"));
const PolicyDetailsPage = lazy(() => import("./pages/customer/PolicyDetailsPage"));
const ClaimsPage = lazy(() => import("./pages/customer/ClaimsPage"));
const SubmitClaimPage = lazy(() => import("./pages/customer/SubmitClaimPage"));
const ClaimDetailsPage = lazy(() => import("./pages/customer/ClaimDetailsPage"));
const DocumentsPage = lazy(() => import("./pages/customer/DocumentsPage"));
const NotificationsPage = lazy(() => import("./pages/customer/NotificationsPage"));
const ProfilePage = lazy(() => import("./pages/customer/ProfilePage"));

// Officer Pages
const OfficerDashboard = lazy(() => import("./pages/officer/OfficerDashboard"));
const OfficerClaimsPage = lazy(() => import("./pages/officer/OfficerClaimsPage"));
const OfficerClaimDetailsPage = lazy(() => import("./pages/officer/OfficerClaimDetailsPage"));
const OfficerDocumentsPage = lazy(() => import("./pages/officer/OfficerDocumentsPage"));
const OfficerSurveysPage = lazy(() => import("./pages/officer/OfficerSurveysPage"));
const OfficerSettlementsPage = lazy(() => import("./pages/officer/OfficerSettlementsPage"));

// Surveyor Pages
const SurveyorDashboard = lazy(() => import("./pages/surveyor/SurveyorDashboard"));
const SurveyorClaimsPage = lazy(() => import("./pages/surveyor/SurveyorClaimsPage"));
const SurveyorClaimDetailsPage = lazy(() => import("./pages/surveyor/SurveyorClaimDetailsPage"));
const SurveyorSurveysPage = lazy(() => import("./pages/surveyor/SurveyorSurveysPage"));

// Manager Pages
const ManagerDashboard = lazy(() => import("./pages/manager/ManagerDashboard"));
const ManagerApprovalsPage = lazy(() => import("./pages/manager/ManagerApprovalsPage"));
const ManagerClaimsPage = lazy(() => import("./pages/manager/ManagerClaimsPage"));
const ManagerClaimReviewPage = lazy(() => import("./pages/manager/ManagerClaimReviewPage"));
const ManagerSurveysPage = lazy(() => import("./pages/manager/ManagerSurveysPage"));
const ManagerSettlementsPage = lazy(() => import("./pages/manager/ManagerSettlementsPage"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminPoliciesPage = lazy(() => import("./pages/admin/AdminPoliciesPage"));
const AdminClaimsPage = lazy(() => import("./pages/admin/AdminClaimsPage"));
const AdminClaimDetailsPage = lazy(() => import("./pages/admin/AdminClaimDetailsPage"));
const AdminDocumentsPage = lazy(() => import("./pages/admin/AdminDocumentsPage"));
const AdminSurveysPage = lazy(() => import("./pages/admin/AdminSurveysPage"));
const AdminApprovalsPage = lazy(() => import("./pages/admin/AdminApprovalsPage"));
const AdminSettlementsPage = lazy(() => import("./pages/admin/AdminSettlementsPage"));
const AdminNotificationsPage = lazy(() => import("./pages/admin/AdminNotificationsPage"));
const AdminProfilePage = lazy(() => import("./pages/admin/AdminProfilePage"));

// Staff Shared Pages
const StaffNotificationsPage = lazy(() => import("./pages/staff/StaffNotificationsPage"));
const StaffProfilePage = lazy(() => import("./pages/staff/StaffProfilePage"));

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader message="Loading InsureFlow module..." />}>
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

        {/* Central Administrator Portal Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/policies"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPoliciesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/claims"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminClaimsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/claims/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminClaimDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/documents"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDocumentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/surveys"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminSurveysPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminApprovalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settlements"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminSettlementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminNotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
