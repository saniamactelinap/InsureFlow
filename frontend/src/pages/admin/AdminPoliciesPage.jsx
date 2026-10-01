import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Filter,
  PlusCircle,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  IndianRupee,
  Calendar,
  User,
  Shield,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import PageLoader from "../../components/common/PageLoader";
import policyService from "../../services/policyService";
import userService from "../../services/userService";

export const AdminPoliciesPage = () => {
  const [policies, setPolicies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    policyNumber: "",
    customer: "",
    policyType: "health",
    premiumAmount: "",
    coverageAmount: "",
    startDate: "",
    endDate: "",
    status: "active",
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Modal
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [editData, setEditData] = useState({
    policyType: "health",
    premiumAmount: "",
    coverageAmount: "",
    startDate: "",
    endDate: "",
    status: "active",
  });
  const [editLoading, setEditLoading] = useState(false);

  // Delete Modal
  const [deletingPolicy, setDeletingPolicy] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [policiesRes, usersRes] = await Promise.all([
        policyService.getPolicies(),
        userService.getUsers().catch(() => []),
      ]);
      setPolicies(Array.isArray(policiesRes) ? policiesRes : []);

      // Filter customers for policy assignment
      const allUsers = Array.isArray(usersRes) ? usersRes : usersRes?.users || [];
      const customerUsers = allUsers.filter((u) => u.role === "customer");
      setCustomers(customerUsers);

      if (customerUsers.length > 0 && !createData.customer) {
        setCreateData((prev) => ({ ...prev, customer: customerUsers[0]._id }));
      }
    } catch (err) {
      console.error("Failed to load policy data:", err);
      setError("Unable to load enterprise policy records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await policyService.createPolicy({
        ...createData,
        premiumAmount: Number(createData.premiumAmount),
        coverageAmount: Number(createData.coverageAmount),
      });
      setActionSuccess(`Policy #${createData.policyNumber} created successfully.`);
      setShowCreateModal(false);
      setCreateData({
        policyNumber: "",
        customer: customers[0]?._id || "",
        policyType: "health",
        premiumAmount: "",
        coverageAmount: "",
        startDate: "",
        endDate: "",
        status: "active",
      });
      loadData();
    } catch (err) {
      console.error("Create policy failed:", err);
      alert(err.response?.data?.message || "Failed to create policy. Please check inputs.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditOpen = (p) => {
    setEditingPolicy(p);
    setEditData({
      policyType: p.policyType,
      premiumAmount: p.premiumAmount,
      coverageAmount: p.coverageAmount,
      startDate: p.startDate ? p.startDate.split("T")[0] : "",
      endDate: p.endDate ? p.endDate.split("T")[0] : "",
      status: p.status,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingPolicy) return;
    setEditLoading(true);
    try {
      await policyService.updatePolicy(editingPolicy._id, {
        ...editData,
        premiumAmount: Number(editData.premiumAmount),
        coverageAmount: Number(editData.coverageAmount),
      });
      setActionSuccess(`Policy #${editingPolicy.policyNumber} updated successfully.`);
      setEditingPolicy(null);
      loadData();
    } catch (err) {
      console.error("Edit policy failed:", err);
      alert(err.response?.data?.message || "Failed to update policy.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingPolicy) return;
    setDeleteLoading(true);
    try {
      await policyService.deletePolicy(deletingPolicy._id);
      setActionSuccess(`Policy #${deletingPolicy.policyNumber} deleted successfully.`);
      setDeletingPolicy(null);
      loadData();
    } catch (err) {
      console.error("Delete policy failed:", err);
      alert(err.response?.data?.message || "Failed to delete policy.");
    } finally {
      setDeleteLoading(false);
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

  const filteredPolicies = policies.filter((p) => {
    const term = searchTerm.toLowerCase();
    const policyNumber = (p.policyNumber || "").toLowerCase();
    const customerName = (p.customer?.name || "").toLowerCase();
    const customerEmail = (p.customer?.email || "").toLowerCase();

    const matchesSearch =
      policyNumber.includes(term) ||
      customerName.includes(term) ||
      customerEmail.includes(term);

    const matchesType = typeFilter === "all" || p.policyType === typeFilter;
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <AdminLayout pageTitle="Policy Products &amp; Registry">
        <PageLoader message="Loading enterprise policy portfolio..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Enterprise Policy Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Policy Management &amp; Products</h1>
            <p className="text-sm text-slate-500 mt-1">
              Issue new coverage contracts, adjust terms, and govern enterprise policy portfolios.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="bg-rose-600 hover:bg-rose-700 text-white"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            Issue New Policy
          </Button>
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

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={loadData}>
              Retry
            </Button>
          </div>
        )}

        {/* Search & Filters */}
        <Card className="p-4 bg-white">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search policy #, customer name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-600 bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full md:w-auto px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-rose-600 font-medium"
              >
                <option value="all">All Types</option>
                <option value="health">Health</option>
                <option value="motor">Motor</option>
                <option value="life">Life</option>
                <option value="home">Home</option>
                <option value="travel">Travel</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-auto px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-rose-600 uppercase font-semibold"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Policy Table */}
        {filteredPolicies.length === 0 ? (
          <Card className="p-12 text-center bg-slate-50/50">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No policies found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Create an enterprise policy contract or adjust search filters.
            </p>
            <Button
              variant="primary"
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => setShowCreateModal(true)}
            >
              Issue Policy Now
            </Button>
          </Card>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Policy #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Premium</th>
                    <th className="py-3 px-4">Coverage</th>
                    <th className="py-3 px-4">Term Validity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredPolicies.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {p.policyNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        <div>
                          <span>{p.customer?.name || "Customer"}</span>
                          <span className="block text-[11px] text-slate-400 font-mono">{p.customer?.email}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 capitalize font-semibold text-slate-700">
                        {p.policyType}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(p.premiumAmount)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(p.coverageAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {formatDate(p.startDate)} &ndash; {formatDate(p.endDate)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                            p.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : p.status === "expired"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditOpen(p)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Edit Policy"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingPolicy(p)}
                            className="p-1.5 rounded-lg text-rose-600 hover:text-rose-900 hover:bg-rose-50 transition-colors"
                            title="Delete Policy"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Modal: Create Policy */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Issue New Policy Contract</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-700 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold uppercase text-slate-700 mb-1">
                      Policy Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. POL-2026-908"
                      value={createData.policyNumber}
                      onChange={(e) => setCreateData({ ...createData, policyNumber: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-slate-700 mb-1">
                      Policyholder / Customer
                    </label>
                    <select
                      value={createData.customer}
                      onChange={(e) => setCreateData({ ...createData, customer: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white font-medium"
                      required
                    >
                      {customers.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} ({c.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold uppercase text-slate-700 mb-1">
                      Policy Type
                    </label>
                    <select
                      value={createData.policyType}
                      onChange={(e) => setCreateData({ ...createData, policyType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white capitalize font-semibold"
                    >
                      <option value="health">Health</option>
                      <option value="motor">Motor</option>
                      <option value="life">Life</option>
                      <option value="home">Home</option>
                      <option value="travel">Travel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-slate-700 mb-1">
                      Premium (INR)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 15000"
                      value={createData.premiumAmount}
                      onChange={(e) => setCreateData({ ...createData, premiumAmount: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-slate-700 mb-1">
                      Coverage (INR)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 500000"
                      value={createData.coverageAmount}
                      onChange={(e) => setCreateData({ ...createData, coverageAmount: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold uppercase text-slate-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={createData.startDate}
                      onChange={(e) => setCreateData({ ...createData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-slate-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={createData.endDate}
                      onChange={(e) => setCreateData({ ...createData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={createData.status}
                    onChange={(e) => setCreateData({ ...createData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white uppercase font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="bg-rose-600 hover:bg-rose-700 text-white"
                    loading={createLoading}
                  >
                    Create Policy
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Policy */}
        {editingPolicy && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Modify Policy #{editingPolicy.policyNumber}
                  </h3>
                  <span className="text-xs text-slate-500">Customer: {editingPolicy.customer?.name}</span>
                </div>
                <button
                  onClick={() => setEditingPolicy(null)}
                  className="text-slate-400 hover:text-slate-700 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold uppercase text-slate-700 mb-1">
                      Policy Type
                    </label>
                    <select
                      value={editData.policyType}
                      onChange={(e) => setEditData({ ...editData, policyType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white capitalize font-semibold"
                    >
                      <option value="health">Health</option>
                      <option value="motor">Motor</option>
                      <option value="life">Life</option>
                      <option value="home">Home</option>
                      <option value="travel">Travel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-slate-700 mb-1">
                      Premium (INR)
                    </label>
                    <input
                      type="number"
                      value={editData.premiumAmount}
                      onChange={(e) => setEditData({ ...editData, premiumAmount: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-slate-700 mb-1">
                      Coverage (INR)
                    </label>
                    <input
                      type="number"
                      value={editData.coverageAmount}
                      onChange={(e) => setEditData({ ...editData, coverageAmount: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold uppercase text-slate-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={editData.startDate}
                      onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-slate-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={editData.endDate}
                      onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-700 mb-1">
                    Contract Status
                  </label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white uppercase font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingPolicy(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="bg-rose-600 hover:bg-rose-700 text-white"
                    loading={editLoading}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Confirm Delete Policy */}
        {deletingPolicy && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Confirm Policy Deletion</h3>
                  <span className="text-xs text-slate-500">This action cannot be undone.</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to permanently delete policy contract{" "}
                <strong className="font-mono font-bold text-slate-900">
                  #{deletingPolicy.policyNumber}
                </strong>{" "}
                issued to <strong>{deletingPolicy.customer?.name}</strong>?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingPolicy(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                  loading={deleteLoading}
                  onClick={handleDeleteSubmit}
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPoliciesPage;
