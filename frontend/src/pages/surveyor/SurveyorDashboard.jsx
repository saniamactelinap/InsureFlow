import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  FileCheck,
  Clock,
  ArrowRight,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Search,
} from "lucide-react";
import StaffLayout from "../../components/layout/StaffLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import { useAuth } from "../../context/AuthContext";
import surveyService from "../../services/surveyService";

export const SurveyorDashboard = () => {
  const { user } = useAuth();
  const [assignedClaims, setAssignedClaims] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSurveyorData();
  }, []);

  const fetchSurveyorData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [claimsData, reportsData] = await Promise.all([
        surveyService.getAssignedClaims(),
        surveyService.getSurveyReports().catch(() => []),
      ]);
      setAssignedClaims(claimsData || []);
      setReports(reportsData || []);
    } catch (err) {
      console.error("Failed to load surveyor data:", err);
      setError("Unable to load assigned inspection queue. Please try again.");
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
      <StaffLayout pageTitle="Field Surveyor Desk">
        <PageLoader message="Loading assigned inspection portfolio..." />
      </StaffLayout>
    );
  }

  // Real Calculated KPIs
  const totalAssigned = assignedClaims.length;
  // A claim has a completed survey report if a report exists for it
  const completedReportClaimIds = new Set(
    reports.map((r) => r.claim?._id || r.claim)
  );
  const pendingInspections = assignedClaims.filter(
    (c) => !completedReportClaimIds.has(c._id)
  ).length;
  const completedSurveys = reports.length;
  const reportsAwaitingReview = reports.filter(
    (r) => r.reportStatus === "completed"
  ).length;

  const urgentInspections = assignedClaims.filter(
    (c) => !completedReportClaimIds.has(c._id)
  ).slice(0, 5);

  return (
    <StaffLayout pageTitle="Field Surveyor Dashboard">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                Certified Field Surveyor
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 font-medium">On-Site Damage &amp; Loss Assessment</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome, {user?.name || "Surveyor"}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Access your assigned insurance investigation claims, record findings, and submit loss estimates.
            </p>
          </div>

          <Link to="/surveyor/claims">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Assigned Claims ({assignedClaims.length})
            </Button>
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchSurveyorData}>
              Retry
            </Button>
          </div>
        )}

        {/* Operational KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Assigned Claims
              </span>
              <ClipboardList className="w-5 h-5 text-slate-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{totalAssigned}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Allocated to your desk</span>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-amber-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Pending Inspections
              </span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-amber-600">{pendingInspections}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Awaiting field report</span>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-emerald-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Completed Surveys
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600">{completedSurveys}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Reports officially filed</span>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-blue-500 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                Reports Awaiting Review
              </span>
              <FileCheck className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold text-blue-600">{reportsAwaitingReview}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Under officer examination</span>
          </Card>
        </div>

        {/* Priority Pending Inspections Queue */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Pending Field Inspections</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Claims assigned to you that require physical inspection and loss estimation.
              </p>
            </div>
            <Link to="/surveyor/claims">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                View All Assigned
              </Button>
            </Link>
          </div>

          {urgentInspections.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">
              All assigned inspections have been completed or no claims are currently pending survey.
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
                    <th className="py-3 px-4">Incident Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {urgentInspections.map((claim) => (
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
                      <td className="py-3 px-4 text-slate-500">
                        {formatDate(claim.incidentDate)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={claim.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/surveyor/claims/${claim._id}`}
                          className="inline-flex items-center gap-1 font-bold text-primary-600 hover:text-primary-700"
                        >
                          <span>Inspect</span>
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

export default SurveyorDashboard;
