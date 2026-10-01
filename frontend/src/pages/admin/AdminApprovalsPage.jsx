import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckSquare,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  User,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import PageLoader from "../../components/common/PageLoader";
import approvalService from "../../services/approvalService";

export const AdminApprovalsPage = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [decisionFilter, setDecisionFilter] = useState("all");

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await approvalService.getApprovals();
      setApprovals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load approvals:", err);
      setError("Unable to load managerial approval records.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filteredApprovals = approvals.filter((app) => {
    const term = searchTerm.toLowerCase();
    const claimNum = (app.claim?.claimNumber || "").toLowerCase();
    const managerName = (app.manager?.name || "").toLowerCase();
    const remarks = (app.comments || "").toLowerCase();

    const matchesSearch =
      claimNum.includes(term) || managerName.includes(term) || remarks.includes(term);

    const matchesDecision =
      decisionFilter === "all" || app.decision === decisionFilter;

    return matchesSearch && matchesDecision;
  });

  if (loading) {
    return (
      <AdminLayout pageTitle="Managerial Approvals Audit">
        <PageLoader message="Loading executive approval records..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Executive Approvals Oversight">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Approval Audit Log</h1>
            <p className="text-sm text-slate-500 mt-1">
              Historical ledger of managerial claim adjudications, sanctions, rejections, and requests for information.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
            Total Decisions: {approvals.length}
          </span>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchApprovals}>
              Retry
            </Button>
          </div>
        )}

        {/* Filter Controls */}
        <Card className="p-4 bg-white">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by claim #, manager name, remarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-600 bg-white"
              />
            </div>

            <select
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-rose-600 uppercase font-semibold text-slate-700"
            >
              <option value="all">All Decisions</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="request_information">Request Information</option>
            </select>
          </div>
        </Card>

        {/* Approvals Table */}
        {filteredApprovals.length === 0 ? (
          <Card className="p-12 text-center bg-slate-50/50">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No approval records found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Decisions made by claims managers will appear here in the immutable audit log.
            </p>
          </Card>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Claim #</th>
                    <th className="py-3 px-4">Adjudicating Manager</th>
                    <th className="py-3 px-4">Executive Decision</th>
                    <th className="py-3 px-4">Audit Comments / Remarks</th>
                    <th className="py-3 px-4">Decision Date</th>
                    <th className="py-3 px-4 text-right">Case File</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredApprovals.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        #{app.claim?.claimNumber || "N/A"}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-800">{app.manager?.name || "Manager"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                            app.decision === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : app.decision === "rejected"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {app.decision}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-sm truncate italic">
                        "{app.comments || "No comments"}"
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {formatDate(app.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/admin/claims/${app.claim?._id || app.claim}`}
                          className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded transition-colors"
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
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminApprovalsPage;
