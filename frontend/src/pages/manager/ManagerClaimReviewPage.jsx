import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  FolderOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CheckSquare,
  Shield,
  FileCheck,
  IndianRupee,
  Clock,
  HelpCircle,
  Lock,
  ExternalLink,
} from "lucide-react";
import StaffLayout from "../../components/layout/StaffLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import claimService from "../../services/claimService";
import documentService from "../../services/documentService";
import surveyService from "../../services/surveyService";
import approvalService from "../../services/approvalService";
import settlementService from "../../services/settlementService";

export const ManagerClaimReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [claim, setClaim] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [surveyReport, setSurveyReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [settlement, setSettlement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState("");

  // Decision Modal State
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState("approved"); // 'approved', 'rejected', 'request_information'
  const [approvedAmount, setApprovedAmount] = useState("");
  const [decisionRemarks, setDecisionRemarks] = useState("");
  const [decisionLoading, setDecisionLoading] = useState(false);

  // Close Settlement State
  const [closeRemarks, setCloseRemarks] = useState("");
  const [closeLoading, setCloseLoading] = useState(false);

  useEffect(() => {
    loadDossier();
  }, [id]);

  const loadDossier = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await claimService.getClaimById(id);
      const claimData = res.claim;
      setClaim(claimData);
      setApprovedAmount(claimData?.claimedAmount || "");

      // Load docs
      try {
        const allDocs = await documentService.getDocuments();
        const matchedDocs = (allDocs || []).filter(
          (d) =>
            d.claim?._id === id ||
            d.claim === id ||
            d.claim?.claimNumber === claimData?.claimNumber
        );
        setDocuments(matchedDocs);
      } catch (dErr) {
        console.warn("Docs error:", dErr);
      }

      // Load survey report
      try {
        const reports = await surveyService.getSurveyReports();
        const found = (reports || []).find(
          (r) =>
            r.claim?._id === id ||
            r.claim === id ||
            r.claim?.claimNumber === claimData?.claimNumber
        );
        setSurveyReport(found || null);
        if (found?.estimatedLoss) {
          // Preset approved amount to surveyor loss if available
          setApprovedAmount(found.estimatedLoss);
        }
      } catch (rErr) {
        console.warn("Survey report error:", rErr);
      }

      // Load history
      try {
        const hist = await claimService.getClaimHistory(id);
        setHistory(hist || []);
      } catch (hErr) {
        console.warn("History error:", hErr);
      }

      // Load settlement if claim was approved
      try {
        const settlements = await settlementService.getSettlements();
        const matchedSettlement = (settlements || []).find(
          (s) =>
            s.claim?._id === id ||
            s.claim === id ||
            s.claim?.claimNumber === claimData?.claimNumber
        );
        setSettlement(matchedSettlement || null);
      } catch (sErr) {
        console.warn("Settlement load error:", sErr);
      }
    } catch (err) {
      console.error("Failed to load manager claim review dossier:", err);
      setError("Unable to find claim or permission denied.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    setDecisionLoading(true);
    try {
      const payload = {
        decision: selectedDecision,
        remarks: decisionRemarks.trim() || undefined,
        comments: decisionRemarks.trim() || undefined,
      };

      if (selectedDecision === "approved") {
        const amt = parseFloat(approvedAmount);
        if (isNaN(amt) || amt < 0 || amt > claim.claimedAmount) {
          alert(`Approved amount must be between ₹0 and ₹${claim.claimedAmount.toLocaleString("en-IN")}`);
          setDecisionLoading(false);
          return;
        }
        payload.approvedAmount = amt;
      }

      await approvalService.createApproval(id, payload);
      setActionSuccess(`Claim decision successfully executed: ${selectedDecision.toUpperCase()}`);
      setShowDecisionModal(false);
      loadDossier();
    } catch (err) {
      console.error("Adjudication failed:", err);
      alert(err.response?.data?.message || "Failed to record approval decision.");
    } finally {
      setDecisionLoading(false);
    }
  };

  const handleCloseSettlement = async (settlementId) => {
    if (!window.confirm("Are you sure you want to close this claim settlement permanently?")) {
      return;
    }
    setCloseLoading(true);
    try {
      await settlementService.closeSettlement(settlementId, {
        remarks: closeRemarks.trim() || "Claim successfully settled and closed by management.",
      });
      setActionSuccess("Settlement and Claim case have been officially closed.");
      loadDossier();
    } catch (err) {
      console.error("Failed to close settlement:", err);
      alert(err.response?.data?.message || "Failed to close settlement.");
    } finally {
      setCloseLoading(false);
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <StaffLayout pageTitle="Claim Adjudication Dossier">
        <PageLoader message="Assembling executive claim dossier..." />
      </StaffLayout>
    );
  }

  if (error || !claim) {
    return (
      <StaffLayout pageTitle="Claim Adjudication Dossier">
        <div className="max-w-xl mx-auto py-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{error || "Claim not found"}</h2>
          <Button variant="outline" size="sm" onClick={() => navigate("/manager/approvals")}>
            Back to Approvals Queue
          </Button>
        </div>
      </StaffLayout>
    );
  }

  const isFinalized = ["approved", "rejected", "settled", "closed"].includes(claim.status);

  return (
    <StaffLayout pageTitle={`Adjudication Dossier #${claim.claimNumber}`}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <Link
            to="/manager/approvals"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Approvals Queue</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Current Status:</span>
            <StatusBadge status={claim.status} />
          </div>
        </div>

        {actionSuccess && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess("")} className="text-emerald-700 font-bold">
              &times;
            </button>
          </div>
        )}

        {/* Section 1: Executive Case Header */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs uppercase font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-800">
                  {claim.claimType} Insurance
                </span>
                <StatusBadge status={claim.status} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                Claim #{claim.claimNumber}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Internal Case ID: <span className="font-mono text-slate-700">{claim._id}</span>
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-right">
              <span className="text-xs uppercase font-semibold text-slate-400 block mb-0.5">
                Claimed Compensation
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {formatCurrency(claim.claimedAmount)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Policyholder</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{claim.customer?.name}</span>
              <span className="text-slate-500 text-[11px]">{claim.customer?.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Active Policy</span>
              <span className="font-mono font-bold text-slate-900 mt-0.5 block">{claim.policy?.policyNumber || "N/A"}</span>
              <span className="text-slate-500 text-[11px]">Max Limit: {formatCurrency(claim.policy?.coverageAmount)}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Incident Date</span>
              <span className="font-medium text-slate-900 mt-0.5 block">{formatDate(claim.incidentDate)}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Assigned Surveyor</span>
              <span className="font-semibold text-slate-900 mt-0.5 block">
                {claim.assignedSurveyor ? "Accredited Surveyor Assigned" : "No Surveyor Required"}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-400 block uppercase font-semibold text-[10px] mb-1">
              Incident Circumstances
            </span>
            <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
              {claim.description}
            </p>
          </div>
        </Card>

        {/* Section 2: Management Decision Station */}
        <Card className="p-6 border-purple-200 bg-purple-50/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-200/80 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-purple-700" />
                <h2 className="text-base font-bold text-slate-900">Executive Adjudication Decision</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Issue binding manager authorization, reject under exclusions, or request supplementary proof.
              </p>
            </div>

            {isFinalized && (
              <span className="text-xs font-bold uppercase px-3 py-1 rounded bg-slate-100 text-slate-700 border border-slate-300">
                Decision Finalized
              </span>
            )}
          </div>

          {!isFinalized ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="md"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                onClick={() => {
                  setSelectedDecision("approved");
                  setShowDecisionModal(true);
                }}
              >
                Approve Claim
              </Button>
              <Button
                variant="outline"
                size="md"
                className="border-rose-300 text-rose-700 hover:bg-rose-50"
                leftIcon={<XCircle className="w-4 h-4" />}
                onClick={() => {
                  setSelectedDecision("rejected");
                  setShowDecisionModal(true);
                }}
              >
                Reject Claim
              </Button>
              <Button
                variant="outline"
                size="md"
                className="border-amber-300 text-amber-800 hover:bg-amber-50"
                leftIcon={<HelpCircle className="w-4 h-4" />}
                onClick={() => {
                  setSelectedDecision("request_information");
                  setShowDecisionModal(true);
                }}
              >
                Request Additional Information
              </Button>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-xl border border-purple-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Current Status</span>
                <span className="font-bold text-slate-900 text-sm capitalize">{claim.status}</span>
              </div>
              <span className="text-slate-500 text-[11px]">
                Further status transitions proceed through financial settlement.
              </span>
            </div>
          )}
        </Card>

        {/* Section 3: Supporting Documents & Officer Verification */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Officer Verification Records</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evidence files and preliminary underwriting checks performed by claims officers.
              </p>
            </div>
            <span className="text-xs text-slate-600 font-semibold">{documents.length} Files</span>
          </div>

          {documents.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No documents submitted.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Filename</th>
                    <th className="py-2.5 px-3">Officer Verification</th>
                    <th className="py-2.5 px-3">Remarks</th>
                    <th className="py-2.5 px-3 text-right">File</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.map((doc) => (
                    <tr key={doc._id}>
                      <td className="py-3 px-3 font-semibold text-slate-900 capitalize">{doc.documentType}</td>
                      <td className="py-3 px-3 font-mono text-slate-600 truncate max-w-[200px]">{doc.filename}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold capitalize ${
                            doc.verificationStatus === "verified"
                              ? "bg-emerald-100 text-emerald-800"
                              : doc.verificationStatus === "rejected"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {doc.verificationStatus || "pending"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 italic">{doc.remarks || "—"}</td>
                      <td className="py-3 px-3 text-right">
                        {doc.filePath ? (
                          <a
                            href={`http://localhost:5000/${doc.filePath}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary-600 hover:underline inline-flex items-center gap-1 font-semibold"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400">File metadata</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Section 4: Surveyor Report Assessment */}
        {surveyReport && (
          <Card className="p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Certified Field Surveyor Report</h2>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                Filed by {surveyReport.surveyor?.name || "Surveyor"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-4">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-semibold text-[10px]">Inspection Date</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{formatDate(surveyReport.inspectionDate)}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-semibold text-[10px]">Certified Loss Assessment</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{formatCurrency(surveyReport.estimatedLoss)}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-semibold text-[10px]">Surveyor Recommendation</span>
                <span className="font-bold text-primary-700 text-sm mt-0.5 block">{surveyReport.recommendation}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <span className="text-slate-400 font-semibold uppercase text-[10px] block">Inspection Findings</span>
              <p className="text-slate-800 leading-relaxed">{surveyReport.findings}</p>
            </div>
          </Card>
        )}

        {/* Section 5: Settlement & Case Closure (Available to Manager) */}
        {settlement && (
          <Card className="p-6 border-indigo-200 bg-indigo-50/20">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-100 mb-4">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Financial Disbursement &amp; Case Closure</h2>
              </div>
              <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                Settlement Status: {settlement.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-4">
              <div>
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Disbursed Amount</span>
                <span className="font-extrabold text-slate-900 text-base mt-0.5 block">
                  {formatCurrency(settlement.settlementAmount)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Payment Reference / UTR</span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                  {settlement.paymentReference || "Direct Bank Credit"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Payment Method</span>
                <span className="uppercase font-semibold text-slate-700 mt-0.5 block">
                  {settlement.paymentMethod}
                </span>
              </div>
            </div>

            {/* Manager Close Action */}
            {claim.status !== "closed" && settlement.status === "completed" && (
              <div className="pt-3 border-t border-indigo-100 flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Payment has completed. You may now close this insurance case permanently.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  loading={closeLoading}
                  leftIcon={<Lock className="w-3.5 h-3.5" />}
                  onClick={() => handleCloseSettlement(settlement._id)}
                >
                  Close Claim Case
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Section 6: Audit History Timeline */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h2 className="text-base font-bold text-slate-900">Audit History Log</h2>
            <span className="text-xs text-slate-400 font-semibold">{history.length} Events</span>
          </div>

          <div className="space-y-4 text-xs">
            {history.map((event, idx) => (
              <div key={event._id || idx} className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-slate-600 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1 pb-3 border-b border-slate-100 last:border-none">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      Status: <span className="font-semibold text-primary-700 uppercase">{event.newStatus}</span>
                    </span>
                    <span className="text-slate-400 text-[11px]">{formatDate(event.createdAt)}</span>
                  </div>
                  {event.comments && <p className="text-slate-600 mt-1 italic">"{event.comments}"</p>}
                  <p className="text-[11px] text-slate-400 mt-1">
                    Logged by: <span className="font-medium text-slate-600">{event.updatedBy?.name || "System"}</span> (
                    {event.updatedBy?.role || "staff"})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Decision Modal */}
        {showDecisionModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 capitalize">
                  Confirm Decision: {selectedDecision.replace("_", " ")}
                </h3>
                <button onClick={() => setShowDecisionModal(false)} className="text-slate-400 hover:text-slate-700 text-lg font-bold">
                  &times;
                </button>
              </div>

              <form onSubmit={handleDecisionSubmit} className="space-y-4 text-xs">
                {selectedDecision === "approved" && (
                  <div>
                    <label className="block font-semibold uppercase text-slate-700 mb-1">
                      Authorized Settlement Amount (INR) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        max={claim.claimedAmount}
                        step="1"
                        value={approvedAmount}
                        onChange={(e) => setApprovedAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 border rounded-lg font-bold text-sm bg-white"
                        required
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Claimed: {formatCurrency(claim.claimedAmount)}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">
                    Manager Justification / Remarks <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter formal justification for audit record..."
                    value={decisionRemarks}
                    onChange={(e) => setDecisionRemarks(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowDecisionModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant={selectedDecision === "approved" ? "primary" : "outline"}
                    size="sm"
                    loading={decisionLoading}
                    className={
                      selectedDecision === "rejected"
                        ? "border-rose-300 text-rose-700 hover:bg-rose-50"
                        : selectedDecision === "request_information"
                        ? "border-amber-300 text-amber-800 hover:bg-amber-50"
                        : ""
                    }
                  >
                    Confirm {selectedDecision.replace("_", " ").toUpperCase()}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default ManagerClaimReviewPage;
