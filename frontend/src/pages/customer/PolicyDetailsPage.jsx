import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Calendar,
  IndianRupee,
  ArrowLeft,
  AlertCircle,
  PlusCircle,
  Clock,
  User,
  CheckCircle2,
} from "lucide-react";
import AppLayout from "../../components/layout/AppLayout";
import Card, { CardHeader, CardTitle } from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import policyService from "../../services/policyService";

export const PolicyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await policyService.getPolicyById(id);
        if (!data) {
          setError("Policy not found.");
        } else {
          setPolicy(data);
        }
      } catch (err) {
        console.error("Failed to load policy:", err);
        setError("Unable to load policy details. Please check permissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [id]);

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

  if (loading) {
    return (
      <AppLayout pageTitle="Policy Details">
        <PageLoader message="Loading policy details..." />
      </AppLayout>
    );
  }

  if (error || !policy) {
    return (
      <AppLayout pageTitle="Policy Details">
        <div className="max-w-xl mx-auto py-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{error || "Policy not found"}</h2>
          <p className="text-sm text-slate-500">
            You might not have permission to view this policy, or it does not exist.
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate("/customer/policies")}>
            Back to Policies
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle={`Policy #${policy.policyNumber}`}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/customer/policies")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Policies</span>
          </button>

          <Link to={`/customer/claims/new?policyId=${policy._id}`}>
            <Button
              variant="primary"
              size="md"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              File Claim on this Policy
            </Button>
          </Link>
        </div>

        {/* Main Policy Card */}
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                  {policy.policyType}
                </span>
                <StatusBadge status={policy.status} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {policy.policyNumber}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Policy ID: {policy._id}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 block">Total Coverage</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {formatCurrency(policy.coverageAmount)}
              </span>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Annual Premium
              </span>
              <span className="text-lg font-bold text-slate-900">
                {formatCurrency(policy.premiumAmount || policy.premium)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Paid annually in advance
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Start Date
              </span>
              <span className="text-lg font-bold text-slate-900">
                {formatDate(policy.startDate)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Policy inception date
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                End / Expiry Date
              </span>
              <span className="text-lg font-bold text-slate-900">
                {formatDate(policy.endDate)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Valid until midnight IST
              </span>
            </div>
          </div>

          {/* Policyholder Details */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Policyholder Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Insured Name</span>
                <span className="font-semibold text-slate-800">
                  {policy.customer?.name || "Customer"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Registered Email</span>
                <span className="font-semibold text-slate-800">
                  {policy.customer?.email || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Phone</span>
                <span className="font-semibold text-slate-800">
                  {policy.customer?.phone || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PolicyDetailsPage;
