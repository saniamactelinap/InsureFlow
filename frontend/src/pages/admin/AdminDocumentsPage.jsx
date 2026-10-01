import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FolderOpen,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  ArrowRight,
  FileText,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import PageLoader from "../../components/common/PageLoader";
import documentService from "../../services/documentService";

export const AdminDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [actionSuccess, setActionSuccess] = useState("");

  // Verification Modal
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState("verified");
  const [verifyRemarks, setVerifyRemarks] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentService.getDocuments();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load documents:", err);
      setError("Unable to load document oversight repository.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoc) return;
    setVerifyLoading(true);
    try {
      await documentService.verifyDocument(selectedDoc._id, {
        status: verifyStatus,
        remarks: verifyRemarks.trim() || undefined,
      });
      setActionSuccess(`Document marked as ${verifyStatus}.`);
      setSelectedDoc(null);
      fetchDocuments();
    } catch (err) {
      console.error("Verify document error:", err);
      alert(err.response?.data?.message || "Failed to update document verification status.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filteredDocs = documents.filter((doc) => {
    const term = searchTerm.toLowerCase();
    const docName = (doc.originalName || doc.fileName || "").toLowerCase();
    const claimNumber = (doc.claim?.claimNumber || "").toLowerCase();
    const docType = (doc.documentType || "").toLowerCase();

    const matchesSearch =
      docName.includes(term) || claimNumber.includes(term) || docType.includes(term);

    const matchesStatus =
      statusTab === "all" || doc.verificationStatus === statusTab;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = documents.filter((d) => d.verificationStatus === "pending").length;
  const verifiedCount = documents.filter((d) => d.verificationStatus === "verified").length;
  const rejectedCount = documents.filter((d) => d.verificationStatus === "rejected").length;

  if (loading) {
    return (
      <AdminLayout pageTitle="Document Oversight">
        <PageLoader message="Loading document audit repository..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Document Oversight &amp; Audit">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Evidentiary Document Oversight</h1>
            <p className="text-sm text-slate-500 mt-1">
              Centralized inspection of medical, repair, and incident documents across claims.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
            Total Documents: {documents.length}
          </span>
        </div>

        {actionSuccess && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess("")} className="text-emerald-700 hover:text-emerald-900 font-bold">
              &times;
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchDocuments}>
              Retry
            </Button>
          </div>
        )}

        {/* Status Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 border-b sm:border-b-0 border-slate-200 pb-2 sm:pb-0">
            <button
              onClick={() => setStatusTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusTab === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              All ({documents.length})
            </button>
            <button
              onClick={() => setStatusTab("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusTab === "pending" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusTab("verified")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusTab === "verified" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Verified ({verifiedCount})
            </button>
            <button
              onClick={() => setStatusTab("rejected")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusTab === "rejected" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Rejected ({rejectedCount})
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by file name or claim #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-600 bg-white"
            />
          </div>
        </div>

        {/* Document Grid / Table */}
        {filteredDocs.length === 0 ? (
          <Card className="p-12 text-center bg-slate-50/50">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No documents found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Documents submitted by policyholders will appear here for verification and audit.
            </p>
          </Card>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Document Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Associated Claim</th>
                    <th className="py-3 px-4">Verification Status</th>
                    <th className="py-3 px-4">Remarks</th>
                    <th className="py-3 px-4">Uploaded Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredDocs.map((doc) => (
                    <tr key={doc._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-900 truncate max-w-xs">
                            {doc.originalName || doc.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 uppercase font-semibold text-slate-600 text-[11px]">
                        {doc.documentType}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {doc.claim?.claimNumber ? (
                          <Link
                            to={`/admin/claims/${doc.claim._id || doc.claim}`}
                            className="text-rose-600 hover:text-rose-800"
                          >
                            #{doc.claim.claimNumber}
                          </Link>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                            doc.verificationStatus === "verified"
                              ? "bg-emerald-100 text-emerald-800"
                              : doc.verificationStatus === "rejected"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {doc.verificationStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate">
                        {doc.verificationRemarks || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {formatDate(doc.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {doc.filePath && (
                            <a
                              href={`http://localhost:5000/${doc.filePath}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-800 inline-flex items-center gap-1"
                              title="Inspect File"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDoc(doc);
                              setVerifyStatus(
                                doc.verificationStatus === "pending" ? "verified" : doc.verificationStatus
                              );
                              setVerifyRemarks(doc.verificationRemarks || "");
                            }}
                            className="px-2 py-1 text-xs font-semibold rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                          >
                            Audit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Audit / Verify Document */}
        {selectedDoc && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Document Verification Audit</h3>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="text-slate-400 hover:text-slate-700 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <span className="text-slate-500 font-medium">Document:</span>
                <p className="font-bold text-slate-900 truncate">{selectedDoc.originalName || selectedDoc.fileName}</p>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">
                  Type: {selectedDoc.documentType}
                </span>
              </div>

              <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">
                    Audit Decision
                  </label>
                  <select
                    value={verifyStatus}
                    onChange={(e) => setVerifyStatus(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white uppercase font-bold"
                  >
                    <option value="verified">Verified (Approved)</option>
                    <option value="rejected">Rejected (Insufficient / Invalid)</option>
                    <option value="pending">Mark as Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">
                    Auditor Remarks
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide rationale for verification audit..."
                    value={verifyRemarks}
                    onChange={(e) => setVerifyRemarks(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDoc(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="bg-rose-600 hover:bg-rose-700 text-white"
                    loading={verifyLoading}
                  >
                    Save Verification
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDocumentsPage;
