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
          ? "Claim not found. Please check the URL."
          : err.response?.status === 403
          ? "You do not have permission to view this claim."
          : "Unable to load claim details. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Please select a file to upload.");
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
      }, 1500);
    } catch (err) {
      console.error("Upload failed", err);
      setUploadError(
        err.response?.data?.message || "Failed to upload document. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-slate-500 font-medium">Loading claim dossier...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !claim) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-12">
          <Card className="p-8 text-center border-rose-200 bg-rose-50/50">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              !
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Claim</h2>
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
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Breadcrumb & Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/customer/dashboard" className="hover:text-primary-600 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link to="/customer/claims" className="hover:text-primary-600 transition-colors">
              Claims
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-mono font-medium">{claim.claimNumber}</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Supporting Document
            </Button>
            <Link to="/customer/claims">
              <Button variant="ghost" size="sm">
                Back to Claims
              </Button>
            </Link>
          </div>
        </div>

        {/* Claim Header Card */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl font-bold font-mono text-slate-900">{claim.claimNumber}</h1>
                <StatusBadge status={claim.status} size="md" />
                <Badge variant="neutral" size="sm" className="capitalize">
                  {claim.claimType} Claim
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Created on {new Date(claim.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="flex items-center gap-6 self-start md:self-auto bg-slate-50 px-5 py-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider block">
                  Claimed Amount
                </span>
                <span className="text-2xl font-bold text-slate-900">
                  ₹{Number(claim.claimedAmount).toLocaleString("en-IN")}
                </span>
              </div>
              {claim.policy && (
                <div className="border-l border-slate-200 pl-6">
                  <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider block">
                    Under Policy
                  </span>
                  <Link
                    to={`/customer/policies/${claim.policy._id}`}
                    className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline block"
                  >
                    {claim.policy.policyNumber}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Incident Date</span>
              <span className="font-semibold text-slate-800 text-sm">
                {new Date(claim.incidentDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Policy Coverage Limit</span>
              <span className="font-semibold text-slate-800 text-sm">
                {claim.policy?.coverageAmount
                  ? `₹${claim.policy.coverageAmount.toLocaleString("en-IN")}`
                  : "N/A"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Supporting Documents</span>
              <span className="font-semibold text-slate-800 text-sm">
                {documents.length} File{documents.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Last Updated</span>
              <span className="font-semibold text-slate-800 text-sm">
                {new Date(claim.updatedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </Card>

        {/* Claim Lifecycle Journey */}
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">Claim Lifecycle Journey</h2>
            <p className="text-xs text-slate-500">
              Transparent milestone progress tracking through underwriting, assessment, and disbursement.
            </p>
          </div>
          <div className="py-4">
            <ClaimJourney currentStatus={claim.status} orientation="horizontal" />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Details & Documents (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description & Overview */}
            <Card className="p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-3">Incident Description</h2>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {claim.description}
              </div>
            </Card>

            {/* Attached Documents */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Supporting Documents</h2>
                  <p className="text-xs text-slate-500">
                    Verification documents uploaded for claim assessment and audit.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadModal(true)}
                  className="text-xs"
                >
                  + Add Document
                </Button>
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <div className="w-10 h-10 text-slate-400 mx-auto mb-2">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-slate-700">No documents uploaded for this claim yet</p>
                  <p className="text-xs text-slate-400 mt-0.5 mb-3">
                    Upload medical bills, FIR reports, or repair estimates to expedite review.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUploadModal(true)}
                    className="text-xs"
                  >
                    Upload Now
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc._id}
                      className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-primary-600 flex-shrink-0 shadow-sm">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{doc.fileName}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                            <span className="font-medium text-slate-700">{doc.documentType}</span>
                            <span>•</span>
                            <span>
                              {new Date(doc.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                            doc.verificationStatus === "verified"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : doc.verificationStatus === "rejected"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {doc.verificationStatus || "Pending"}
                        </span>
                        {doc.filePath && (
                          <a
                            href={doc.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors"
                            title="View / Download File"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Claim History Timeline */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-1">Audit & Event History</h2>
              <p className="text-xs text-slate-500 mb-6">
                Official chronological log of every status transition and assessment action.
              </p>

              {history.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No history logs recorded yet.</p>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {history.map((item, idx) => (
                    <div key={item._id || idx} className="relative group">
                      {/* Timeline Dot */}
                      <div
                        className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full border-2 bg-white transition-colors ${
                          idx === 0
                            ? "border-primary-600 bg-primary-50 ring-4 ring-primary-100"
                            : "border-slate-300"
                        }`}
                      />

                      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-semibold text-slate-900 capitalize">
                            {item.newStatus?.replace(/_/g, " ")}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        {item.updatedBy && (
                          <p className="text-[11px] text-slate-500 mb-1">
                            Action by:{" "}
                            <span className="font-medium text-slate-700 capitalize">
                              {item.updatedBy.name || item.updatedBy.role || "Officer"}
                            </span>{" "}
                            ({item.updatedBy.role || "staff"})
                          </p>
                        )}

                        {item.comments && (
                          <p className="text-slate-600 bg-white p-2 rounded border border-slate-100 mt-1 italic">
                            "{item.comments}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="text-lg font-bold text-slate-900">Upload Supporting Document</h3>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {uploadSuccess ? (
                <div className="py-8 text-center text-emerald-600">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-bold text-slate-900">Document Uploaded Successfully</p>
                  <p className="text-xs text-slate-500 mt-1">Our review officer will verify it shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleUpload} className="space-y-4">
                  {uploadError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                      {uploadError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Document Type
                    </label>
                    <select
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-primary-500"
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
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-primary-500 transition-colors">
                      <input
                        type="file"
                        id="claim-doc-file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setUploadFile(e.target.files[0]);
                            setUploadError("");
                          }
                        }}
                      />
                      <label htmlFor="claim-doc-file" className="cursor-pointer block">
                        <div className="w-8 h-8 text-slate-400 mx-auto mb-1">
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        {uploadFile ? (
                          <div className="text-xs">
                            <span className="font-semibold text-slate-900 block truncate">{uploadFile.name}</span>
                            <span className="text-slate-500">{(uploadFile.size / 1024).toFixed(1)} KB</span>
                          </div>
                        ) : (
                          <div className="text-xs">
                            <span className="font-semibold text-primary-600">Click to browse</span> or drag and drop
                            <p className="text-[11px] text-slate-400 mt-0.5">PDF, PNG, JPG (max 10MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3">
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
                      {uploading ? (
                        <div className="flex items-center gap-2">
                          <LoadingSpinner size="sm" />
                          <span>Uploading...</span>
                        </div>
                      ) : (
                        "Upload Document"
                      )}
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
