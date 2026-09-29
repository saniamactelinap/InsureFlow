import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { getDocuments, uploadDocument } from "../../services/documentService";
import { getClaims } from "../../services/claimService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";

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

export const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Upload Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState("");
  const [docType, setDocType] = useState(DOCUMENT_TYPES[0]);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
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
      setFile(e.dataTransfer.files[0]);
      setUploadError("");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadError("");
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClaimId) {
      setUploadError("Please select an active claim for this document.");
      return;
    }
    if (!file) {
      setUploadError("Please choose a file to upload.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("claim", selectedClaimId);
      formData.append("documentType", docType);

      await uploadDocument(formData);
      setUploadSuccess(true);
      setFile(null);

      // Refresh list
      const docsRes = await getDocuments();
      setDocuments(docsRes.documents || []);

      setTimeout(() => {
        setUploadSuccess(false);
        setShowModal(false);
      }, 1500);
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
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Documents Vault</h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage and track all verification documents, medical records, and survey files uploaded for your claims.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Document
          </Button>
        </div>

        {/* Filters and Search Bar */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by file name, type, or claim number..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {["all", "pending", "verified", "rejected"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                    statusFilter === st
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Content Area */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-slate-500 font-medium">Loading documents...</p>
          </div>
        ) : error ? (
          <Card className="p-8 text-center border-rose-200 bg-rose-50/50">
            <p className="text-sm text-rose-700 font-medium mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchData}>
              Try Again
            </Button>
          </Card>
        ) : filteredDocuments.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {searchQuery || statusFilter !== "all" ? "No matching documents" : "No documents uploaded yet"}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try clearing your search query or adjusting your verification status filter."
                : "Supporting documents uploaded for your claims will appear here."}
            </p>
            {claims.length > 0 && (
              <Button variant="primary" onClick={() => setShowModal(true)}>
                Upload First Document
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc._id} className="p-5 flex flex-col justify-between hover:shadow-card transition-shadow">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 truncate" title={doc.fileName}>
                          {doc.fileName}
                        </h4>
                        <span className="text-xs font-medium text-slate-500 block">{doc.documentType}</span>
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize flex-shrink-0 ${
                        doc.verificationStatus === "verified"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : doc.verificationStatus === "rejected"
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {doc.verificationStatus || "Pending"}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1.5 border border-slate-100 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Associated Claim:</span>
                      {doc.claim ? (
                        <Link
                          to={`/customer/claims/${doc.claim._id || doc.claim}`}
                          className="font-mono font-semibold text-primary-600 hover:underline"
                        >
                          {doc.claim.claimNumber || "View Claim"}
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
                      <div className="pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500 block text-[11px] mb-0.5">Reviewer Remarks:</span>
                        <p className="text-slate-700 italic">"{doc.remarks}"</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  {doc.claim && (
                    <Link
                      to={`/customer/claims/${doc.claim._id || doc.claim}`}
                      className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
                    >
                      View Claim Details →
                    </Link>
                  )}
                  {doc.filePath && (
                    <a
                      href={doc.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-slate-600 hover:text-primary-600 font-medium transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Open File
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="text-lg font-bold text-slate-900">Upload Claim Document</h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  {uploadError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                      {uploadError}
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
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-primary-500 font-mono"
                      >
                        {claims.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.claimNumber} — {c.claimType?.toUpperCase()} ({c.status?.replace(/_/g, " ")})
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
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:border-primary-500"
                    >
                      {DOCUMENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Drag and Drop Box */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Document File <span className="text-rose-500">*</span>
                    </label>
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                        dragActive
                          ? "border-primary-500 bg-primary-50/50"
                          : "border-slate-300 hover:border-primary-400 bg-slate-50/50"
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
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        {file ? (
                          <div className="text-xs">
                            <span className="font-semibold text-slate-900 block truncate">{file.name}</span>
                            <span className="text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                          </div>
                        ) : (
                          <div className="text-xs">
                            <span className="font-semibold text-primary-600">Click to browse</span> or drag and drop
                            <p className="text-[11px] text-slate-400 mt-1">Accepted formats: PDF, PNG, JPG (up to 10MB)</p>
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

export default DocumentsPage;
