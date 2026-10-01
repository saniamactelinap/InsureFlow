import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Search,
  ShieldCheck,
  Calendar,
  IndianRupee,
  ArrowRight,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import AppLayout from "../../components/layout/AppLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import policyService from "../../services/policyService";

export const PoliciesPage = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPolicies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await policyService.getPolicies();
      setPolicies(data || []);
    } catch (err) {
      console.error("Failed to fetch policies:", err);
      setError("Unable to load insurance policies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

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
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter policies
  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch =
      (policy.policyNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (policy.policyType || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || policy.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <AppLayout pageTitle="My Policies">
        <PageLoader message="Fetching your insurance policies..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="My Policies">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Insurance Policies
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              View and manage your active and past coverage contracts.
            </p>
          </div>

          <Link to="/customer/claims/new">
            <Button
              variant="primary"
              size="md"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Submit Claim
            </Button>
          </Link>
        </div>

        {error && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchPolicies}>
              Retry
            </Button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by policy number or type (e.g. Health, Auto)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600 bg-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-600 bg-white text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Portfolio Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Active Coverage Contracts
            </span>
            <span className="text-xl font-extrabold text-slate-900">
              {policies.filter((p) => p.status === "active").length} of {policies.length} Policies
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Insured Coverage
            </span>
            <span className="text-xl font-extrabold text-primary-700">
              {formatCurrency(
                policies
                  .filter((p) => p.status === "active")
                  .reduce((sum, p) => sum + (p.coverageAmount || 0), 0)
              )}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Annual Premiums
            </span>
            <span className="text-xl font-extrabold text-slate-900">
              {formatCurrency(
                policies
                  .filter((p) => p.status === "active")
                  .reduce((sum, p) => sum + (p.premiumAmount || p.premium || 0), 0)
              )}
            </span>
          </div>
        </div>

        {/* Policies Grid */}
        {filteredPolicies.length === 0 ? (
          <Card className="p-12 text-center bg-slate-50/50">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No policies found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "No policies matched your search criteria."
                : "Your registered insurance policies will be visible here."}
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolicies.map((policy) => (
              <Card
                key={policy._id}
                hover
                className="p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
                      <span>{policy.policyType}</span>
                    </div>
                    <StatusBadge status={policy.status} />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-3 mb-1">
                    {policy.policyNumber}
                  </h3>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-400">Coverage Limit</span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(policy.coverageAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-400">Annual Premium</span>
                      <span className="font-semibold text-slate-700">
                        {formatCurrency(policy.premiumAmount || policy.premium)}
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Validity Period</span>
                      <span className="font-medium text-slate-700 text-right">
                        {formatDate(policy.startDate)} &ndash;{" "}
                        {formatDate(policy.endDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/customer/policies/${policy._id}`}
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-center"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      View Policy
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PoliciesPage;
