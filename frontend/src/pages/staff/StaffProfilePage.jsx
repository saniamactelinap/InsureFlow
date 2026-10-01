import React from "react";
import {
  User,
  Shield,
  Mail,
  Phone,
  Briefcase,
  KeyRound,
  CheckCircle2,
  Calendar,
  Building2,
} from "lucide-react";
import StaffLayout from "../../components/layout/StaffLayout";
import Card from "../../components/common/Card";
import { useAuth } from "../../context/AuthContext";

export const StaffProfilePage = () => {
  const { user } = useAuth();
  const role = user?.role || "officer";

  const getRoleResponsibilities = () => {
    switch (role) {
      case "manager":
        return [
          "Executive adjudication of insurance claims (Approval / Rejection / Info Request)",
          "Review of field surveyor damage reports and certified loss assessments",
          "Financial authorization and final closure of fund disbursements / settlements",
          "Compliance oversight across end-to-end claim lifecycles and audit trails",
        ];
      case "surveyor":
        return [
          "On-site and field inspection of damaged insured assets and properties",
          "Verification of physical damage consistency against customer statements",
          "Compilation and submission of certified loss estimates and surveyor reports",
          "Technical recommendations for claim validation or salvage values",
        ];
      case "officer":
      default:
        return [
          "Initial claim intake and mandatory document verification / rejection",
          "Assignment of verified claims to certified field surveyors",
          "Initiation and status monitoring of approved claim settlement disbursements",
          "Maintaining chronological audit histories and customer case dossiers",
        ];
    }
  };

  const getRoleBadge = () => {
    switch (role) {
      case "manager":
        return {
          label: "Executive Claims Manager",
          color: "bg-purple-100 text-purple-800 border-purple-200",
        };
      case "surveyor":
        return {
          label: "Certified Field Surveyor",
          color: "bg-amber-100 text-amber-800 border-amber-200",
        };
      case "officer":
      default:
        return {
          label: "Insurance Claims Officer",
          color: "bg-blue-100 text-blue-800 border-blue-200",
        };
    }
  };

  const roleInfo = getRoleBadge();

  return (
    <StaffLayout pageTitle="Operator Profile">
      <div className="space-y-6 max-w-4xl">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Account Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Authenticated operator credentials, access authorization, and operational privileges.
          </p>
        </div>

        {/* Profile Card */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl font-bold font-mono shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{user?.name || "Staff Operator"}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase border ${roleInfo.color}`}
                >
                  {user?.role || role}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{roleInfo.label}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                Work Email Address
              </span>
              <p className="text-sm font-semibold text-slate-900">{user?.email || "N/A"}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                Contact Number
              </span>
              <p className="text-sm font-semibold text-slate-900">{user?.phone || "+91 98765 43210"}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                Department
              </span>
              <p className="text-sm font-semibold text-slate-900">
                {role === "manager"
                  ? "Executive Underwriting & Claims Adjudication"
                  : role === "surveyor"
                  ? "Field Technical Inspections & Loss Assessment"
                  : "Claims Intake, Verification & Settlement Operations"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                Security Access Level
              </span>
              <p className="text-sm font-semibold text-slate-900 uppercase">
                Tier 2 &ndash; Role-Based Authorized Staff
              </p>
            </div>
          </div>
        </Card>

        {/* Operational Responsibilities */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Briefcase className="w-4 h-4 text-primary-600" />
            <h3 className="text-sm font-bold text-slate-900">Authorized Responsibilities &amp; Workflows</h3>
          </div>
          <div className="space-y-2.5">
            {getRoleResponsibilities().map((resp, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{resp}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Security & Audit notice */}
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-800 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <span>Audit Trail Compliance Notice</span>
          </div>
          <p className="text-amber-700 leading-relaxed">
            All document verifications, survey assessments, approval decisions, and fund settlement operations
            are cryptographically tied to your operator ID and permanently recorded in the immutable Claim History audit log.
          </p>
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffProfilePage;
