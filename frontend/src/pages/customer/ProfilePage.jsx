import React from "react";
import { Link } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";

export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/customer/dashboard" className="hover:text-primary-600 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Customer Profile</span>
        </div>

        {/* Profile Card Header */}
        <Card className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar Circle */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 flex-shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "CU"}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">{user?.name || "Customer Account"}</h1>
                <Badge variant="success" size="sm" className="self-center sm:self-auto capitalize">
                  Verified {user?.role || "Customer"}
                </Badge>
              </div>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  ID: <span className="font-mono text-slate-900 font-semibold">{user?._id || user?.id || "N/A"}</span>
                </span>
                <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  KYC Verified
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Account Details Form (Read-Only) */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official insurance policyholder account details. Contact support for modifications.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-medium">
              Read-Only
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Full Legal Name
              </label>
              <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium">
                {user?.name || "Not provided"}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Registered Email Address
              </label>
              <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium">
                {user?.email || "Not provided"}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Registered Phone Number
              </label>
              <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium">
                {user?.phone || "+91 98765 43210 (Default on file)"}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Account Role / Tier
              </label>
              <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium capitalize">
                {user?.role || "customer"} (Standard Policyholder)
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-amber-800">
              <span className="font-semibold block mb-0.5">Need to update your official KYC details?</span>
              To comply with insurance regulatory guidelines (IRDAI), updates to your legal name, email, or nominee particulars require verification by our compliance officers. Please submit an official document request.
            </div>
          </div>
        </Card>

        {/* Quick Portal Shortcuts */}
        <Card className="p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">Quick Shortcuts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/customer/policies"
              className="p-4 rounded-xl border border-slate-200 hover:border-primary-500 hover:shadow-card transition-all group bg-white"
            >
              <span className="text-xs text-slate-500 block mb-1">Your Portfolio</span>
              <span className="text-sm font-bold text-slate-900 group-hover:text-primary-600 flex items-center justify-between">
                <span>View Policies</span>
                <span>→</span>
              </span>
            </Link>

            <Link
              to="/customer/claims"
              className="p-4 rounded-xl border border-slate-200 hover:border-primary-500 hover:shadow-card transition-all group bg-white"
            >
              <span className="text-xs text-slate-500 block mb-1">Claim Status</span>
              <span className="text-sm font-bold text-slate-900 group-hover:text-primary-600 flex items-center justify-between">
                <span>Track Claims</span>
                <span>→</span>
              </span>
            </Link>

            <Link
              to="/customer/documents"
              className="p-4 rounded-xl border border-slate-200 hover:border-primary-500 hover:shadow-card transition-all group bg-white"
            >
              <span className="text-xs text-slate-500 block mb-1">Uploaded Files</span>
              <span className="text-sm font-bold text-slate-900 group-hover:text-primary-600 flex items-center justify-between">
                <span>Documents Vault</span>
                <span>→</span>
              </span>
            </Link>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
