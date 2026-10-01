import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FolderOpen,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  FileText,
  Filter,
} from "lucide-react";
import StaffLayout from "../../components/layout/StaffLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import PageLoader from "../../components/common/PageLoader";
import documentService from "../../services/documentService";

export const OfficerDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [verifyingDoc, setVerifyingDoc] = useState(null);
  const [verifyingStatus, setVerifyingStatus] = useState("verified");
  const [verifyRemarks, setVerifyRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentService.getDocuments();
      setDocuments(data || []);
    } catch (err) {
      console.error("Failed to load documents:", err);
      setError("Unable to load evidence documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifyingDoc) return;
    setActionLoading(true);
    try {
      await documentService.verifyDocument(verifyingDoc._id, {
        verificationStatus: verifyingStatus,
        remarks: verifyRemarks.trim(),
      });
      setActionSuccess(`Document marked as ${verifyingStatus} successfully.`);
      setVerifyingDoc(null);
      setVerifyRemarks("");
      fetchDocuments();
    } catch (err) {
      console.error("Document action failed:", err);
      alert(err.response?.data?.message || "Failed to update document status.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      (doc.filename || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.documentType || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.claim?.claimNumber || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || (doc.verificationStatus || "pending") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <StaffLayout pageTitle="Document Verification Queue">
        <PageLoader message="Fetching submitted claims documentation..." />
      </StaffLayout>
    );
  }

  const pendingCount = documents.filter((d) => (d.verificationStatus || "pending") === "pending").length;
  const verifiedCount = documents.filter((d) => d.verificationStatus === "verified").length;
  const rejectedCount = documents.filter((d) => d.verificationStatus === "rejected").length;

  return (
    <StaffLayout pageTitle="Document Verification Queue">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Document Verification Center</h1>
            <p className="text-sm text-slate-500 mt-1">
              Verify proof of identity, damage assessment invoices, and medical certificates submitted by policyholders.
            </p>
          </div>
          <div className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
            <span>Enforced upload limit:</span>{" "}
            <span className="font-semibold text-slate-900">5 MB per document</span>
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

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setStatusFilter("pending")}
            className={`p-4 rounded-xl text-left border transition-all ${
              statusFilter === "pending"
                ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
              Pending Verification
            </span>
            <span className="text-2xl font-extrabold text-amber-600">{pendingCount}</span>
          </button>

          <button
            onClick={() => setStatusFilter("verified")}
            className={`p-4 rounded-xl text-left border transition-all ${
              statusFilter === "verified"
                ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
              Verified &amp; Approved
            </span>
            <span className="text-2xl font-extrabold text-emerald-600">{verifiedCount}</span>
          </button>

          <button
            onClick={() => setStatusFilter("rejected")}
            className={`p-4 rounded-xl text-left border transition-all ${
              statusFilter === "rejected"
                ? "bg-rose-50/70 border-rose-300 ring-2 ring-rose-400"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 block mb-1">
              Rejected Documentation
            </span>
            <span className="text-2xl font-extrabold text-rose-600">{rejectedCount}</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by file name, document type, or claim #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-600 bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === "all" ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600"
              }`}
            >
              All Files ({documents.length})
            </button>
          </div>
        </div>

        {/* Document Master Table */}
        {filteredDocuments.length === 0 ? (
          <Card className="p-12 text-center bg-slate-50/50">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No documents found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              There are no documents matching your selected filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            >
              Reset Filters
            </Button>
          </Card>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Document Type</th>
                  <th className="py-3 px-4">Claim #</th>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Uploaded Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Remarks</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDocuments.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 capitalize">
                      {doc.documentType}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {doc.claim?._id || doc.claim ? (
                        <Link
                          to={`/officer/claims/${doc.claim?._id || doc.claim}`}
                          className="font-bold text-primary-600 hover:underline"
                        >
                          #{doc.claim?.claimNumber || doc.claim}
                        </Link>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 truncate max-w-[200px]">
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
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(doc.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4 text-slate-600 italic truncate max-w-[150px]">
                      {doc.remarks || "—"}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setVerifyingDoc(doc);
                          setVerifyingStatus("verified");
                          setVerifyRemarks(doc.remarks || "Verified against active claim submission.");
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
                          setVerifyRemarks(doc.remarks || "Invalid or unreadable document.");
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

        {/* Verification Modal */}
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
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Document Reference</span>
                <span className="font-bold text-slate-900 block">{verifyingDoc.documentType}</span>
                <span className="text-slate-500 font-mono text-[11px]">{verifyingDoc.filename}</span>
              </div>

              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Officer Verification Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={verifyRemarks}
                    onChange={(e) => setVerifyRemarks(e.target.value)}
                    placeholder="Enter reason or note for verification record..."
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
                    disabled={actionLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant={verifyingStatus === "verified" ? "primary" : "outline"}
                    size="sm"
                    loading={actionLoading}
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

export default OfficerDocumentsPage;
