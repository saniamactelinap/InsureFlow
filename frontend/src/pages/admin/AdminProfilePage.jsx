import React from "react";
import {
  UserCheck,
  Shield,
  Mail,
  Phone,
  Briefcase,
  KeyRound,
  CheckCircle2,
  Calendar,
  Building2,
  Lock,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import Card from "../../components/common/Card";
import { useAuth } from "../../context/AuthContext";

export const AdminProfilePage = () => {
  const { user } = useAuth();

  const responsibilities = [
    "Enterprise policy issuance, term modification, and product catalog governance",
    "Centralized oversight across intake, verification, investigation, and settlement",
    "Evidentiary document compliance auditing and document verification overrides",
    "Financial disbursement monitoring, settlement audits, and permanent case closure",
    "System-wide role-based access control and administrative audit log maintenance",
  ];

  return (
    <AdminLayout pageTitle="Administrator Profile">
      <div className="space-y-6 max-w-4xl">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Administrator Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Authenticated administrator credentials, root authority level, and enterprise security privileges.
          </p>
        </div>

        {/* Profile Card */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-2xl font-bold font-mono shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{user?.name || "System Administrator"}</h2>
                <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase border bg-rose-100 text-rose-800 border-rose-200">
                  {user?.role || "admin"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Head of Enterprise Operations &amp; Platform Governance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                Administrative Email Address
              </span>
              <p className="text-sm font-semibold text-slate-900">{user?.email || "admin@insureflow.com"}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                Emergency Contact Number
              </span>
              <p className="text-sm font-semibold text-slate-900">{user?.phone || "+91 98765 00001"}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                Department
              </span>
              <p className="text-sm font-semibold text-slate-900">
                Corporate Governance, Risk Assessment &amp; Systems IT
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5 text-rose-600" />
                Security Access Level
              </span>
              <p className="text-sm font-semibold text-rose-700 uppercase">
                Tier 1 &ndash; Full Administrative Authority
              </p>
            </div>
          </div>
        </Card>

        {/* Responsibilities */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Briefcase className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">Administrative Governance &amp; Privileges</h3>
          </div>
          <div className="space-y-2.5">
            {responsibilities.map((resp, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{resp}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Security / Compliance Notice */}
        <div className="p-4 rounded-xl bg-slate-900 text-slate-300 text-xs space-y-1 border border-slate-800">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <Lock className="w-4 h-4" />
            <span>Administrative Audit &amp; Compliance Enforcement</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            All policy issuances, document overrides, and final settlement closures executed by this account
            are cryptographically stamped with your administrator identity and permanently logged into the immutable ClaimHistory ledger.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfilePage;
