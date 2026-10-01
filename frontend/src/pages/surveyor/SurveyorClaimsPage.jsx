import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Search,
  ArrowRight,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Clock,
} from "lucide-react";
import StaffLayout from "../../components/layout/StaffLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import surveyService from "../../services/surveyService";

export const SurveyorClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchAssignedClaims();
  }, []);

  const fetchAssignedClaims = async () => {
    setLoading(true);
    setError(null);
    try {
      const [claimsData, reportsData] = await Promise.all([
        surveyService.getAssignedClaims(),
        surveyService.getSurveyReports().catch(() => []),
      ]);
      setClaims(claimsData || []);
      setReports(reportsData || []);
    } catch (err) {
      console.error("Failed to load assigned claims:", err);
      setError("Unable to load assigned claims. Please try again.");
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

  const completedReportClaimIds = new Set(
    reports.map((r) => r.claim?._id || r.claim)
  );

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      (claim.claimNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (claim.customer?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (claim.claimType || "").toLowerCase().includes(searchTerm.toLowerCase());

    const hasReport = completedReportClaimIds.has(claim._id);
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "pending_report"
        ? !hasReport
        : statusFilter === "report_submitted"
        ? hasReport
        : claim.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <StaffLayout pageTitle="Assigned Claims">
        <PageLoader message="Fetching claims assigned to your surveyor desk..." />
      </StaffLayout>
    );
  }

  return (
    <StaffLayout pageTitle="Assigned Claims">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assigned Field Investigations</h1>
            <p className="text-sm text-slate-500 mt-1">
              Claims allocated to you for damage verification, loss estimation, and official survey reporting.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
            Total Allocated: {claims.length}
          </span>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchAssignedClaims}>
              Retry
            </Button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by claim number, customer, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-600 bg-white"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-600 bg-white text-slate-700"
            >
              <option value="all">All Survey States</option>
              <option value="pending_report">Pending Survey Report</option>
              <option value="report_submitted">Survey Report Submitted</option>
              <option value="under_investigation">Under Investigation</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>

        {/* Claims Table */}
        {filteredClaims.length === 0 ? (
          <Card className="p-12 text-center bg-slate-50/50">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No assigned claims found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "No claims match your filter criteria."
                : "Claims assigned to you by claims officers will appear here."}
            </p>
          </Card>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Claim #</th>
                  <th className="py-3.5 px-4">Policyholder</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Claimed Amount</th>
                  <th className="py-3.5 px-4">Incident Date</th>
                  <th className="py-3.5 px-4">Survey Status</th>
                  <th className="py-3.5 px-4">Claim Status</th>
                  <th className="py-3.5 px-4 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredClaims.map((claim) => {
                  const hasReport = completedReportClaimIds.has(claim._id);
                  return (
                    <tr key={claim._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        #{claim.claimNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {claim.customer?.name || "Customer"}
                      </td>
                      <td className="py-3.5 px-4 capitalize text-slate-600">
                        {claim.claimType}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(claim.claimedAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(claim.incidentDate)}
                      </td>
                      <td className="py-3.5 px-4">
                        {hasReport ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Report Filed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Clock className="w-3 h-3" />
                            <span>Needs Report</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={claim.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/surveyor/claims/${claim._id}`}
                          className="inline-flex items-center gap-1 font-bold text-primary-600 hover:text-primary-700"
                        >
                          <span>{hasReport ? "View Dossier" : "Inspect"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default SurveyorClaimsPage;
