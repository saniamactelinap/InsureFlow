import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { getDocuments, uploadDocument } from "../../services/documentService";
import { getClaims } from "../../services/claimService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  FolderOpen,
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  PlusCircle,
  ExternalLink,
  AlertCircle,
  FileCheck,
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

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB maximum as enforced by backend

export const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Upload Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState("");
  const [docType, setDocType] = useState(DOCUMENT_TYPES[0]);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [docsRes, claimsRes] = await Promise.all([
        getDocuments(),
        getClaims(),
      ]);
      setDocuments(docsRes.documents || []);
      const loadedClaims = claimsRes.claims || [];
      setClaims(loadedClaims);
      if (loadedClaims.length > 0 && !selectedClaimId) {
        setSelectedClaimId(loadedClaims[0]._id);
      }
    } catch (err) {
      console.error("Failed to load documents", err);
      setError("Unable to load documents. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selected) => {
    setUploadError("");
    if (selected.size > MAX_FILE_SIZE_BYTES) {
      setUploadError("File exceeds the maximum allowed size of 5 MB. Please choose a smaller file.");
      setFile(null);
      return;
    }
    const validExtensions = [".pdf", ".jpg", ".jpeg", ".png"];
    const fileExt = selected.name.substring(selected.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(fileExt)) {
      setUploadError("Invalid file type. Supported formats: PDF, PNG, JPG, JPEG.");
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClaimId) {
      setUploadError("Please select a registered claim for this document.");
      return;
    }
    if (!file) {
      setUploadError("Please select a file to upload.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError("Maximum file size: 5 MB. Please reduce file size.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      setUploadProgress(25);

      const progressTimer = setInterval(() => {
        setUploadProgress((p) => (p < 85 ? p + 20 : p));
      }, 150);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("claim", selectedClaimId);
      formData.append("documentType", docType);

      await uploadDocument(formData);
      clearInterval(progressTimer);
      setUploadProgress(100);
      setUploadSuccess(true);
      setFile(null);

      // Refresh list
      const docsRes = await getDocuments();
      setDocuments(docsRes.documents || []);

      setTimeout(() => {
        setUploadSuccess(false);
        setUploadProgress(0);
        setShowModal(false);
      }, 1400);
    } catch (err) {
      console.error("Upload error", err);
      setUploadError(
        err.response?.data?.message || "Failed to upload document. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  // Filtered documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesStatus =
      statusFilter === "all" || doc.verificationStatus === statusFilter;
    const q = searchQuery.toLowerCase();
    const claimNum = doc.claim?.claimNumber?.toLowerCase() || "";
    const name = doc.fileName?.toLowerCase() || "";
    const type = doc.documentType?.toLowerCase() || "";
    const matchesSearch =
      !searchQuery ||
      name.includes(q) ||
      type.includes(q) ||
      claimNum.includes(q);

    return matchesStatus && matchesSearch;
  });

  return (
    <AppLayout pageTitle="Documents Vault">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Documents Vault</h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Securely manage medical bills, damage estimates, and identity records uploaded for your claims.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
            leftIcon={<UploadCloud className="w-4 h-4" />}
            className="self-start sm:self-auto shadow-sm"
          >
            Upload Document
          </Button>
        </div>

        {/* Filters and Search Bar */}
        <Card className="p-4 border border-slate-200/90">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by file name, document type, or claim reference..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "All" },
                { id: "pending", label: "Pending" },
                { id: "verified", label: "Verified" },
                { id: "rejected", label: "Rejected" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
                    statusFilter === st.id
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Content Area */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-slate-500 font-medium">Loading documents dossier...</p>
          </div>
        ) : error ? (
          <Card className="p-8 text-center border-rose-200 bg-rose-50/50">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
            <p className="text-sm text-rose-700 font-medium mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchData}>
              Try Again
            </Button>
          </Card>
        ) : filteredDocuments.length === 0 ? (
          <Card className="p-12 text-center border border-slate-200/90">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <FolderOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {searchQuery || statusFilter !== "all" ? "No matching documents found" : "No documents uploaded yet"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
              {searchQuery || statusFilter !== "all"
                ? "Try clearing your search terms or adjusting the verification status filter."
                : "Supporting evidence and invoices uploaded for your claims will be cataloged here."}
            </p>
            {claims.length > 0 && (
              <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
                Upload First Document
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => {
              const isVerified = doc.verificationStatus === "verified";
              const isRejected = doc.verificationStatus === "rejected";

              return (
                <Card
                  key={doc._id}
                  className="p-5 flex flex-col justify-between hover:border-slate-300 transition-colors border border-slate-200/90 shadow-none"
                >
                  <div>
                    {/* Top Row: Icon + Type + Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-slate-700" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate" title={doc.fileName}>
                            {doc.fileName}
                          </h4>
                          <span className="text-[11px] font-medium text-slate-500 block">
                            {doc.documentType}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold capitalize shrink-0 ${
                          isVerified
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : isRejected
                            ? "bg-rose-50 text-rose-800 border border-rose-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {doc.verificationStatus || "Pending"}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1.5 border border-slate-100 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Claim Dossier:</span>
                        {doc.claim ? (
                          <Link
                            to={`/customer/claims/${doc.claim._id || doc.claim}`}
                            className="font-mono font-semibold text-primary-700 hover:underline"
                          >
                            #{doc.claim.claimNumber || "View Claim"}
                          </Link>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Uploaded On:</span>
                        <span className="text-slate-700 font-medium">
                          {new Date(doc.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {doc.remarks && (
                        <div className="pt-1.5 border-t border-slate-200/60">
                          <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">
                            Reviewer Remarks:
                          </span>
                          <p className="text-slate-700 italic mt-0.5">"{doc.remarks}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    {doc.claim && (
                      <Link
                        to={`/customer/claims/${doc.claim._id || doc.claim}`}
                        className="text-primary-700 hover:text-primary-800 font-semibold hover:underline"
                      >
                        Claim Case File &rarr;
                      </Link>
                    )}
                    {doc.filePath && (
                      <a
                        href={doc.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                      >
                        <span>Open Document</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* ================= UPLOAD MODAL WITH REAL PROGRESS & 5MB GUIDANCE ================= */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Upload Claim Document</h3>
                    <p className="text-xs text-slate-500">Official evidence and verification documentation</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
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
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  {uploadError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Select Claim */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Target Claim <span className="text-rose-500">*</span>
                    </label>
                    {claims.length === 0 ? (
                      <p className="text-xs text-amber-600">
                        You have no registered claims to upload documents for.
                      </p>
                    ) : (
                      <select
                        value={selectedClaimId}
                        onChange={(e) => setSelectedClaimId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-primary-500 font-mono bg-white"
                      >
                        {claims.map((c) => (
                          <option key={c._id} value={c._id}>
                            #{c.claimNumber} &mdash; {c.claimType?.toUpperCase()} ({c.status?.replace(/_/g, " ")})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Document Type */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Document Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-primary-500 bg-white"
                    >
                      {DOCUMENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Drag and Drop Zone */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Document File <span className="text-rose-500">*</span>
                    </label>
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                        dragActive
                          ? "border-primary-500 bg-primary-50/40"
                          : "border-slate-300 hover:border-slate-400 bg-slate-50/50"
                      }`}
                    >
                      <input
                        type="file"
                        id="document-upload-file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="document-upload-file" className="cursor-pointer block">
                        <div className="w-10 h-10 text-slate-400 mx-auto mb-2">
                          <UploadCloud className="w-8 h-8 mx-auto text-slate-400" />
                        </div>
                        {file ? (
                          <div className="text-xs">
                            <span className="font-bold text-slate-900 block truncate">{file.name}</span>
                            <span className="text-slate-500 font-mono">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs space-y-1">
                            <span className="font-semibold text-primary-700">Click to browse</span> or drag and drop
                            <p className="text-[11px] text-slate-500">
                              Supported formats: PDF, PNG, JPG, JPEG
                            </p>
                            <p className="text-[11px] font-semibold text-slate-700">
                              Maximum file size: 5 MB
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Progress bar during upload */}
                  {uploading && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Uploading file...</span>
                        <span className="font-mono">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-primary-600 h-1.5 rounded-full transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowModal(false)}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={uploading || !file || !selectedClaimId}
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

export default DocumentsPage;
