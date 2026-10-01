import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  IndianRupee,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  PlusCircle,
  CreditCard,
  Lock,
  ShieldCheck,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import PageLoader from "../../components/common/PageLoader";
import settlementService from "../../services/settlementService";
import claimService from "../../services/claimService";

export const AdminSettlementsPage = () => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Close Settlement Modal
  const [closingSettlement, setClosingSettlement] = useState(null);
  const [closeRemarks, setCloseRemarks] = useState("");
  const [closeLoading, setCloseLoading] = useState(false);

  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await settlementService.getSettlements();
      setSettlements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load settlements:", err);
      setError("Unable to load enterprise disbursement portfolio.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSubmit = async (e) => {
    e.preventDefault();
    if (!closingSettlement) return;
    setCloseLoading(true);
    try {
      await settlementService.closeSettlement(closingSettlement._id, {
        remarks: closeRemarks.trim() || "Claim audited and permanently closed by System Administrator.",
      });
      setActionSuccess("Claim marked as closed and finalized successfully.");
      setClosingSettlement(null);
      fetchSettlements();
    } catch (err) {
      console.error("Close settlement failed:", err);
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
    });
  };

  const filteredSettlements = settlements.filter((s) => {
    const term = searchTerm.toLowerCase();
    const claimNum = (s.claim?.claimNumber || "").toLowerCase();
    const custName = (s.claim?.customer?.name || "").toLowerCase();
    const ref = (s.paymentReference || "").toLowerCase();

    const matchesSearch =
      claimNum.includes(term) || custName.includes(term) || ref.includes(term);

    const matchesStatus =
      statusFilter === "all" || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <AdminLayout pageTitle="Disbursement Governance">
        <PageLoader message="Loading financial disbursement records..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Financial Settlements Monitoring">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settlement &amp; Payout Governance</h1>
            <p className="text-sm text-slate-500 mt-1">
              Complete administrative ledger of claim payouts, bank references, and final case terminations.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
            Total Payouts: {settlements.length}
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
            <Button variant="outline" size="sm" onClick={fetchSettlements}>
              Retry
            </Button>
          </div>
        )}

        {/* Filter Controls */}
        <Card className="p-4 bg-white">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by claim #, customer name, reference UTR..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-600 bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-rose-600 uppercase font-semibold text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="initiated">Initiated</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </Card>

        {/* Settlements Table */}
        {filteredSettlements.length === 0 ? (
          <Card className="p-12 text-center bg-slate-50/50">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No settlement records found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Disbursements initiated for approved claims will be recorded here.
            </p>
          </Card>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Claim #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Disbursed Amount</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Payment Reference</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Processed By</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredSettlements.map((s) => {
                    const isCompleted = s.status === "completed" || s.paymentStatus === "completed";
                    const isClaimClosed = s.claim?.status === "closed";

                    return (
                      <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          #{s.claim?.claimNumber || s.claim || "N/A"}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {s.claim?.customer?.name || "Customer"}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {formatCurrency(s.settlementAmount)}
                        </td>
                        <td className="py-3 px-4 uppercase text-slate-600 font-semibold">
                          {s.paymentMethod || "bank_transfer"}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {s.paymentReference || "—"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                              s.status === "completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : s.status === "processing"
                                ? "bg-blue-100 text-blue-800"
                                : s.status === "failed"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {s.processedBy?.name || "Officer"}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono">
                          {formatDate(s.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isCompleted && !isClaimClosed && (
                              <button
                                type="button"
                                onClick={() => {
                                  setClosingSettlement(s);
                                  setCloseRemarks("");
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-600 hover:bg-rose-700 text-white shadow-2xs inline-flex items-center gap-1"
                              >
                                <Lock className="w-3 h-3" />
                                <span>Close Claim</span>
                              </button>
                            )}

                            {isClaimClosed && (
                              <span className="inline-flex items-center gap-1 text-slate-400 font-semibold text-[11px]">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Finalized</span>
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Close Completed Settlement */}
        {closingSettlement && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Administrative Case Finalization</h3>
                  <span className="text-xs text-slate-500">Permanently close completed claim.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                <span className="font-bold">Confirmation Required:</span>
                <p>
                  You are about to mark claim #{closingSettlement.claim?.claimNumber || "N/A"} as <strong>CLOSED</strong>.
                  Disbursed payout: <strong>{formatCurrency(closingSettlement.settlementAmount)}</strong>.
                </p>
              </div>

              <form onSubmit={handleCloseSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">
                    Audit Closure Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter audit remarks for case closure..."
                    value={closeRemarks}
                    onChange={(e) => setCloseRemarks(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-600"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setClosingSettlement(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="bg-rose-600 hover:bg-rose-700 text-white"
                    loading={closeLoading}
                  >
                    Confirm Permanent Closure
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

export default AdminSettlementsPage;
