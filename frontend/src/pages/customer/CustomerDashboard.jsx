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
  TrendingUp,
  AlertCircle,
  Calendar,
  IndianRupee,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AppLayout from "../../components/layout/AppLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import ClaimJourney from "../../components/claims/ClaimJourney";
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

  // Calculations from REAL data
  const activePolicies = policies.filter((p) => p.status === "active").length;
  const totalClaims = claims.length;
  const pendingClaims = claims.filter(
    (c) => !["settled", "closed", "rejected"].includes(c.status)
  ).length;
  const settledClaims = claims.filter((c) => ["settled", "closed"].includes(c.status)).length;
  const totalClaimedValue = claims.reduce((acc, c) => acc + (c.claimedAmount || 0), 0);

  // Most recent active claim for Journey preview
  const recentActiveClaim =
    claims.find((c) => !["closed", "rejected"].includes(c.status)) || claims[0];

  if (loading) {
    return (
      <AppLayout pageTitle="Dashboard">
        <PageLoader message="Loading your insurance portfolio..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Dashboard">
      <div className="space-y-8">
        {/* ================= HEADER / GREETING ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {getGreeting()}, {user?.name || "Policyholder"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Here's an overview of your insurance policies and claim status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/customer/claims/new">
              <Button
                variant="primary"
                size="md"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                className="shadow-sm shadow-primary-600/30"
              >
                Submit New Claim
              </Button>
            </Link>
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

        {/* ================= STATISTIC KPI CARDS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Active Policies */}
          <Card className="p-5 border-l-4 border-l-primary-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Policies
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
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
          <Card className="p-5 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Claims
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {totalClaims}
              </span>
              <span className="text-xs text-slate-400">submitted</span>
            </div>
          </Card>

          {/* Card 3: Pending Claims */}
          <Card className="p-5 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                In Review / Active
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
                {pendingClaims}
              </span>
              <span className="text-xs text-slate-400">claims processing</span>
            </div>
          </Card>

          {/* Card 4: Settled Claims */}
          <Card className="p-5 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Settled Claims
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {settledClaims}
              </span>
              <span className="text-xs text-slate-400">completed</span>
            </div>
          </Card>
        </div>

        {/* ================= ACTIVE CLAIM JOURNEY PREVIEW ================= */}
        {recentActiveClaim && (
          <Card className="p-6 bg-gradient-to-br from-white to-slate-50 border-slate-200/90 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                  Active Claim Journey
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Claim #{recentActiveClaim.claimNumber} &mdash;{" "}
                  {recentActiveClaim.claimType}
                </h3>
                <p className="text-xs text-slate-500">
                  Claimed: {formatCurrency(recentActiveClaim.claimedAmount)} | Filed:{" "}
                  {formatDate(recentActiveClaim.createdAt)}
                </p>
              </div>

              <Link to={`/customer/claims/${recentActiveClaim._id}`}>
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View Claim Details
                </Button>
              </Link>
            </div>

            <div className="pt-4">
              <ClaimJourney status={recentActiveClaim.status} orientation="horizontal" />
            </div>
          </Card>
        )}

        {/* ================= QUICK ACTIONS ================= */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              to="/customer/claims/new"
              className="p-4 rounded-xl bg-white border border-primary-200 hover:border-primary-400 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                  Submit Claim
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">File an incident report</p>
              </div>
            </Link>

            <Link
              to="/customer/policies"
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  View Policies
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Coverage &amp; active terms</p>
              </div>
            </Link>

            <Link
              to="/customer/claims"
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  My Claims
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Track open &amp; past claims</p>
              </div>
            </Link>

            <Link
              to="/customer/documents"
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  Upload Documents
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Bills, medical &amp; ID proof</p>
              </div>
            </Link>
          </div>
        </div>

        {/* ================= RECENT CLAIMS & ACTIVE POLICIES ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Claims (2 cols on large) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recent Claims</h2>
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
                        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                          CLM
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                            #{claim.claimNumber}
                          </p>
                          <p className="text-xs text-slate-500">
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
              <h2 className="text-lg font-bold text-slate-900">My Policies</h2>
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
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">
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
