import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ClipboardList,
  Clock,
  CheckCircle2,
  PlusCircle,
  FileText,
  FolderOpen,
  ArrowRight,
  AlertCircle,
  Calendar,
  Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AppLayout from "../../components/layout/AppLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import policyService from "../../services/policyService";
import claimService from "../../services/claimService";

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [policiesData, claimsData] = await Promise.all([
        policyService.getPolicies(),
        claimService.getClaims(),
      ]);
      setPolicies(policiesData || []);
      setClaims(claimsData || []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Unable to load insurance portfolio data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format INR currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Calculations from REAL API data
  const activePolicies = policies.filter((p) => p.status === "active").length;
  const totalClaims = claims.length;
  const pendingClaims = claims.filter(
    (c) => !["settled", "closed", "rejected"].includes(c.status)
  ).length;
  const settledClaims = claims.filter((c) => ["settled", "closed"].includes(c.status)).length;

  // Most recent active claim for Spotlight
  const recentActiveClaim =
    claims.find((c) => !["closed", "rejected", "settled"].includes(c.status)) || claims[0];

  // Helper to determine stage state in active claim timeline
  const getStageState = (claimStatus, stageKey) => {
    const stagesOrder = [
      "submitted",
      "documents_verified",
      "under_investigation",
      "approved",
      "settled",
    ];

    const statusAliases = {
      documents_under_review: "submitted",
      pending_approval: "under_investigation",
      settlement_processing: "approved",
      closed: "settled",
    };

    const currentMapped = statusAliases[claimStatus] || claimStatus;
    const currentIndex = stagesOrder.indexOf(currentMapped);
    const stageIndex = stagesOrder.indexOf(stageKey);

    if (stageIndex < currentIndex) return "completed";
    if (stageIndex === currentIndex) return "current";
    return "upcoming";
  };

  if (loading) {
    return (
      <AppLayout pageTitle="Dashboard">
        <PageLoader message="Loading your insurance portfolio..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Dashboard">
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* ================= REFINED WELCOME HERO AREA ================= */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
          <div className="space-y-3 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Verified Policyholder Account
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {getGreeting()}, {user?.name || "Policyholder"}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl">
              Here's what's happening with your insurance today. All active coverage, submitted dossiers, and settlement records are managed below.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
              <span className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                🛡️ {activePolicies} Active Polic{activePolicies === 1 ? "y" : "ies"}
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                📋 {pendingClaims} Claim{pendingClaims === 1 ? "" : "s"} In Progress
              </span>
              {settledClaims > 0 && (
                <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  ✓ {settledClaims} Settled Claim{settledClaims === 1 ? "" : "s"}
                </span>
              )}
            </div>
          </div>

          {/* Right Accent Thumbnail (Real Photography) */}
          <div className="hidden lg:block shrink-0 w-64 h-36 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative">
            <img
              src="/images/customer-tracking.jpg"
              alt="Policyholder tracking claims"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-3">
              <span className="text-[11px] font-medium text-white drop-shadow">
                Digital Claims Portal
              </span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchDashboardData}>
              Retry
            </Button>
          </div>
        )}

        {/* ================= REFINED STATISTIC CARDS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Active Policies */}
          <Card className="p-5 border border-slate-200/90 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Policies
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {activePolicies}
              </span>
              <span className="text-xs text-slate-400">
                of {policies.length} total
              </span>
            </div>
          </Card>

          {/* Card 2: Total Claims */}
          <Card className="p-5 border border-slate-200/90 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Claims
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {totalClaims}
              </span>
              <span className="text-xs text-slate-400">registered</span>
            </div>
          </Card>

          {/* Card 3: Pending Claims */}
          <Card className="p-5 border border-slate-200/90 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                In Progress
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-700">
                {pendingClaims}
              </span>
              <span className="text-xs text-slate-400">processing</span>
            </div>
          </Card>

          {/* Card 4: Settled Claims */}
          <Card className="p-5 border border-slate-200/90 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Settled Claims
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                {settledClaims}
              </span>
              <span className="text-xs text-slate-400">closed</span>
            </div>
          </Card>
        </div>

        {/* ================= ACTIVE CLAIM SPOTLIGHT ================= */}
        {recentActiveClaim && (
          <Card className="p-6 bg-white border border-slate-200/90 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Your Active Claim
                </span>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <h3 className="text-lg font-bold text-slate-900 font-mono">
                    #{recentActiveClaim.claimNumber}
                  </h3>
                  <StatusBadge status={recentActiveClaim.status} />
                  <span className="text-xs font-semibold text-slate-600 capitalize">
                    {recentActiveClaim.claimType} Claim
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Claimed Amount: <span className="font-semibold text-slate-800">{formatCurrency(recentActiveClaim.claimedAmount)}</span> &bull; Filed on {formatDate(recentActiveClaim.createdAt)}
                </p>
              </div>

              <Link to={`/customer/claims/${recentActiveClaim._id}`}>
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View Full Case File
                </Button>
              </Link>
            </div>

            {/* Visual Timeline (Submitted -> Documents -> Investigation -> Approval -> Settlement) */}
            <div className="pt-6 pb-2">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative">
                {[
                  { key: "submitted", label: "Submitted" },
                  { key: "documents_verified", label: "Documents" },
                  { key: "under_investigation", label: "Investigation" },
                  { key: "approved", label: "Approval" },
                  { key: "settled", label: "Settlement" },
                ].map((st) => {
                  const state = getStageState(recentActiveClaim.status, st.key);
                  return (
                    <div
                      key={st.key}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        state === "completed"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : state === "current"
                          ? "bg-slate-900 border-slate-900 text-white font-semibold"
                          : "bg-slate-50 border-slate-200 text-slate-400"
                      }`}
                    >
                      <div className="text-xs flex items-center justify-center gap-1.5 mb-1">
                        {state === "completed" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                        ) : state === "current" ? (
                          <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                        ) : (
                          <span className="w-2 h-2 rounded-full border border-slate-300" />
                        )}
                        <span className="font-semibold">{st.label}</span>
                      </div>
                      <div className="text-[10px] uppercase tracking-wider opacity-80">
                        {state === "completed"
                          ? "Verified"
                          : state === "current"
                          ? "Active Phase"
                          : "Upcoming"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {/* ================= QUICK ACTIONS ================= */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              to="/customer/claims/new"
              className="p-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm flex flex-col justify-between group"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-800 text-primary-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold text-white">Submit New Claim</h4>
                <p className="text-xs text-slate-300 mt-0.5">Start a digital claim</p>
              </div>
            </Link>

            <Link
              to="/customer/policies"
              className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                  Browse Policies
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Active coverage limits</p>
              </div>
            </Link>

            <Link
              to="/customer/claims"
              className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                  Track Claims
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Dossier milestones</p>
              </div>
            </Link>

            <Link
              to="/customer/documents"
              className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                  Upload Documents
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Bills, FIRs &amp; ID proof</p>
              </div>
            </Link>
          </div>
        </div>

        {/* ================= RECENT CLAIMS & ACTIVE POLICIES ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Claims (2 cols on large screen) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Recent Claims</h2>
              <Link
                to="/customer/claims"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <span>View All ({claims.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {claims.length === 0 ? (
              <Card className="p-8 text-center bg-slate-50/50">
                <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No claims yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Submit your first claim to track your digital insurance journey.
                </p>
                <Link to="/customer/claims/new">
                  <Button variant="primary" size="sm">
                    Submit New Claim
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {claims.slice(0, 4).map((claim) => (
                  <Link
                    key={claim._id}
                    to={`/customer/claims/${claim._id}`}
                    className="block bg-white p-4 rounded-xl border border-slate-200/90 hover:border-slate-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs font-mono group-hover:bg-slate-900 group-hover:text-white transition-colors">
                          CLM
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors font-mono">
                            #{claim.claimNumber}
                          </p>
                          <p className="text-xs text-slate-500 capitalize">
                            {claim.claimType} &bull; Incident: {formatDate(claim.incidentDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="text-sm font-extrabold text-slate-900">
                            {formatCurrency(claim.claimedAmount)}
                          </p>
                          <div className="mt-0.5">
                            <StatusBadge status={claim.status} />
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-primary-600 transition-all hidden sm:block" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Active Policies Summary (1 col) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">My Policies</h2>
              <Link
                to="/customer/policies"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <span>View All ({policies.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {policies.length === 0 ? (
              <Card className="p-8 text-center bg-slate-50/50">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No policies found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Your active insurance policies will appear here once registered.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {policies.slice(0, 3).map((policy) => (
                  <Card key={policy._id} className="p-4 hover:border-slate-300 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {policy.policyType}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5 font-mono">
                          {policy.policyNumber}
                        </h4>
                      </div>
                      <StatusBadge status={policy.status} />
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Coverage</span>
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(policy.coverageAmount)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">Valid Until</span>
                        <span className="font-semibold text-slate-800">
                          {formatDate(policy.endDate)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CustomerDashboard;
