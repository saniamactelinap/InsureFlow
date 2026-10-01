import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckSquare,
  ClipboardList,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import StaffLayout from "../../components/layout/StaffLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import { useAuth } from "../../context/AuthContext";
import claimService from "../../services/claimService";
import approvalService from "../../services/approvalService";
import settlementService from "../../services/settlementService";

export const ManagerDashboard = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [claimsData, approvalsData, settleData] = await Promise.all([
        claimService.getClaims(),
        approvalService.getApprovals().catch(() => []),
        settlementService.getSettlements().catch(() => []),
      ]);
      setClaims(claimsData || []);
      setApprovals(approvalsData || []);
      setSettlements(settleData || []);
    } catch (err) {
      console.error("Failed to load manager operations:", err);
      setError("Unable to load managerial operations. Please try again.");
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
      <StaffLayout pageTitle="Executive Claims Operations">
        <PageLoader message="Loading claims adjudication data..." />
      </StaffLayout>
    );
  }

  // Real KPI calculations
  const pendingApprovalClaims = claims.filter((c) =>
    ["pending_approval", "documents_verified", "under_investigation"].includes(c.status)
  );
  const approvedCount = claims.filter((c) => c.status === "approved").length;
  const rejectedCount = claims.filter((c) => c.status === "rejected").length;
  const investigationCount = claims.filter((c) => c.status === "under_investigation").length;
  const settlementProcessingCount = claims.filter(
    (c) => c.status === "settlement_processing"
  ).length;
  const settledCount = claims.filter((c) => ["settled", "closed"].includes(c.status)).length;

  const approvalQueue = claims.filter((c) =>
    ["pending_approval", "documents_verified"].includes(c.status)
  ).slice(0, 6);

  return (
    <StaffLayout pageTitle="Management Command Center">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                Claims Executive
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 font-medium">Adjudication &amp; Settlement Authority</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.name || "Claims Manager"}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Review underwritten claim files, issue final approval/rejection decisions, and authorize financial disbursements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/manager/approvals">
              <Button variant="primary" size="sm" leftIcon={<CheckSquare className="w-4 h-4" />}>
                Approval Queue ({pendingApprovalClaims.length})
              </Button>
            </Link>
            <Link to="/manager/settlements">
              <Button variant="outline" size="sm" leftIcon={<IndianRupee className="w-4 h-4" />}>
                Settlements ({settlements.length})
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
            <Button variant="outline" size="sm" onClick={fetchManagerData}>
              Retry
            </Button>
          </div>
        )}

        {/* 6 Real Operations KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <Card className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
              Pending Approval
            </span>
            <div className="text-2xl font-extrabold text-amber-600">{pendingApprovalClaims.length}</div>
            <span className="text-[10px] text-slate-400 block mt-1">Requires Sign-off</span>
          </Card>

          <Card className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
              Approved Claims
            </span>
            <div className="text-2xl font-extrabold text-emerald-600">{approvedCount}</div>
            <span className="text-[10px] text-slate-400 block mt-1">Awaiting Settlement</span>
          </Card>

          <Card className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block mb-1">
              Rejected Claims
            </span>
            <div className="text-2xl font-extrabold text-rose-600">{rejectedCount}</div>
            <span className="text-[10px] text-slate-400 block mt-1">Declined under terms</span>
          </Card>

          <Card className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block mb-1">
              Under Survey
            </span>
            <div className="text-2xl font-extrabold text-blue-600">{investigationCount}</div>
            <span className="text-[10px] text-slate-400 block mt-1">Field Assessment</span>
          </Card>

          <Card className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 block mb-1">
              Disbursing
            </span>
            <div className="text-2xl font-extrabold text-indigo-600">{settlementProcessingCount}</div>
            <span className="text-[10px] text-slate-400 block mt-1">Bank Processing</span>
          </Card>

          <Card className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block mb-1">
              Settled &amp; Closed
            </span>
            <div className="text-2xl font-extrabold text-slate-900">{settledCount}</div>
            <span className="text-[10px] text-slate-400 block mt-1">Complete Lifecycle</span>
          </Card>
        </div>

        {/* Priority Approval Queue */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Priority Manager Approval Queue</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Claims with verified documentation ready for executive adjudication and settlement amount assignment.
              </p>
            </div>
            <Link to="/manager/approvals">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Full Decision Queue
              </Button>
            </Link>
          </div>

          {approvalQueue.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">
              No claims currently awaiting manager approval.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Claim #</th>
                    <th className="py-3 px-4">Policyholder</th>
                    <th className="py-3 px-4">Claim Type</th>
                    <th className="py-3 px-4">Claimed Amount</th>
                    <th className="py-3 px-4">Survey Status</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4 text-right">Adjudication</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {approvalQueue.map((claim) => (
                    <tr key={claim._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        #{claim.claimNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {claim.customer?.name || "Customer"}
                      </td>
                      <td className="py-3.5 px-4 capitalize text-slate-600">
                        {claim.claimType}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        {formatCurrency(claim.claimedAmount)}
                      </td>
                      <td className="py-3.5 px-4">
                        {claim.assignedSurveyor ? (
                          <span className="text-blue-700 font-medium">Assigned</span>
                        ) : (
                          <span className="text-slate-400">Not required / pending</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={claim.status} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(claim.incidentDate || claim.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/manager/claims/${claim._id}`}
                          className="inline-flex items-center gap-1 font-bold text-primary-600 hover:text-primary-700"
                        >
                          <span>Review Dossier</span>
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

export default ManagerDashboard;
