import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  FolderOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Shield,
  Calendar,
  IndianRupee,
  UserPlus,
  FileText,
  Clock,
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

// Preset system surveyors for fast assignment
const REGISTERED_SURVEYORS = [
  { id: "6abbe22510066d2dc29a6b88", name: "Demo Surveyor", email: "surveyor@insureflow.com" },
  { id: "6abbbe470ca018bb4db4c93b", name: "Surveyor One", email: "surveyor1_test@example.com" },
  { id: "6abbbe480ca018bb4db4c93f", name: "Surveyor Two", email: "surveyor2_test@example.com" },
];

export const OfficerClaimDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [claim, setClaim] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [history, setHistory] = useState([]);
  const [surveyReport, setSurveyReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState("");

  // Verification modal state
  const [verifyingDoc, setVerifyingDoc] = useState(null);
  const [verifyingStatus, setVerifyingStatus] = useState("verified");
  const [verifyRemarks, setVerifyRemarks] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Surveyor assignment state
  const [selectedSurveyorId, setSelectedSurveyorId] = useState(REGISTERED_SURVEYORS[0].id);
  const [customSurveyorId, setCustomSurveyorId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    loadClaimDossier();
  }, [id]);

  const loadClaimDossier = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await claimService.getClaimById(id);
      const claimData = res.claim;
      setClaim(claimData);

      // Load documents for this claim
      try {
        const allDocs = await documentService.getDocuments();
        const claimDocs = (allDocs || []).filter(
          (d) =>
            d.claim?._id === id ||
            d.claim === id ||
            d.claim?.claimNumber === claimData?.claimNumber
        );
        setDocuments(claimDocs);
      } catch (dErr) {
        console.warn("Could not load claim docs:", dErr);
      }

      // Load history
      try {
        const hist = await claimService.getClaimHistory(id);
        setHistory(hist || []);
      } catch (hErr) {
        console.warn("Could not load claim history:", hErr);
      }

      // Load survey report if under investigation or later
      try {
        const reports = await surveyService.getSurveyReports();
        const matched = (reports || []).find(
          (r) => r.claim?._id === id || r.claim === id || r.claim?.claimNumber === claimData?.claimNumber
        );
        setSurveyReport(matched || null);
      } catch (sErr) {
        console.warn("Could not load survey report:", sErr);
      }
    } catch (err) {
      console.error("Failed to load claim dossier:", err);
      setError("Unable to find claim or permission denied.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifyingDoc) return;
    setVerifyLoading(true);
    try {
      await documentService.verifyDocument(verifyingDoc._id, {
        verificationStatus: verifyingStatus,
        remarks: verifyRemarks.trim(),
      });
      setActionSuccess(`Document marked as ${verifyingStatus} successfully.`);
      setVerifyingDoc(null);
      setVerifyRemarks("");
      loadClaimDossier();
    } catch (err) {
      console.error("Document verification failed:", err);
      alert(err.response?.data?.message || "Verification failed");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleAssignSurveyor = async (e) => {
    e.preventDefault();
    const surveyorToAssign = customSurveyorId.trim() || selectedSurveyorId;
    if (!surveyorToAssign) return;

    setAssignLoading(true);
    try {
      await claimService.assignSurveyor(id, surveyorToAssign);
      setActionSuccess("Field surveyor successfully assigned to claim.");
      loadClaimDossier();
    } catch (err) {
      console.error("Surveyor assignment failed:", err);
      alert(err.response?.data?.message || "Surveyor assignment failed.");
    } finally {
      setAssignLoading(false);
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
      <StaffLayout pageTitle="Claim Case File">
        <PageLoader message="Loading official claim dossier..." />
      </StaffLayout>
    );
  }

  if (error || !claim) {
    return (
      <StaffLayout pageTitle="Claim Case File">
        <div className="max-w-xl mx-auto py-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{error || "Claim not found"}</h2>
          <Button variant="outline" size="sm" onClick={() => navigate("/officer/claims")}>
            Back to Claims Registry
          </Button>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout pageTitle={`Case Dossier #${claim.claimNumber}`}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <Link
            to="/officer/claims"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Claims Queue</span>
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
            <button
              onClick={() => setActionSuccess("")}
              className="text-emerald-700 hover:text-emerald-900 font-bold"
            >
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
              <span className="text-xs uppercase font-semibold tracking-wider text-slate-400 block mb-0.5">
                Claimed Compensation
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {formatCurrency(claim.claimedAmount)}
              </span>
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Policyholder</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{claim.customer?.name || "Customer"}</span>
              <span className="text-slate-500 text-[11px]">{claim.customer?.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Associated Policy</span>
              <span className="font-mono font-bold text-slate-900 mt-0.5 block">{claim.policy?.policyNumber || "N/A"}</span>
              <span className="text-slate-500 text-[11px]">Coverage: {formatCurrency(claim.policy?.coverageAmount)}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Incident Date</span>
              <span className="font-medium text-slate-900 mt-0.5 block">
                {new Date(claim.incidentDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Assigned Surveyor</span>
              <span className="font-semibold text-slate-900 mt-0.5 block">
                {claim.assignedSurveyor?.name || (claim.assignedSurveyor ? "Assigned" : "Pending Assignment")}
              </span>
            </div>
          </div>

          {/* Incident Description */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">
              Incident Narrative Provided by Claimant
            </span>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100">
              {claim.description}
            </p>
          </div>
        </Card>

        {/* Section 2: Supporting Documents Verification */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Claim Evidence Documents</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review submitted invoices, medical reports, and identity files. Verify or reject with audit remarks.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-semibold">
              {documents.length} Files Uploaded
            </span>
          </div>

          {documents.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No evidence documents have been submitted for this claim yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Document Type</th>
                    <th className="py-2.5 px-3">File / Filename</th>
                    <th className="py-2.5 px-3">Uploaded</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Officer Remarks</th>
                    <th className="py-2.5 px-3 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.map((doc) => (
                    <tr key={doc._id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-3 font-semibold text-slate-900 capitalize">
                        {doc.documentType}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 truncate max-w-[180px]">
                        {doc.filePath ? (
                          <a
                            href={`http://localhost:5000/${doc.filePath}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary-600 hover:underline inline-flex items-center gap-1"
                          >
                            <span>{doc.filename || "View File"}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          doc.filename || "Uploaded File"
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {new Date(doc.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold capitalize ${
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
                      <td className="py-3 px-3 text-slate-600 italic">
                        {doc.remarks || "No remarks"}
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setVerifyingDoc(doc);
                            setVerifyingStatus("verified");
                            setVerifyRemarks(doc.remarks || "Verified against active policy criteria.");
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        >
                          Verify
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setVerifyingDoc(doc);
                            setVerifyingStatus("rejected");
                            setVerifyRemarks(doc.remarks || "Document unreadable or invalid.");
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Section 3: Surveyor Assignment */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Survey &amp; Field Investigation Assignment</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign an accredited field surveyor to conduct on-site inspections or injury assessment.
              </p>
            </div>
            {claim.assignedSurveyor && (
              <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 text-xs font-bold">
                Surveyor Assigned
              </span>
            )}
          </div>

          {claim.assignedSurveyor ? (
            <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-blue-900 block text-sm">
                  {claim.assignedSurveyor?.name || "Assigned Surveyor"}
                </span>
                <span className="text-blue-700 block mt-0.5">
                  Email: {claim.assignedSurveyor?.email || "surveyor@insureflow.com"}
                </span>
              </div>
              <span className="text-slate-500 text-[11px]">
                Assigned surveyor can submit field survey reports through their portal.
              </span>
            </div>
          ) : (
            <form onSubmit={handleAssignSurveyor} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Select Certified Surveyor
                </label>
                <select
                  value={selectedSurveyorId}
                  onChange={(e) => setSelectedSurveyorId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-600 text-slate-800"
                >
                  {REGISTERED_SURVEYORS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Or Specify Custom Surveyor User ID:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 6abbe22510066d2dc29a6b88"
                  value={customSurveyorId}
                  onChange={(e) => setCustomSurveyorId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-mono bg-white"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={assignLoading}
                leftIcon={<UserPlus className="w-3.5 h-3.5" />}
              >
                Dispatch Survey Assignment
              </Button>
            </form>
          )}

          {/* Display Survey Report if one exists */}
          {surveyReport && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                Completed Survey Inspection Findings
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px]">Inspection Date</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    {new Date(surveyReport.inspectionDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px]">Estimated Loss Amount</span>
                  <span className="font-extrabold text-slate-900 mt-0.5 block">
                    {formatCurrency(surveyReport.estimatedLoss)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[10px]">Surveyor Recommendation</span>
                  <span className="font-semibold text-primary-700 mt-0.5 block">
                    {surveyReport.recommendation || "Recommended for approval"}
                  </span>
                </div>
                <div className="sm:col-span-3">
                  <span className="text-slate-400 block font-semibold text-[10px]">Detailed Findings</span>
                  <p className="text-slate-700 mt-0.5">{surveyReport.findings}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Section 4: Audit Timeline History */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h2 className="text-base font-bold text-slate-900">Audit History &amp; Transition Log</h2>
            <span className="text-xs text-slate-400 font-semibold">{history.length} Events</span>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No previous audit history transitions recorded.
            </p>
          ) : (
            <div className="space-y-4">
              {history.map((event, idx) => (
                <div key={event._id || idx} className="flex items-start gap-3.5 text-xs">
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-slate-600 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 pb-3 border-b border-slate-100 last:border-none">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        Status Transition:{" "}
                        <span className="font-semibold text-primary-700 uppercase">{event.newStatus}</span>
                      </span>
                      <span className="text-slate-400 text-[11px]">{formatDate(event.createdAt)}</span>
                    </div>
                    {event.comments && (
                      <p className="text-slate-600 mt-1 italic">"{event.comments}"</p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1">
                      Logged by: <span className="font-medium text-slate-600">{event.updatedBy?.name || "System"}</span> (
                      {event.updatedBy?.role || "staff"})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Document Verification Remarks Modal */}
        {verifyingDoc && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 capitalize">
                  {verifyingStatus} Document
                </h3>
                <button
                  onClick={() => setVerifyingDoc(null)}
                  className="text-slate-400 hover:text-slate-700 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="text-xs space-y-1">
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Document</span>
                <span className="font-bold text-slate-900 block">{verifyingDoc.documentType}</span>
                <span className="text-slate-500 font-mono text-[11px]">{verifyingDoc.filename}</span>
              </div>

              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Officer Audit Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={verifyRemarks}
                    onChange={(e) => setVerifyRemarks(e.target.value)}
                    placeholder="Enter justification or explanation for verification decision..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-600"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setVerifyingDoc(null)}
                    disabled={verifyLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant={verifyingStatus === "verified" ? "primary" : "outline"}
                    size="sm"
                    loading={verifyLoading}
                    className={verifyingStatus === "rejected" ? "border-rose-300 text-rose-700 hover:bg-rose-50" : ""}
                  >
                    Confirm {verifyingStatus}
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

export default OfficerClaimDetailsPage;
