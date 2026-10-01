import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FileText,
  ClipboardList,
  Clock,
  CheckCircle2,
  IndianRupee,
  FolderOpen,
  CheckSquare,
  ArrowRight,
  AlertCircle,
  Activity,
  Layers,
  ShieldAlert,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import claimService from "../../services/claimService";
import policyService from "../../services/policyService";
import userService from "../../services/userService";
import documentService from "../../services/documentService";
import approvalService from "../../services/approvalService";
import settlementService from "../../services/settlementService";

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPolicies: 0,
    totalClaims: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    settledClaims: 0,
    pendingDocs: 0,
    pendingApprovals: 0,
  });

  const [recentClaims, setRecentClaims] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState({});
  const [typeDistribution, setTypeDistribution] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        usersList,
        policiesList,
        claimsList,
        docsList,
        approvalsList,
        settlementsList,
      ] = await Promise.all([
        userService.getUsers().catch(() => []),
        policyService.getPolicies().catch(() => []),
        claimService.getClaims().catch(() => []),
        documentService.getDocuments().catch(() => []),
        approvalService.getApprovals().catch(() => []),
        settlementService.getSettlements().catch(() => []),
      ]);

      const claims = Array.isArray(claimsList) ? claimsList : [];
      const users = Array.isArray(usersList) ? usersList : [];
      const policies = Array.isArray(policiesList) ? policiesList : [];
      const docs = Array.isArray(docsList) ? docsList : [];
      const approvals = Array.isArray(approvalsList) ? approvalsList : [];
      const settlements = Array.isArray(settlementsList) ? settlementsList : [];

      // Calculate Real KPIs
      const pendingClaimsCount = claims.filter((c) =>
        ["submitted", "documents_pending", "documents_verified", "under_investigation", "pending_approval"].includes(c.status)
      ).length;

      const approvedClaimsCount = claims.filter((c) => c.status === "approved").length;
      const settledClaimsCount = claims.filter((c) => ["settled", "closed"].includes(c.status)).length;
      const pendingDocsCount = docs.filter((d) => d.status === "pending").length;
      const pendingApprovalsCount = claims.filter((c) => c.status === "pending_approval").length;

      setStats({
        totalUsers: users.length,
        totalPolicies: policies.length,
        totalClaims: claims.length,
        pendingClaims: pendingClaimsCount,
        approvedClaims: approvedClaimsCount,
        settledClaims: settledClaimsCount,
        pendingDocs: pendingDocsCount,
        pendingApprovals: pendingApprovalsCount,
      });

      // Recent 5 claims
      const sortedClaims = [...claims].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentClaims(sortedClaims.slice(0, 6));

      // Calculate Status Distribution
      const statusCounts = {};
      claims.forEach((c) => {
        const s = c.status || "submitted";
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      });
      setStatusDistribution(statusCounts);

      // Calculate Type Distribution
      const typeCounts = {};
      claims.forEach((c) => {
        const t = c.claimType || "other";
        typeCounts[t] = (typeCounts[t] || 0) + 1;
      });
      setTypeDistribution(typeCounts);

      // Compile Recent System Activity from real approvals, settlements, and latest claims
      const activities = [];

      approvals.slice(0, 5).forEach((app) => {
        activities.push({
          id: `app-${app._id}`,
          type: "approval",
          title: `Manager Decision: ${app.decision?.toUpperCase()}`,
          description: app.comments || `Adjudication recorded by manager`,
          user: app.manager?.name || "Manager",
          role: "manager",
          claim: app.claim?.claimNumber,
          claimId: app.claim?._id || app.claim,
          date: app.createdAt,
        });
      });

      settlements.slice(0, 5).forEach((set) => {
        activities.push({
          id: `set-${set._id}`,
          type: "settlement",
          title: `Settlement ${set.status?.toUpperCase()}`,
          description: `Disbursement amount: ₹${Number(set.settlementAmount || 0).toLocaleString("en-IN")}`,
          user: set.processedBy?.name || "Officer",
          role: set.processedBy?.role || "officer",
          claim: set.claim?.claimNumber,
          claimId: set.claim?._id || set.claim,
          date: set.createdAt,
        });
      });

      sortedClaims.slice(0, 5).forEach((cl) => {
        activities.push({
          id: `cl-${cl._id}`,
          type: "claim",
          title: `Claim Filed: #${cl.claimNumber}`,
          description: `Filed under policy ${cl.policy?.policyNumber || "Policy"} by ${cl.customer?.name || "Customer"}`,
          user: cl.customer?.name || "Customer",
          role: "customer",
          claim: cl.claimNumber,
          claimId: cl._id,
          date: cl.createdAt,
        });
      });

      // Sort all activities by date desc
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentActivities(activities.slice(0, 8));
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      setError("Unable to compile system administrative statistics.");
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
      <AdminLayout pageTitle="System Administration">
        <PageLoader message="Aggregating enterprise operational metrics..." />
      </AdminLayout>
    );
  }

  const kpiItems = [
    {
      title: "Total Registered Users",
      value: stats.totalUsers,
      subtext: "Across all access tiers",
      icon: <Users className="w-5 h-5 text-blue-600" />,
      color: "bg-blue-50 border-blue-100",
      link: "/admin/users",
    },
    {
      title: "Total Active Policies",
      value: stats.totalPolicies,
      subtext: "Enterprise policy ledger",
      icon: <FileText className="w-5 h-5 text-indigo-600" />,
      color: "bg-indigo-50 border-indigo-100",
      link: "/admin/policies",
    },
    {
      title: "Total Claims Filed",
      value: stats.totalClaims,
      subtext: "Lifetime intake repository",
      icon: <ClipboardList className="w-5 h-5 text-slate-700" />,
      color: "bg-slate-50 border-slate-200",
      link: "/admin/claims",
    },
    {
      title: "Active Processing Queue",
      value: stats.pendingClaims,
      subtext: "In review / investigation",
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      color: "bg-amber-50 border-amber-100",
      link: "/admin/claims",
    },
    {
      title: "Executive Approvals",
      value: stats.approvedClaims,
      subtext: "Sanctioned by management",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      color: "bg-emerald-50 border-emerald-100",
      link: "/admin/approvals",
    },
    {
      title: "Settled & Closed Claims",
      value: stats.settledClaims,
      subtext: "Fully disbursed & finalized",
      icon: <IndianRupee className="w-5 h-5 text-purple-600" />,
      color: "bg-purple-50 border-purple-100",
      link: "/admin/settlements",
    },
    {
      title: "Pending Documents",
      value: stats.pendingDocs,
      subtext: "Awaiting officer audit",
      icon: <FolderOpen className="w-5 h-5 text-rose-600" />,
      color: "bg-rose-50 border-rose-100",
      link: "/admin/documents",
    },
    {
      title: "Pending Adjudication",
      value: stats.pendingApprovals,
      subtext: "Awaiting manager signoff",
      icon: <CheckSquare className="w-5 h-5 text-teal-600" />,
      color: "bg-teal-50 border-teal-100",
      link: "/admin/approvals",
    },
  ];

  return (
    <AdminLayout pageTitle="Enterprise System Overview">
      <div className="space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Administration Console</h1>
            <p className="text-sm text-slate-500 mt-1">
              Centralized platform governance, claims distribution, financial settlements, and operational audit trail.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All Systems Operational
            </span>
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

        {/* 8 Operational KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          {kpiItems.map((kpi, idx) => (
            <Link
              key={idx}
              to={kpi.link}
              className={`p-5 rounded-xl border transition-all hover:shadow-md hover:border-slate-300 block bg-white ${kpi.color}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 truncate">{kpi.title}</span>
                <div className="p-2 rounded-lg bg-white/80 shadow-2xs shrink-0">{kpi.icon}</div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {kpi.value}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium truncate">{kpi.subtext}</p>
            </Link>
          ))}
        </div>

        {/* Current Claim Distribution & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Claims by Status */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Current Claim Distribution
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Total: {stats.totalClaims} Claims
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-5 text-xs">
              {[
                { label: "Submitted", key: "submitted", color: "bg-blue-50 text-blue-800 border-blue-200" },
                { label: "Docs Pending", key: "documents_pending", color: "bg-amber-50 text-amber-800 border-amber-200" },
                { label: "Docs Verified", key: "documents_verified", color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
                { label: "Investigation", key: "under_investigation", color: "bg-purple-50 text-purple-800 border-purple-200" },
                { label: "Approval Queue", key: "pending_approval", color: "bg-amber-50 text-amber-800 border-amber-200" },
                { label: "Approved", key: "approved", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
                { label: "Settlement", key: "settlement_processing", color: "bg-teal-50 text-teal-800 border-teal-200" },
                { label: "Settled / Closed", key: "settled", color: "bg-slate-100 text-slate-800 border-slate-200" },
              ].map((item) => {
                const count = (statusDistribution[item.key] || 0) + (item.key === "settled" ? (statusDistribution["closed"] || 0) : 0);
                const percentage = stats.totalClaims > 0 ? Math.round((count / stats.totalClaims) * 100) : 0;

                return (
                  <div key={item.key} className={`p-3 rounded-xl border ${item.color} flex flex-col justify-between`}>
                    <span className="text-[11px] font-semibold block">{item.label}</span>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-xl font-bold">{count}</span>
                      <span className="text-[10px] font-semibold opacity-75">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Distribution is updated dynamically based on backend state.</span>
              <Link to="/admin/claims" className="text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center gap-1">
                <span>View Full Registry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          {/* Claims by Type */}
          <Card className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Claims By Product Line
              </h3>
            </div>
            <div className="py-4 space-y-3 text-xs">
              {Object.keys(typeDistribution).length === 0 ? (
                <p className="text-slate-400 italic text-center py-6">No product claims recorded yet.</p>
              ) : (
                Object.entries(typeDistribution).map(([type, count]) => {
                  const pct = stats.totalClaims > 0 ? Math.round((count / stats.totalClaims) * 100) : 0;
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="capitalize font-semibold">{type} Insurance</span>
                        <span className="font-mono font-bold text-slate-900">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="pt-4 border-t border-slate-100 text-center">
              <Link to="/admin/policies" className="text-xs font-semibold text-rose-600 hover:text-rose-800">
                Manage Policy Products &rarr;
              </Link>
            </div>
          </Card>
        </div>

        {/* Recent Claims Overview Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Claims Intake</h3>
              <p className="text-xs text-slate-500">Latest case submissions across all branches.</p>
            </div>
            <Link
              to="/admin/claims"
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
            >
              <span>Explore All Claims</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentClaims.length === 0 ? (
            <Card className="p-8 text-center bg-slate-50/50">
              <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No claims have been submitted into the system yet.</p>
            </Card>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Claim #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Product Type</th>
                      <th className="py-3 px-4">Claimed Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Surveyor</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Administrative Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {recentClaims.map((claim) => (
                      <tr key={claim._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          #{claim.claimNumber}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {claim.customer?.name || "Customer"}
                        </td>
                        <td className="py-3 px-4 capitalize text-slate-600">
                          {claim.claimType}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {formatCurrency(claim.claimedAmount)}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={claim.status} />
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {claim.assignedSurveyor?.name ? (
                            <span className="font-medium text-slate-800">{claim.assignedSurveyor.name}</span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono">
                          {formatDate(claim.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/admin/claims/${claim._id}`}
                            className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded transition-colors"
                          >
                            <span>Inspect Dossier</span>
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

        {/* Recent System Activity Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-600" />
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent System Activity</h3>
          </div>

          {recentActivities.length === 0 ? (
            <Card className="p-8 text-center bg-slate-50/50">
              <p className="text-xs text-slate-500">No recent system activity.</p>
            </Card>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-xs">
              {recentActivities.map((act) => (
                <div key={act.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        act.type === "approval"
                          ? "bg-purple-100 text-purple-700"
                          : act.type === "settlement"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {act.type === "approval" ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : act.type === "settlement" ? (
                        <IndianRupee className="w-4 h-4" />
                      ) : (
                        <ClipboardList className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{act.title}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                          {act.role}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{act.description}</p>
                      <span className="text-[11px] text-slate-400 font-medium">By: {act.user}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:text-right shrink-0">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(act.date).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {act.claimId && (
                      <Link
                        to={`/admin/claims/${act.claimId}`}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                      >
                        Claim #{act.claim} &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
