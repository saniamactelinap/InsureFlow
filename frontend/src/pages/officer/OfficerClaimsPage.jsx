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
import StaffLayout from "../../components/layout/StaffLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import claimService from "../../services/claimService";

export const OfficerClaimsPage = () => {
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
      console.error("Failed to load claims for officer:", err);
      setError("Unable to load claims records. Please try again.");
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

  // Filter & sort logic
  const filteredClaims = claims
    .filter((c) => {
      const matchesSearch =
        (c.claimNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.customer?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.policy?.policyNumber || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesType = typeFilter === "all" || (c.claimType || "").toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt || b.incidentDate) - new Date(a.createdAt || a.incidentDate);
      if (sortBy === "oldest") return new Date(a.createdAt || a.incidentDate) - new Date(b.createdAt || b.incidentDate);
      if (sortBy === "highest") return (b.claimedAmount || 0) - (a.claimedAmount || 0);
      if (sortBy === "lowest") return (a.claimedAmount || 0) - (b.claimedAmount || 0);
      return 0;
    });

  if (loading) {
    return (
      <StaffLayout pageTitle="Claims Operations Queue">
        <PageLoader message="Fetching claims registry..." />
      </StaffLayout>
    );
  }

  return (
    <StaffLayout pageTitle="Claims Registry & Operations">
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Claims Operations Registry</h1>
            <p className="text-sm text-slate-500 mt-1">
              Filter, audit, and process all customer claims registered on the InsureFlow platform.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
            <span>Showing:</span>
            <span className="text-slate-900 font-bold">{filteredClaims.length} of {claims.length} claims</span>
          </div>
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

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search claim #, customer, policy..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-600 bg-white"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-600 bg-white text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="documents_under_review">Documents Under Review</option>
                <option value="documents_verified">Documents Verified</option>
                <option value="under_investigation">Under Investigation</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="settlement_processing">Settlement Processing</option>
                <option value="settled">Settled</option>
                <option value="rejected">Rejected</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-600 bg-white text-slate-700"
              >
                <option value="all">All Claim Types</option>
                <option value="health">Health / Medical</option>
                <option value="motor">Motor / Auto</option>
                <option value="property">Property / Home</option>
                <option value="life">Life</option>
                <option value="travel">Travel</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-600 bg-white text-slate-700"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="highest">Sort: Highest Amount</option>
                <option value="lowest">Sort: Lowest Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Claims Table / Listing */}
        {filteredClaims.length === 0 ? (
          <Card className="p-12 text-center bg-slate-50/50">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No matching claims found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your search criteria, claim type, or status filter.
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
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Claim #</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Policy #</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Claimed Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Surveyor</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClaims.map((claim) => (
                    <tr key={claim._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs">
                        #{claim.claimNumber}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-900">
                        {claim.customer?.name || "Customer"}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                        {claim.policy?.policyNumber || "N/A"}
                      </td>
                      <td className="py-3.5 px-4 text-xs capitalize text-slate-600">
                        {claim.claimType}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-extrabold text-slate-900">
                        {formatCurrency(claim.claimedAmount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={claim.status} />
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {claim.assignedSurveyor ? (
                          <span className="inline-flex items-center gap-1 font-medium text-blue-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            <span>Assigned</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {formatDate(claim.incidentDate || claim.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/officer/claims/${claim._id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3">
              {filteredClaims.map((claim) => (
                <Link
                  key={claim._id}
                  to={`/officer/claims/${claim._id}`}
                  className="block bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        #{claim.claimNumber}
                      </span>
                      <p className="text-xs text-slate-700 font-semibold mt-0.5">
                        {claim.customer?.name || "Customer"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {claim.claimType} &bull; Policy: {claim.policy?.policyNumber || "N/A"}
                      </p>
                    </div>
                    <StatusBadge status={claim.status} />
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Claimed Amount</span>
                      <span className="font-extrabold text-slate-900">
                        {formatCurrency(claim.claimedAmount)}
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-1 text-primary-600 font-bold">
                      <span>Open Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default OfficerClaimsPage;
