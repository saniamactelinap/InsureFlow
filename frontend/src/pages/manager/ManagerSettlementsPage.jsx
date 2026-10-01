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
import StaffLayout from "../../components/layout/StaffLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import PageLoader from "../../components/common/PageLoader";
import settlementService from "../../services/settlementService";
import claimService from "../../services/claimService";

export const ManagerSettlementsPage = () => {
  const [settlements, setSettlements] = useState([]);
  const [approvedClaims, setApprovedClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState("");

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    claim: "",
    settlementAmount: "",
    paymentMethod: "bank_transfer",
    paymentReference: "",
    remarks: "",
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Update Status Modal State
  const [updatingSettlement, setUpdatingSettlement] = useState(null);
  const [updateStatus, setUpdateStatus] = useState("processing");
  const [updateRef, setUpdateRef] = useState("");
  const [updateRemarks, setUpdateRemarks] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  // Close Settlement Modal State
  const [closingSettlement, setClosingSettlement] = useState(null);
  const [closeRemarks, setCloseRemarks] = useState("");
  const [closeLoading, setCloseLoading] = useState(false);

  useEffect(() => {
    fetchSettlementsData();
  }, []);

  const fetchSettlementsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [settleList, allClaims] = await Promise.all([
        settlementService.getSettlements(),
        claimService.getClaims(),
      ]);
      setSettlements(settleList || []);

      // Filter claims eligible for settlement (approved claims)
      const approved = (allClaims || []).filter((c) => c.status === "approved");
      setApprovedClaims(approved);
      if (approved.length > 0 && !createData.claim) {
        setCreateData((prev) => ({
          ...prev,
          claim: approved[0]._id,
          settlementAmount: approved[0].claimedAmount || "",
        }));
      }
    } catch (err) {
      console.error("Failed to load settlements:", err);
      setError("Unable to load settlement records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await settlementService.createSettlement({
        claim: createData.claim,
        settlementAmount: Number(createData.settlementAmount),
        paymentMethod: createData.paymentMethod,
        paymentReference: createData.paymentReference.trim() || undefined,
        remarks: createData.remarks.trim() || undefined,
      });
      setActionSuccess("Settlement transaction created successfully.");
      setShowCreateModal(false);
      fetchSettlementsData();
    } catch (err) {
      console.error("Create settlement failed:", err);
      alert(err.response?.data?.message || "Failed to create settlement.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!updatingSettlement) return;
    setUpdateLoading(true);
    try {
      await settlementService.updateSettlementStatus(updatingSettlement._id, {
        status: updateStatus,
        paymentReference: updateRef.trim() || undefined,
        remarks: updateRemarks.trim() || undefined,
      });
      setActionSuccess(`Settlement marked as ${updateStatus}.`);
      setUpdatingSettlement(null);
      fetchSettlementsData();
    } catch (err) {
      console.error("Update settlement status failed:", err);
      alert(err.response?.data?.message || "Failed to update settlement status.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCloseSubmit = async (e) => {
    e.preventDefault();
    if (!closingSettlement) return;
    setCloseLoading(true);
    try {
      await settlementService.closeSettlement(closingSettlement._id, {
        remarks: closeRemarks.trim() || "Claim finalized and closed after settlement verification by Management.",
      });
      setActionSuccess("Claim closed and finalized successfully.");
      setClosingSettlement(null);
      fetchSettlementsData();
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

  if (loading) {
    return (
      <StaffLayout pageTitle="Settlement & Financial Closure">
        <PageLoader message="Loading financial disbursement records..." />
      </StaffLayout>
    );
  }

  return (
    <StaffLayout pageTitle="Settlement Governance &amp; Closure">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settlement Portfolio &amp; Closure</h1>
            <p className="text-sm text-slate-500 mt-1">
              Executive oversight of disbursement transactions, payment verification, and final case closure.
            </p>
          </div>
          {approvedClaims.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={() => setShowCreateModal(true)}
            >
              Initiate Settlement
            </Button>
          )}
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

        {/* Settlements Table */}
        {settlements.length === 0 ? (
          <Card className="p-12 text-center bg-slate-50/50">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No settlement records</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Approved claims awaiting financial disbursement will appear here.
            </p>
            {approvedClaims.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowCreateModal(true)}
              >
                Initiate First Settlement
              </Button>
            )}
          </Card>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Claim #</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Settlement Amount</th>
                    <th className="py-3.5 px-4">Method</th>
                    <th className="py-3.5 px-4">Reference</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Manager Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {settlements.map((s) => {
                    const isCompleted = s.status === "completed" || s.paymentStatus === "completed";
                    const isClaimClosed = s.claim?.status === "closed";

                    return (
                      <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          #{s.claim?.claimNumber || s.claim || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-medium">
                          {s.claim?.customer?.name || "Customer"}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {formatCurrency(s.settlementAmount)}
                        </td>
                        <td className="py-3 px-4 uppercase text-slate-600 font-semibold">
                          {s.paymentMethod || "bank_transfer"}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
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
                        <td className="py-3 px-4 text-slate-500">
                          {formatDate(s.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Update Status (if not completed) */}
                            {!isCompleted && (
                              <button
                                type="button"
                                onClick={() => {
                                  setUpdatingSettlement(s);
                                  setUpdateStatus(s.status === "initiated" ? "processing" : "completed");
                                  setUpdateRef(s.paymentReference || "");
                                }}
                                className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
                              >
                                Update Status
                              </button>
                            )}

                            {/* Close Settlement (if completed & claim not closed) */}
                            {isCompleted && !isClaimClosed && (
                              <button
                                type="button"
                                onClick={() => {
                                  setClosingSettlement(s);
                                  setCloseRemarks("");
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded bg-purple-600 hover:bg-purple-700 text-white shadow-xs inline-flex items-center gap-1"
                              >
                                <Lock className="w-3 h-3" />
                                <span>Close Claim</span>
                              </button>
                            )}

                            {isClaimClosed && (
                              <span className="inline-flex items-center gap-1 text-slate-400 font-semibold text-[11px]">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Claim Closed</span>
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

        {/* Modal: Create Settlement */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Initiate Claim Settlement</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700 text-lg font-bold">
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Approved Claim</label>
                  <select
                    value={createData.claim}
                    onChange={(e) => {
                      const cId = e.target.value;
                      const selected = approvedClaims.find((c) => c._id === cId);
                      setCreateData({
                        ...createData,
                        claim: cId,
                        settlementAmount: selected?.claimedAmount || "",
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    {approvedClaims.map((c) => (
                      <option key={c._id} value={c._id}>
                        #{c.claimNumber} &ndash; {c.customer?.name} ({formatCurrency(c.claimedAmount)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Settlement Amount (INR)</label>
                  <input
                    type="number"
                    value={createData.settlementAmount}
                    onChange={(e) => setCreateData({ ...createData, settlementAmount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-bold text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={createData.paymentMethod}
                    onChange={(e) => setCreateData({ ...createData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white uppercase font-medium"
                  >
                    <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="cheque">Cheque</option>
                    <option value="upi">UPI / Direct Debit</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Payment Reference / UTR</label>
                  <input
                    type="text"
                    placeholder="e.g. UTR-982341029"
                    value={createData.paymentReference}
                    onChange={(e) => setCreateData({ ...createData, paymentReference: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Remarks</label>
                  <textarea
                    rows={2}
                    placeholder="Disbursement details..."
                    value={createData.remarks}
                    onChange={(e) => setCreateData({ ...createData, remarks: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" loading={createLoading}>
                    Confirm Settlement
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Update Settlement Status */}
        {updatingSettlement && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Update Settlement Status</h3>
                <button onClick={() => setUpdatingSettlement(null)} className="text-slate-400 hover:text-slate-700 text-lg font-bold">
                  &times;
                </button>
              </div>

              <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">New Status</label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white uppercase font-bold"
                  >
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Payment Reference / UTR</label>
                  <input
                    type="text"
                    placeholder="e.g. UTR-982341029"
                    value={updateRef}
                    onChange={(e) => setUpdateRef(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">Remarks</label>
                  <textarea
                    rows={2}
                    placeholder="Status update remarks..."
                    value={updateRemarks}
                    onChange={(e) => setUpdateRemarks(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setUpdatingSettlement(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" loading={updateLoading}>
                    Save Status
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Close Completed Settlement */}
        {closingSettlement && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-bold text-slate-900">Close &amp; Finalize Claim</h3>
                </div>
                <button onClick={() => setClosingSettlement(null)} className="text-slate-400 hover:text-slate-700 text-lg font-bold">
                  &times;
                </button>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs space-y-1">
                <span className="font-bold">Managerial Case Closure Confirmation:</span>
                <p>
                  You are about to permanently mark claim #{closingSettlement.claim?.claimNumber || "N/A"} as <strong>CLOSED</strong>.
                  Disbursed settlement: <strong>{formatCurrency(closingSettlement.settlementAmount)}</strong>.
                </p>
              </div>

              <form onSubmit={handleCloseSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">
                    Final Case Closure Remarks
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide mandatory audit closure rationale..."
                    value={closeRemarks}
                    onChange={(e) => setCloseRemarks(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setClosingSettlement(null)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    loading={closeLoading}
                  >
                    Confirm Final Closure
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

export default ManagerSettlementsPage;
