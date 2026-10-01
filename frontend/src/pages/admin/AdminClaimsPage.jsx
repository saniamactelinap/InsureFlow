import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Search,
  Filter,
  ArrowRight,
  AlertCircle,
  Calendar,
  IndianRupee,
  User,
  Shield,
} from "lucide-react";
import AdminLayout from "../../components/layout/AdminLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import claimService from "../../services/claimService";

export const AdminClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await claimService.getClaims();
      setClaims(data || []);
    } catch (err) {
      console.error("Failed to load claims for admin:", err);
      setError("Unable to load enterprise claims master repository. Please try again.");
    } finally {
      setLoading(false);
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

  // Filter and sort claims
  const filteredClaims = claims
    .filter((c) => {
      const term = searchTerm.toLowerCase();
      const claimNumber = (c.claimNumber || "").toLowerCase();
      const customerName = (c.customer?.name || "").toLowerCase();
      const policyNumber = (c.policy?.policyNumber || "").toLowerCase();

      const matchesSearch =
        claimNumber.includes(term) ||
        customerName.includes(term) ||
        policyNumber.includes(term);

      const matchesStatus =
        statusFilter === "all" || c.status === statusFilter;

      const matchesType =
        typeFilter === "all" || c.claimType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === "amount-high") {
        return (b.claimedAmount || 0) - (a.claimedAmount || 0);
      }
      if (sortBy === "amount-low") {
        return (a.claimedAmount || 0) - (b.claimedAmount || 0);
      }
      return 0;
    });

  if (loading) {
    return (
      <AdminLayout pageTitle="Claims Master Repository">
        <PageLoader message="Loading enterprise claims records..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Enterprise Claims Registry">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Claims Master Repository</h1>
            <p className="text-sm text-slate-500 mt-1">
              Complete organizational register of submitted claims across all operational departments.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
            Total Claims: {claims.length}
          </span>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchClaims}>
              Retry
            </Button>
          </div>
        )}

        {/* Filter Controls */}
        <Card className="p-4 bg-white">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by claim #, customer name, policy #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-600 bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-auto px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-rose-600 font-semibold"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="documents_pending">Documents Pending</option>
                <option value="documents_verified">Documents Verified</option>
                <option value="under_investigation">Under Investigation</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="settlement_processing">Settlement Processing</option>
                <option value="settled">Settled</option>
                <option value="closed">Closed</option>
              </select>

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
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-auto px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-rose-600 font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount-high">Amount (High to Low)</option>
                <option value="amount-low">Amount (Low to High)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Claims Table */}
        {filteredClaims.length === 0 ? (
          <Card className="p-12 text-center bg-slate-50/50">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No claims match criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your search query or status parameters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setTypeFilter("all");
              }}
            >
              Reset Filters
            </Button>
          </Card>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Claim #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Policy #</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Claimed Amount</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4">Surveyor</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4 text-right">Administrative Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredClaims.map((claim) => (
                    <tr
                      key={claim._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        #{claim.claimNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        {claim.customer?.name || "Customer"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {claim.policy?.policyNumber || "N/A"}
                      </td>
                      <td className="py-3.5 px-4 capitalize text-slate-700">
                        {claim.claimType}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(claim.claimedAmount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={claim.status} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {claim.assignedSurveyor?.name ? (
                          <span className="font-semibold text-slate-900">
                            {claim.assignedSurveyor.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {formatDate(claim.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/admin/claims/${claim._id}`}
                          className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded transition-colors"
                        >
                          <span>Open Dossier</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminClaimsPage;
