import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  FolderOpen,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  FileText,
  UserPlus,
} from "lucide-react";
import StaffLayout from "../../components/layout/StaffLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import { useAuth } from "../../context/AuthContext";
import claimService from "../../services/claimService";
import documentService from "../../services/documentService";

export const OfficerDashboard = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [claimsData, docsData] = await Promise.all([
        claimService.getClaims(),
        documentService.getDocuments().catch(() => []),
      ]);
      setClaims(claimsData || []);
      setDocuments(docsData || []);
    } catch (err) {
      console.error("Failed to load officer dashboard data:", err);
      setError("Unable to load operations data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <StaffLayout pageTitle="Claims Operations">
        <PageLoader message="Loading claims operations queue..." />
      </StaffLayout>
    );
  }

  // Real Calculated Metrics
  const totalClaims = claims.length;
  const docsToVerify = documents.filter((d) => d.verificationStatus === "pending").length;
  const underInvestigation = claims.filter((c) => c.status === "under_investigation").length;
  const readyForApproval = claims.filter(
    (c) => c.status === "documents_verified" || c.status === "pending_approval"
  ).length;

  // Workflows
  const pendingDocsClaims = claims.filter((c) =>
    ["submitted", "documents_under_review"].includes(c.status)
  ).slice(0, 5);

  const unassignedSurveyClaims = claims.filter(
    (c) => !c.assignedSurveyor && ["documents_verified", "under_investigation"].includes(c.status)
  ).slice(0, 5);

  const recentClaims = [...claims].slice(0, 8);

  return (
    <StaffLayout pageTitle="Claims Operations Command">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                Officer Desk
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 font-medium">Underwriting &amp; Case Verification</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.name || "Claims Officer"}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Review incoming policyholder claims, verify supporting evidence, and assign field inspections.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/officer/documents">
              <Button variant="outline" size="sm" leftIcon={<FolderOpen className="w-4 h-4" />}>
                Document Queue ({docsToVerify})
              </Button>
            </Link>
            <Link to="/officer/claims">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All Claims
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchDashboardData}>
              Retry
            </Button>
          </div>
        )}

        {/* Operational KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Claims
              </span>
              <ClipboardList className="w-5 h-5 text-slate-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{totalClaims}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Active repository count</span>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-amber-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Pending Documents
              </span>
              <FolderOpen className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-amber-600">{docsToVerify}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Files requiring officer check</span>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-blue-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                Under Investigation
              </span>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold text-blue-600">{underInvestigation}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Survey inspection in progress</span>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-emerald-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Ready for Approval
              </span>
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600">{readyForApproval}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Verified for manager sign-off</span>
          </Card>
        </div>

        {/* Workflow Priority Queues */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Queue 1: Claims Requiring Document Review */}
          <Card className="p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h3 className="text-sm font-bold text-slate-900">Awaiting Document Review</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">{pendingDocsClaims.length} cases</span>
            </div>

            {pendingDocsClaims.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                All submitted documents have been reviewed.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingDocsClaims.map((claim) => (
                  <div
                    key={claim._id}
                    className="p-3.5 rounded-lg border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">#{claim.claimNumber}</span>
                        <StatusBadge status={claim.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {claim.customer?.name || "Customer"} &bull; {claim.claimType} &bull; Claimed:{" "}
                        <span className="font-semibold text-slate-700">{formatCurrency(claim.claimedAmount)}</span>
                      </p>
                    </div>
                    <Link to={`/officer/claims/${claim._id}`}>
                      <Button variant="outline" size="sm">
                        Verify
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Queue 2: Claims Requiring Surveyor Assignment */}
          <Card className="p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <h3 className="text-sm font-bold text-slate-900">Surveyor Assignment Needed</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">{unassignedSurveyClaims.length} cases</span>
            </div>

            {unassignedSurveyClaims.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No verified claims are currently pending surveyor assignment.
              </p>
            ) : (
              <div className="space-y-3">
                {unassignedSurveyClaims.map((claim) => (
                  <div
                    key={claim._id}
                    className="p-3.5 rounded-lg border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">#{claim.claimNumber}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          Needs Surveyor
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {claim.customer?.name || "Customer"} &bull; {claim.claimType} &bull; {formatCurrency(claim.claimedAmount)}
                      </p>
                    </div>
                    <Link to={`/officer/claims/${claim._id}`}>
                      <Button variant="primary" size="sm" leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
                        Assign
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Claims Operations Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Claims Pipeline</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of latest claims moving through inspection, verification, and settlement stages.
              </p>
            </div>
            <Link to="/officer/claims">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                All Claims
              </Button>
            </Link>
          </div>

          {recentClaims.length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center">
              No claims currently registered in the database.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Claim #</th>
                    <th className="py-3 px-4">Policyholder</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Claimed</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4 text-right">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentClaims.map((claim) => (
                    <tr key={claim._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 font-mono text-xs">
                        #{claim.claimNumber}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-800">
                        {claim.customer?.name || "Customer"}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 capitalize">
                        {claim.claimType}
                      </td>
                      <td className="py-3 px-4 text-xs font-bold text-slate-900">
                        {formatCurrency(claim.claimedAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={claim.status} />
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {formatDate(claim.incidentDate || claim.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/officer/claims/${claim._id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </StaffLayout>
  );
};

export default OfficerDashboard;
