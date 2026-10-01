import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckSquare,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Clock,
  Filter,
} from "lucide-react";
import StaffLayout from "../../components/layout/StaffLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import approvalService from "../../services/approvalService";
import claimService from "../../services/claimService";

export const ManagerApprovalsPage = () => {
  const [approvals, setApprovals] = useState([]);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' or 'history'
  const [searchTerm, setSearchTerm] = useState("");
  const [decisionFilter, setDecisionFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [approvalsData, claimsData] = await Promise.all([
        approvalService.getApprovals(),
        claimService.getClaims(),
      ]);
      setApprovals(approvalsData || []);
      const pending = (claimsData || []).filter((c) =>
        ["pending_approval", "documents_verified", "under_investigation"].includes(c.status)
      );
      setPendingClaims(pending);
    } catch (err) {
      console.error("Failed to load approvals data:", err);
      setError("Unable to load manager approvals. Please try again.");
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

  const filteredHistory = approvals.filter((a) => {
    const claimNum = (a.claim?.claimNumber || "").toLowerCase();
    const managerName = (a.manager?.name || "").toLowerCase();
    const term = searchTerm.toLowerCase();
    const matchesSearch = claimNum.includes(term) || managerName.includes(term);
    const matchesDecision = decisionFilter === "all" || a.decision === decisionFilter;
    return matchesSearch && matchesDecision;
  });

  const filteredPending = pendingClaims.filter((c) => {
    const term = searchTerm.toLowerCase();
    const claimNum = (c.claimNumber || "").toLowerCase();
    const custName = (c.customer?.name || "").toLowerCase();
    return claimNum.includes(term) || custName.includes(term);
  });

  if (loading) {
    return (
      <StaffLayout pageTitle="Claims Adjudication">
        <PageLoader message="Loading executive approval records..." />
      </StaffLayout>
    );
  }

  return (
    <StaffLayout pageTitle="Executive Approval Station">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manager Adjudication Station</h1>
            <p className="text-sm text-slate-500 mt-1">
              Issue binding approval, rejection, or information requests on underwritten claim cases.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              {pendingClaims.length} Claims Awaiting Decision
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData}>
              Retry
            </Button>
          </div>
        )}

        {/* Tab Controls & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "pending"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pending Decision ({pendingClaims.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "history"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Adjudication Audit Log ({approvals.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search claim # or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-600 bg-white"
              />
            </div>

            {activeTab === "history" && (
              <select
                value={decisionFilter}
                onChange={(e) => setDecisionFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
              >
                <option value="all">All Decisions</option>
                <option value="approved">Approved Only</option>
                <option value="rejected">Rejected Only</option>
                <option value="request_information">Info Requested Only</option>
              </select>
            )}
          </div>
        </div>

        {/* Tab 1: Pending Decision Queue */}
        {activeTab === "pending" && (
          <div>
            {filteredPending.length === 0 ? (
              <Card className="p-12 text-center bg-slate-50/50">
                <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No claims pending approval</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  All underwritten claims have been adjudicated. New claims will appear here once documents are verified.
                </p>
              </Card>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Claim #</th>
                      <th className="py-3 px-4">Policyholder</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Claimed Amount</th>
                      <th className="py-3 px-4">Current Status</th>
                      <th className="py-3 px-4">Submitted Date</th>
                      <th className="py-3 px-4 text-right">Adjudication</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredPending.map((claim) => (
                      <tr key={claim._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          #{claim.claimNumber}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {claim.customer?.name || "Customer"}
                        </td>
                        <td className="py-3 px-4 capitalize text-slate-600">
                          {claim.claimType}
                        </td>
                        <td className="py-3 px-4 font-extrabold text-slate-900">
                          {formatCurrency(claim.claimedAmount)}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={claim.status} />
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {formatDate(claim.incidentDate || claim.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/manager/claims/${claim._id}`}
                            className="inline-flex items-center gap-1 font-bold text-primary-600 hover:text-primary-700"
                          >
                            <span>Open Dossier</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Historical Decision Log */}
        {activeTab === "history" && (
          <div>
            {filteredHistory.length === 0 ? (
              <Card className="p-12 text-center bg-slate-50/50">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No historical decisions found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Manager decision records will be permanently logged here.
                </p>
              </Card>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Claim #</th>
                      <th className="py-3 px-4">Adjudicated Decision</th>
                      <th className="py-3 px-4">Authorized Amount</th>
                      <th className="py-3 px-4">Manager Remarks</th>
                      <th className="py-3 px-4">Adjudicator</th>
                      <th className="py-3 px-4">Date Logged</th>
                      <th className="py-3 px-4 text-right">Case File</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredHistory.map((a) => (
                      <tr key={a._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          #{a.claim?.claimNumber || a.claim || "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                              a.decision === "approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : a.decision === "rejected"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {a.decision === "request_information" ? "Info Requested" : a.decision}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {a.approvedAmount !== undefined ? formatCurrency(a.approvedAmount) : "—"}
                        </td>
                        <td className="py-3 px-4 text-slate-600 italic truncate max-w-[200px]">
                          {a.remarks || a.comments || "No remarks"}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {a.manager?.name || "Manager"}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {formatDate(a.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/manager/claims/${a.claim?._id || a.claim}`}
                            className="inline-flex items-center gap-1 font-bold text-primary-600 hover:text-primary-700"
                          >
                            <span>Dossier</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default ManagerApprovalsPage;
