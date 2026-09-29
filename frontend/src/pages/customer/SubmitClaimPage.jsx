import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import { getPolicies } from "../../services/policyService";
import { createClaim } from "../../services/claimService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const CLAIM_TYPES = [
  { value: "health", label: "Health / Medical" },
  { value: "motor", label: "Motor / Automobile" },
  { value: "life", label: "Life" },
  { value: "property", label: "Property / Home" },
  { value: "travel", label: "Travel" },
];

export const SubmitClaimPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPolicyId = searchParams.get("policyId");

  const [policies, setPolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    policy: preselectedPolicyId || "",
    claimNumber: `CLM-${Date.now().toString().slice(-6)}`,
    claimType: "health",
    incidentDate: new Date().toISOString().split("T")[0],
    claimedAmount: "",
    description: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoadingPolicies(true);
      const res = await getPolicies();
      const list = res.policies || [];
      // Only keep active policies
      const activeList = list.filter((p) => p.status === "active");
      setPolicies(activeList);

      if (preselectedPolicyId) {
        const found = activeList.find((p) => p._id === preselectedPolicyId);
        if (found) {
          setFormData((prev) => ({
            ...prev,
            policy: found._id,
            claimType: found.policyType?.toLowerCase() || prev.claimType,
          }));
        }
      } else if (activeList.length > 0 && !formData.policy) {
        setFormData((prev) => ({
          ...prev,
          policy: activeList[0]._id,
          claimType: activeList[0].policyType?.toLowerCase() || prev.claimType,
        }));
      }
    } catch (err) {
      console.error("Failed to load customer policies", err);
      setError("Unable to load your active policies. Please try again.");
    } finally {
      setLoadingPolicies(false);
    }
  };

  const selectedPolicy = policies.find((p) => p._id === formData.policy);

  const handlePolicyChange = (e) => {
    const pId = e.target.value;
    const policy = policies.find((p) => p._id === pId);
    setFormData((prev) => ({
      ...prev,
      policy: pId,
      claimType: policy?.policyType?.toLowerCase() || prev.claimType,
    }));
    if (fieldErrors.policy) {
      setFieldErrors((prev) => ({ ...prev, policy: "" }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.policy) {
      errors.policy = "Please select an active policy";
    }
    if (!formData.claimNumber.trim()) {
      errors.claimNumber = "Claim number is required";
    }
    if (!formData.claimType) {
      errors.claimType = "Claim type is required";
    }
    if (!formData.incidentDate) {
      errors.incidentDate = "Incident date is required";
    } else {
      const selectedDate = new Date(formData.incidentDate);
      const today = new Date();
      if (selectedDate > today) {
        errors.incidentDate = "Incident date cannot be in the future";
      }
    }
    const amt = parseFloat(formData.claimedAmount);
    if (!formData.claimedAmount || isNaN(amt) || amt <= 0) {
      errors.claimedAmount = "Please enter a valid amount greater than ₹0";
    } else if (selectedPolicy && amt > selectedPolicy.coverageAmount) {
      errors.claimedAmount = `Claim amount cannot exceed policy coverage of ₹${selectedPolicy.coverageAmount.toLocaleString("en-IN")}`;
    }
    if (!formData.description.trim()) {
      errors.description = "Please describe the incident or reason for claim";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Description should be at least 10 characters long";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        claimNumber: formData.claimNumber.trim(),
        policy: formData.policy,
        claimType: formData.claimType,
        incidentDate: formData.incidentDate,
        description: formData.description.trim(),
        claimedAmount: parseFloat(formData.claimedAmount),
      };

      const res = await createClaim(payload);
      setSuccessData(res.claim);
    } catch (err) {
      console.error("Claim submission failed", err);
      const msg =
        err.response?.data?.message ||
        "Failed to submit your claim. Please verify all details and try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const regenerateClaimNumber = () => {
    setFormData((prev) => ({
      ...prev,
      claimNumber: `CLM-${Date.now().toString().slice(-6)}`,
    }));
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/customer/dashboard" className="hover:text-primary-600 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/customer/claims" className="hover:text-primary-600 transition-colors">
            Claims
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">New Claim</span>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Submit New Claim</h1>
          <p className="text-sm text-slate-600 mt-1">
            File an official insurance claim against your active policy. Our processing team will review it immediately.
          </p>
        </div>

        {/* Success Confirmation Card */}
        {successData ? (
          <Card className="border-emerald-200 bg-emerald-50/50 p-8 text-center animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Claim Submitted Successfully!</h2>
            <p className="text-slate-600 max-w-md mx-auto mb-6 text-sm">
              Your claim has been registered with claim reference{" "}
              <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                {successData.claimNumber}
              </span>
              . Our underwriting and claims officer team has received your submission.
            </p>

            <div className="bg-white rounded-xl border border-emerald-100 p-5 max-w-lg mx-auto mb-6 text-left shadow-sm">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Claim Reference</span>
                  <span className="font-semibold text-slate-900 text-sm">{successData.claimNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Claimed Amount</span>
                  <span className="font-semibold text-slate-900 text-sm">
                    ₹{Number(successData.claimedAmount).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Status</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Submitted
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Incident Date</span>
                  <span className="font-medium text-slate-900">
                    {new Date(successData.incidentDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => navigate(`/customer/claims/${successData._id}`)}
                className="w-full sm:w-auto"
              >
                Track Claim Journey
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/customer/claims")}
                className="w-full sm:w-auto"
              >
                View All Claims
              </Button>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700 flex items-start gap-3">
                <svg className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Section 1: Policy Selection */}
            <Card className="p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                Select Policy
              </h2>
              <p className="text-xs text-slate-500 mb-4 ml-8">
                Choose the active insurance policy under which this claim is being filed.
              </p>

              {loadingPolicies ? (
                <div className="py-6 flex items-center justify-center gap-2 text-slate-500 text-sm">
                  <LoadingSpinner size="sm" />
                  <span>Loading your active policies...</span>
                </div>
              ) : policies.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                  <p className="font-semibold mb-1">No Active Policies Available</p>
                  <p className="text-xs text-amber-700">
                    You do not have any active insurance policies eligible for filing a claim.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Associated Policy <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.policy}
                      onChange={handlePolicyChange}
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all outline-none ${
                        fieldErrors.policy
                          ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                          : "border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      }`}
                    >
                      <option value="">-- Choose an active policy --</option>
                      {policies.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.policyNumber} — {p.policyType?.toUpperCase()} (Coverage: ₹{p.coverageAmount?.toLocaleString("en-IN")})
                        </option>
                      ))}
                    </select>
                    {fieldErrors.policy && (
                      <p className="text-xs text-rose-600 mt-1">{fieldErrors.policy}</p>
                    )}
                  </div>

                  {selectedPolicy && (
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <span className="text-slate-500 block">Policy Type</span>
                        <span className="font-medium text-slate-900 capitalize">{selectedPolicy.policyType}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Max Coverage Limit</span>
                        <span className="font-semibold text-primary-700">
                          ₹{selectedPolicy.coverageAmount?.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Annual Premium</span>
                        <span className="font-medium text-slate-900">
                          ₹{selectedPolicy.premiumAmount?.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Valid Until</span>
                        <span className="font-medium text-slate-900">
                          {new Date(selectedPolicy.endDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Section 2: Claim Information */}
            <Card className="p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                Claim Information
              </h2>
              <p className="text-xs text-slate-500 mb-4 ml-8">
                Provide incident date, claim type, and the claimed compensation amount.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Claim Number */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Claim Number <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={regenerateClaimNumber}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Regenerate
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.claimNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, claimNumber: e.target.value });
                      if (fieldErrors.claimNumber) setFieldErrors({ ...fieldErrors, claimNumber: "" });
                    }}
                    placeholder="e.g. CLM-849201"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm font-mono transition-all outline-none ${
                      fieldErrors.claimNumber
                        ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                        : "border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    }`}
                  />
                  {fieldErrors.claimNumber && (
                    <p className="text-xs text-rose-600 mt-1">{fieldErrors.claimNumber}</p>
                  )}
                </div>

                {/* Claim Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Claim Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.claimType}
                    onChange={(e) => {
                      setFormData({ ...formData, claimType: e.target.value });
                      if (fieldErrors.claimType) setFieldErrors({ ...fieldErrors, claimType: "" });
                    }}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all outline-none ${
                      fieldErrors.claimType
                        ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                        : "border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    }`}
                  >
                    {CLAIM_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.claimType && (
                    <p className="text-xs text-rose-600 mt-1">{fieldErrors.claimType}</p>
                  )}
                </div>

                {/* Incident Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Incident Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={formData.incidentDate}
                    onChange={(e) => {
                      setFormData({ ...formData, incidentDate: e.target.value });
                      if (fieldErrors.incidentDate) setFieldErrors({ ...fieldErrors, incidentDate: "" });
                    }}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all outline-none ${
                      fieldErrors.incidentDate
                        ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                        : "border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    }`}
                  />
                  {fieldErrors.incidentDate && (
                    <p className="text-xs text-rose-600 mt-1">{fieldErrors.incidentDate}</p>
                  )}
                </div>

                {/* Claimed Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Claimed Amount (INR) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="e.g. 50000"
                      value={formData.claimedAmount}
                      onChange={(e) => {
                        setFormData({ ...formData, claimedAmount: e.target.value });
                        if (fieldErrors.claimedAmount) setFieldErrors({ ...fieldErrors, claimedAmount: "" });
                      }}
                      className={`w-full pl-8 pr-4 py-2.5 rounded-lg border text-sm transition-all outline-none ${
                        fieldErrors.claimedAmount
                          ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                          : "border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      }`}
                    />
                  </div>
                  {fieldErrors.claimedAmount && (
                    <p className="text-xs text-rose-600 mt-1">{fieldErrors.claimedAmount}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Section 3: Incident Details */}
            <Card className="p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                Incident Description & Justification
              </h2>
              <p className="text-xs text-slate-500 mb-4 ml-8">
                Provide clear details about what occurred, damages incurred, or medical treatment received.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description of Incident <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: "" });
                  }}
                  placeholder="Provide a comprehensive explanation of what occurred, hospital or repair shop details, and why you are claiming this amount..."
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all outline-none ${
                    fieldErrors.description
                      ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                      : "border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  }`}
                />
                {fieldErrors.description && (
                  <p className="text-xs text-rose-600 mt-1">{fieldErrors.description}</p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  Note: Supporting invoices, bills, and survey photos can be uploaded on the next screen once the claim is registered.
                </p>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/customer/claims")}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting || policies.length === 0}
                className="min-w-[150px]"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Submit Claim"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
};

export default SubmitClaimPage;
