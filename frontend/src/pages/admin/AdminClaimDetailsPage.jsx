import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ClipboardList,
  User,
  Shield,
  FileText,
  Calendar,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  CheckSquare,
  CreditCard,
  History,
  ArrowLeft,
  Eye,
  Lock,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import claimService from "../../services/claimService";
import documentService from "../../services/documentService";
import surveyService from "../../services/surveyService";
import approvalService from "../../services/approvalService";
import settlementService from "../../services/settlementService";

export const AdminClaimDetailsPage = () => {
  const { id } = useParams();
  const [claim, setClaim] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [surveyReport, setSurveyReport] = useState(null);
  const [approval, setApproval] = useState(null);
  const [settlement, setSettlement] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClaimDossier();
  }, [id]);

  const fetchClaimDossier = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        claimRes,
        docsRes,
        surveysRes,
        approvalsRes,
        settlementsRes,
        historyRes,
      ] = await Promise.all([
        claimService.getClaimById(id),
        documentService.getDocumentsByClaim(id).catch(() => []),
        surveyService.getSurveyReports().catch(() => []),
        approvalService.getApprovals().catch(() => []),
        settlementService.getSettlements().catch(() => []),
        claimService.getClaimHistory(id).catch(() => []),
      ]);

      const foundClaim = claimRes?.claim || claimRes;
      setClaim(foundClaim);
      setDocuments(Array.isArray(docsRes) ? docsRes : []);
      setHistory(Array.isArray(historyRes) ? historyRes : []);

      // Find survey for this claim
      const allSurveys = Array.isArray(surveysRes) ? surveysRes : [];
      const matchSurvey = allSurveys.find(
        (s) => (s.claim?._id || s.claim) === id
      );
      setSurveyReport(matchSurvey || null);

      // Find approval for this claim
      const allApprovals = Array.isArray(approvalsRes) ? approvalsRes : [];
      const matchApproval = allApprovals.find(
        (a) => (a.claim?._id || a.claim) === id
      );
      setApproval(matchApproval || null);

      // Find settlement for this claim
      const allSettlements = Array.isArray(settlementsRes) ? settlementsRes : [];
      const matchSettlement = allSettlements.find(
        (st) => (st.claim?._id || st.claim) === id
      );
      setSettlement(matchSettlement || null);
    } catch (err) {
      console.error("Failed to load admin claim dossier:", err);
      setError("Unable to retrieve comprehensive case dossier records.");
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
      <AdminLayout pageTitle="Administrative Dossier">
        <PageLoader message="Loading complete claim lifecycle dossier..." />
      </AdminLayout>
    );
  }

  if (error || !claim) {
    return (
      <AdminLayout pageTitle="Administrative Dossier">
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">{error || "Claim not found"}</h2>
          <Link
            to="/admin/claims"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Claims Master</span>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle={`Claim Dossier #${claim.claimNumber}`}>
      <div className="space-y-6">
        {/* Back Link & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/claims"
              className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-mono text-slate-900">
                  #{claim.claimNumber}
                </h1>
                <StatusBadge status={claim.status} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized Administrative Dossier &ndash; Submitted on {formatDate(claim.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Top Summary Dossier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Claim Overview */}
          <Card className="p-6 md:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Claim Overview &amp; Incident Particulars
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-900">
                Claimed: {formatCurrency(claim.claimedAmount)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Claim Type</span>
                <span className="font-bold text-slate-800 capitalize text-sm">{claim.claimType}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Incident Date</span>
                <span className="font-semibold text-slate-800">{formatDate(claim.incidentDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Assigned Officer</span>
                <span className="font-semibold text-slate-800">
                  {claim.assignedOfficer?.name || "Auto-Intake Queue"}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 block font-medium mb-1">Incident Description</span>
              <p className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed font-normal">
                {claim.description || "No formal incident description provided."}
              </p>
            </div>
          </Card>

          {/* Customer & Policy Side Panel */}
          <div className="space-y-6">
            {/* Customer Panel */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <User className="w-4 h-4 text-primary-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Policyholder Details
                </h3>
              </div>
              <div className="text-xs space-y-1.5">
                <p className="font-bold text-slate-900 text-sm">{claim.customer?.name || "Customer"}</p>
                <p className="font-mono text-slate-600">{claim.customer?.email}</p>
                <p className="font-mono text-slate-600">{claim.customer?.phone || "Phone: N/A"}</p>
              </div>
            </Card>

            {/* Policy Panel */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Shield className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Underlying Policy
                </h3>
              </div>
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Policy Number</span>
                  <span className="font-mono font-bold text-slate-900">
                    {claim.policy?.policyNumber || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Policy Type</span>
                  <span className="capitalize font-semibold text-slate-800">
                    {claim.policy?.policyType || claim.claimType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Coverage Sum</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(claim.policy?.coverageAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Annual Premium</span>
                  <span className="font-medium text-slate-800">
                    {formatCurrency(claim.policy?.premiumAmount)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Supporting Documents Section */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Uploaded Evidentiary Documents ({documents.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">System upload limit: 5 MB</span>
          </div>

          {documents.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">No evidentiary documents attached to this claim.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between text-xs space-y-2"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900 truncate block">
                        {doc.originalName || doc.fileName}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          doc.verificationStatus === "verified"
                            ? "bg-emerald-100 text-emerald-800"
                            : doc.verificationStatus === "rejected"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {doc.verificationStatus}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">
                      Type: {doc.documentType}
                    </span>
                    {doc.verificationRemarks && (
                      <p className="text-[11px] text-slate-600 italic mt-1 bg-white p-2 rounded border border-slate-100">
                        "{doc.verificationRemarks}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-[11px] text-slate-400">
                    <span>{formatDate(doc.createdAt)}</span>
                    {doc.filePath && (
                      <a
                        href={`http://localhost:5000/${doc.filePath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-rose-600 hover:text-rose-800 font-semibold inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Survey, Approval & Settlement Triple Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Survey Report Card */}
          <Card className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <FileCheck className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Field Survey Report
                </h3>
              </div>

              {surveyReport ? (
                <div className="py-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Surveyor</span>
                    <span className="font-semibold text-slate-900">{surveyReport.surveyor?.name || "Surveyor"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Loss</span>
                    <span className="font-bold text-slate-900">{formatCurrency(surveyReport.estimatedLoss)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Inspection Date</span>
                    <span className="font-medium text-slate-700">{formatDate(surveyReport.inspectionDate)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 block mb-0.5">Findings Summary:</span>
                    <p className="text-slate-600 italic line-clamp-3">"{surveyReport.findings}"</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-6 text-center">
                  {claim.assignedSurveyor
                    ? `Assigned to ${claim.assignedSurveyor.name}. Awaiting field report submission.`
                    : "No surveyor currently assigned to this claim."}
                </p>
              )}
            </div>
          </Card>

          {/* Manager Approval Card */}
          <Card className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <CheckSquare className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Executive Adjudication
                </h3>
              </div>

              {approval ? (
                <div className="py-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Adjudicator</span>
                    <span className="font-semibold text-slate-900">{approval.manager?.name || "Manager"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Decision</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        approval.decision === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : approval.decision === "rejected"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {approval.decision}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Decision Date</span>
                    <span className="font-medium text-slate-700">{formatDate(approval.createdAt)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 block mb-0.5">Manager Remarks:</span>
                    <p className="text-slate-600 italic">"{approval.remarks || "No additional comments"}"</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-6 text-center">
                  Claim has not yet reached managerial adjudication.
                </p>
              )}
            </div>
          </Card>

          {/* Settlement Card */}
          <Card className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <CreditCard className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Disbursement Settlement
                </h3>
              </div>

              {settlement ? (
                <div className="py-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Disbursed Amount</span>
                    <span className="font-bold text-slate-900">{formatCurrency(settlement.settlementAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Status</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-100 text-teal-800">
                      {settlement.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Method</span>
                    <span className="uppercase font-semibold text-slate-800">{settlement.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reference / UTR</span>
                    <span className="font-mono text-slate-700">{settlement.paymentReference || "—"}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-6 text-center">
                  No settlement disbursement initiated for this claim yet.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Claim History Audit Timeline */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <History className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Immutable Claim History &amp; Audit Trail
            </h3>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">No audit history entries recorded.</p>
          ) : (
            <div className="space-y-4 pt-2">
              {history.map((h, idx) => (
                <div key={h._id || idx} className="flex items-start gap-4 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1.5 shrink-0 ring-4 ring-rose-50"></div>
                  <div className="space-y-0.5 flex-1 pb-3 border-b border-slate-100 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 capitalize">
                        Status Transition: {h.previousStatus || "Initial"} &rarr; {h.newStatus}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(h.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-slate-600">{h.comments || "Status update logged"}</p>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Updated By: {h.updatedBy?.name || "System Operator"} ({h.updatedBy?.role || "Staff"})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminClaimDetailsPage;
