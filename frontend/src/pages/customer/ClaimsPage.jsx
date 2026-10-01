import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Search,
  PlusCircle,
  ArrowRight,
  AlertCircle,
  Calendar,
  IndianRupee,
} from "lucide-react";
import AppLayout from "../../components/layout/AppLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import claimService from "../../services/claimService";

export const ClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchClaims = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await claimService.getClaims();
      setClaims(data || []);
    } catch (err) {
      console.error("Failed to fetch claims:", err);
      setError("Unable to load your claims. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

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
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      (claim.claimNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (claim.claimType || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (claim.policy?.policyNumber || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <AppLayout pageTitle="My Claims">
        <PageLoader message="Fetching your insurance claims..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="My Claims">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              My Claims
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track the progress, document status, and settlement milestones for all your claims.
            </p>
          </div>

          <Link to="/customer/claims/new">
            <Button
              variant="primary"
              size="md"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              className="shadow-sm shadow-primary-600/30"
            >
              Submit New Claim
            </Button>
          </Link>
        </div>

        {error && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchClaims}>
              Retry
            </Button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by claim number, type, or policy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600 bg-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-600 bg-white text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="documents_verified">Docs Verified</option>
            <option value="under_investigation">Under Investigation</option>
            <option value="approved">Approved</option>
            <option value="settlement_processing">Settlement Processing</option>
            <option value="settled">Settled</option>
            <option value="closed">Closed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Executive KPI Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Claims Filed</span>
            <span className="text-xl font-extrabold text-slate-900">{claims.length}</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Under Active Review</span>
            <span className="text-xl font-extrabold text-amber-600">
              {claims.filter((c) => ["submitted", "documents_verified", "under_investigation"].includes(c.status)).length}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Approved & Settled</span>
            <span className="text-xl font-extrabold text-emerald-600">
              {claims.filter((c) => ["approved", "settlement_processing", "settled"].includes(c.status)).length}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Amount Claimed</span>
            <span className="text-xl font-extrabold text-slate-900">
              {formatCurrency(claims.reduce((sum, c) => sum + (c.claimedAmount || 0), 0))}
            </span>
          </div>
        </div>

        {/* Claims View */}
        {filteredClaims.length === 0 ? (
          <Card className="p-12 text-center bg-slate-50/50">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No claims found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "No claims matched your search filters."
                : "You haven't filed any insurance claims yet."}
            </p>
            {searchTerm || statusFilter !== "all" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Link to="/customer/claims/new">
                <Button variant="primary" size="sm">
                  Submit Your First Claim
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Claim #</th>
                    <th className="py-3.5 px-4">Policy</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Incident Date</th>
                    <th className="py-3.5 px-4">Claimed Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClaims.map((claim) => (
                    <tr
                      key={claim._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        #{claim.claimNumber}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {claim.policy?.policyNumber || "N/A"}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                        {claim.claimType}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {formatDate(claim.incidentDate)}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        {formatCurrency(claim.claimedAmount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={claim.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/customer/claims/${claim._id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
                        >
                          <span>Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredClaims.map((claim) => (
                <Link
                  key={claim._id}
                  to={`/customer/claims/${claim._id}`}
                  className="block bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900">
                        #{claim.claimNumber}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {claim.claimType} &bull; Policy: {claim.policy?.policyNumber || "N/A"}
                      </p>
                    </div>
                    <StatusBadge status={claim.status} />
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Claimed</span>
                      <span className="font-extrabold text-slate-900">
                        {formatCurrency(claim.claimedAmount)}
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-1 text-primary-600 font-semibold">
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ClaimsPage;
