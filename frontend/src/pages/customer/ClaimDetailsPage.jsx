import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { getClaimById, getClaimHistory } from "../../services/claimService";
import { getDocuments, uploadDocument } from "../../services/documentService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ClaimJourney from "../../components/claims/ClaimJourney";
import {
  FileText,
  Shield,
  UploadCloud,
  ArrowLeft,
  Calendar,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  Check,
  Building,
  User,
  XCircle,
} from "lucide-react";

const DOCUMENT_TYPES = [
  "Medical Bill",
  "Hospital Discharge Summary",
  "Damage Photos",
  "Repair Estimate",
  "Police FIR",
  "Identity Proof",
  "Vehicle RC / License",
  "Death Certificate",
  "Other Supporting Document",
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB maximum

export const ClaimDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [claim, setClaim] = useState(null);
  const [history, setHistory] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadType, setUploadType] = useState(DOCUMENT_TYPES[0]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    fetchClaimData();
  }, [id]);

  const fetchClaimData = async () => {
    try {
      setLoading(true);
      setError("");

      const [claimRes, historyRes, docsRes] = await Promise.all([
        getClaimById(id),
        getClaimHistory(id).catch(() => ({ history: [] })),
        getDocuments().catch(() => ({ documents: [] })),
      ]);

      const loadedClaim = claimRes.claim;
      setClaim(loadedClaim);
      setHistory(historyRes.history || []);

      // Filter documents belonging to this claim
      const claimDocs = (docsRes.documents || []).filter((d) => {
        const cId = d.claim?._id || d.claim;
        return cId === loadedClaim._id || cId === loadedClaim.claimNumber;
      });
      setDocuments(claimDocs);
    } catch (err) {
      console.error("Failed to load claim details", err);
      const msg =
        err.response?.status === 404
          ? "Claim dossier not found. Please verify the reference."
          : err.response?.status === 403
          ? "You do not have authorization to view this claim."
          : "Unable to load claim case file. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelection = (selected) => {
    setUploadError("");
    if (selected.size > MAX_FILE_SIZE_BYTES) {
      setUploadError("File exceeds the maximum allowed size of 5 MB. Please choose a smaller file.");
      setUploadFile(null);
      return;
    }
    const validExtensions = [".pdf", ".jpg", ".jpeg", ".png"];
    const fileExt = selected.name.substring(selected.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(fileExt)) {
      setUploadError("Invalid file type. Supported formats: PDF, PNG, JPG, JPEG.");
      setUploadFile(null);
      return;
    }
    setUploadFile(selected);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Please select a file to upload.");
      return;
    }
    if (uploadFile.size > MAX_FILE_SIZE_BYTES) {
      setUploadError("Maximum file size: 5 MB. Please reduce file size.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");

      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("claim", claim._id);
      formData.append("documentType", uploadType);

      await uploadDocument(formData);
      setUploadSuccess(true);
      setUploadFile(null);

      // Refresh documents
      const docsRes = await getDocuments();
      const updatedDocs = (docsRes.documents || []).filter((d) => {
        const cId = d.claim?._id || d.claim;
        return cId === claim._id || cId === claim.claimNumber;
      });
      setDocuments(updatedDocs);

      setTimeout(() => {
        setUploadSuccess(false);
        setShowUploadModal(false);
      }, 1400);
    } catch (err) {
      console.error("Upload failed", err);
      setUploadError(
        err.response?.data?.message || "Failed to upload document. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const formatCurrency = (amt) => {
    if (amt === undefined || amt === null) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <AppLayout pageTitle="Claim Dossier">
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-slate-500 font-medium">Loading claim case file...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !claim) {
    return (
      <AppLayout pageTitle="Claim Dossier">
        <div className="max-w-2xl mx-auto py-12">
          <Card className="p-8 text-center border-rose-200 bg-rose-50/50">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Claim Not Found</h2>
            <p className="text-sm text-slate-600 mb-6">{error || "Unable to display claim details."}</p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="primary" onClick={fetchClaimData}>
                Retry
              </Button>
              <Button variant="outline" onClick={() => navigate("/customer/claims")}>
                Return to Claims
              </Button>
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle={`Claim #${claim.claimNumber}`}>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Top Breadcrumb & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link to="/customer/dashboard" className="hover:text-primary-700 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link to="/customer/claims" className="hover:text-primary-700 transition-colors">
              Claims
            </Link>
            <span>/</span>
            <span className="font-mono text-slate-900 font-semibold">#{claim.claimNumber}</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUploadModal(true)}
              leftIcon={<UploadCloud className="w-4 h-4" />}
            >
              Upload Supporting Document
            </Button>
            <Link to="/customer/claims">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                All Claims
              </Button>
            </Link>
          </div>
        </div>

        {/* ================= 1. CLAIM OVERVIEW ================= */}
        <Card className="p-6 md:p-8 border border-slate-200/90 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Official Case Dossier
                </span>
                <StatusBadge status={claim.status} size="md" />
                <Badge variant="neutral" size="sm" className="capitalize">
                  {claim.claimType} Claim
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
                #{claim.claimNumber}
              </h1>

              <p className="text-xs text-slate-500 mt-1">
                Registered on {formatDate(claim.createdAt)} &bull; Incident Date: {formatDate(claim.incidentDate)}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-6">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Claimed Amount
                </span>
                <span className="text-2xl font-extrabold text-slate-900">
                  {formatCurrency(claim.claimedAmount)}
                </span>
              </div>
              {claim.policy && (
                <div className="border-l border-slate-200 pl-6">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Under Policy
                  </span>
                  <Link
                    to={`/customer/policies/${claim.policy._id}`}
                    className="text-sm font-bold text-primary-700 hover:underline font-mono"
                  >
                    {claim.policy.policyNumber}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Description Block */}
          <div className="pt-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Incident Description &amp; Circumstances
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {claim.description}
            </div>
          </div>
        </Card>

        {/* ================= 2. POLICY INFORMATION ================= */}
        {claim.policy && (
          <Card className="p-6 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-600" />
                <h2 className="text-base font-bold text-slate-900">Policy Information</h2>
              </div>
              <Link
                to={`/customer/policies/${claim.policy._id}`}
                className="text-xs font-semibold text-primary-700 hover:underline"
              >
                View Policy Schedule &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-500 block mb-0.5">Policy Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {claim.policy.policyNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Coverage Limit</span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatCurrency(claim.policy.coverageAmount)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Premium</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {formatCurrency(claim.policy.premiumAmount)} / yr
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Policy Status</span>
                <div className="mt-0.5">
                  <StatusBadge status={claim.policy.status} />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ================= 3. CLAIM LIFECYCLE JOURNEY ================= */}
        <Card className="p-6 border border-slate-200/90 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Claim Lifecycle Journey</h2>
            <p className="text-xs text-slate-500">
              Sequential phase tracking through underwriting, loss assessment, approval, and settlement.
            </p>
          </div>
          <div className="py-2">
            <ClaimJourney status={claim.status} orientation="horizontal" />
          </div>
        </Card>

        {/* ================= 4. DOCUMENTS DOSSIER ================= */}
        <Card className="p-6 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Supporting Evidence &amp; Documents</h2>
              <p className="text-xs text-slate-500">
                Official documents uploaded for reviewer verification and loss certification.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUploadModal(true)}
              leftIcon={<UploadCloud className="w-4 h-4" />}
            >
              Upload File
            </Button>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No documents attached to this claim yet</p>
              <p className="text-xs text-slate-400 mt-0.5 mb-3">
                Upload medical invoices, repair estimates, or police FIR reports (up to 5 MB).
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUploadModal(true)}
              >
                Upload Now
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="flex items-start justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-slate-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate" title={doc.fileName}>
                        {doc.fileName}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {doc.documentType} &bull; {formatDate(doc.createdAt)}
                      </p>
                      {doc.remarks && (
                        <p className="text-[11px] text-slate-600 italic mt-1 bg-white p-1.5 rounded border border-slate-100">
                          "{doc.remarks}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${
                        doc.verificationStatus === "verified"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : doc.verificationStatus === "rejected"
                          ? "bg-rose-50 text-rose-800 border border-rose-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {doc.verificationStatus || "Pending"}
                    </span>
                    {doc.filePath && (
                      <a
                        href={doc.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-slate-700 p-1"
                        title="Open file"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ================= 5. SURVEY & INVESTIGATION / 6. APPROVAL / 7. SETTLEMENT ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Survey & Investigation Status */}
          <Card className="p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Phase 03
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Survey &amp; Investigation
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Physical loss investigation conducted by licensed surveyor to record damages and compile assessment reports.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Surveyor Assignment:</span>{" "}
              <span className="font-semibold text-slate-800">
                {claim.assignedSurveyor ? "Assigned" : "Pending Assignment"}
              </span>
            </div>
          </Card>

          {/* Manager Approval Status */}
          <Card className="p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Phase 04
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Manager Approval
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manager audits case history, evaluates surveyor loss estimates, and executes payout authorization sign-off.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Authorization Status:</span>{" "}
              <span className="font-semibold text-slate-800 capitalize">
                {["approved", "settlement_processing", "settled", "closed"].includes(claim.status)
                  ? "Approved"
                  : claim.status === "rejected"
                  ? "Rejected"
                  : "Under Evaluation"}
              </span>
            </div>
          </Card>

          {/* Settlement Status */}
          <Card className="p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Phase 05 &bull; 06
                </span>
                <span className="w-2 h-2 rounded-full bg-purple-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Settlement &amp; Closure
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Payment disbursement instruction executed with bank reference numbers, followed by official claim closure.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">Settlement Status:</span>{" "}
              <span className="font-semibold text-slate-800 capitalize">
                {claim.status === "settled" || claim.status === "closed"
                  ? "Settled & Closed"
                  : claim.status === "settlement_processing"
                  ? "Processing"
                  : "Pending Prior Phases"}
              </span>
            </div>
          </Card>
        </div>

        {/* ================= 8. CLAIM HISTORY AUDIT TIMELINE ================= */}
        <Card className="p-6 md:p-8 border border-slate-200/90 shadow-sm">
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900">Claim Audit History</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanent immutable chronological log of state changes, reviewer actions, and official comments.
            </p>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No history logs recorded yet.</p>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {history.map((item, idx) => (
                <div key={item._id || idx} className="relative">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full border-2 bg-white ${
                      idx === 0
                        ? "border-primary-600 bg-primary-50 ring-4 ring-primary-100"
                        : "border-slate-300"
                    }`}
                  />

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm capitalize">
                        {item.newStatus?.replace(/_/g, " ")}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    {item.updatedBy && (
                      <p className="text-[11px] text-slate-500 mb-1">
                        Action by:{" "}
                        <span className="font-semibold text-slate-800 capitalize">
                          {item.updatedBy.name || item.updatedBy.role || "Officer"}
                        </span>{" "}
                        <span className="text-slate-400 capitalize font-mono">
                          ({item.updatedBy.role || "staff"})
                        </span>
                      </p>
                    )}

                    {item.comments && (
                      <div className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100 mt-2 italic">
                        "{item.comments}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ================= UPLOAD MODAL WITH 5 MB LIMIT ================= */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-slate-700" />
                  <h3 className="text-base font-bold text-slate-900">Upload Supporting Document</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {uploadSuccess ? (
                <div className="py-8 text-center text-emerald-700">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-slate-900 text-base">Document Uploaded Successfully</p>
                  <p className="text-xs text-slate-500 mt-1">Our review officer will verify it shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleUpload} className="space-y-4">
                  {uploadError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Document Type
                    </label>
                    <select
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-primary-500 bg-white"
                    >
                      {DOCUMENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Select File
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-slate-400 bg-slate-50/50 transition-colors">
                      <input
                        type="file"
                        id="claim-doc-file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileSelection(e.target.files[0]);
                          }
                        }}
                      />
                      <label htmlFor="claim-doc-file" className="cursor-pointer block">
                        <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                        {uploadFile ? (
                          <div className="text-xs">
                            <span className="font-bold text-slate-900 block truncate">{uploadFile.name}</span>
                            <span className="text-slate-500 font-mono">
                              {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs space-y-0.5">
                            <span className="font-semibold text-primary-700">Click to browse</span> or drag and drop
                            <p className="text-[11px] text-slate-500">Supported formats: PDF, PNG, JPG, JPEG</p>
                            <p className="text-[11px] font-semibold text-slate-700">Maximum file size: 5 MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUploadModal(false)}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={uploading || !uploadFile}
                    >
                      {uploading ? "Uploading..." : "Upload Document"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ClaimDetailsPage;
