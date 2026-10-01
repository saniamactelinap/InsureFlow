import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  FolderOpen,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  IndianRupee,
  Shield,
  Clock,
  ExternalLink,
} from "lucide-react";
import StaffLayout from "../../components/layout/StaffLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import PageLoader from "../../components/common/PageLoader";
import claimService from "../../services/claimService";
import documentService from "../../services/documentService";
import surveyService from "../../services/surveyService";

export const SurveyorClaimDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [claim, setClaim] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [existingReport, setExistingReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState("");

  // Survey Report Form State
  const [formData, setFormData] = useState({
    inspectionDate: new Date().toISOString().split("T")[0],
    estimatedLoss: "",
    findings: "",
    damageDescription: "",
    recommendation: "Recommended for Full Approval",
    remarks: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadClaimData();
  }, [id]);

  const loadClaimData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await claimService.getClaimById(id);
      const claimData = res.claim;
      setClaim(claimData);

      // Default estimated loss to claimed amount
      setFormData((prev) => ({
        ...prev,
        estimatedLoss: claimData?.claimedAmount || "",
      }));

      // Load documents
      try {
        const allDocs = await documentService.getDocuments();
        const claimDocs = (allDocs || []).filter(
          (d) =>
            d.claim?._id === id ||
            d.claim === id ||
            d.claim?.claimNumber === claimData?.claimNumber
        );
        setDocuments(claimDocs);
      } catch (dErr) {
        console.warn("Docs error:", dErr);
      }

      // Check if survey report exists
      try {
        const reports = await surveyService.getSurveyReports();
        const found = (reports || []).find(
          (r) =>
            r.claim?._id === id ||
            r.claim === id ||
            r.claim?.claimNumber === claimData?.claimNumber
        );
        setExistingReport(found || null);
      } catch (rErr) {
        console.warn("Reports error:", rErr);
      }
    } catch (err) {
      console.error("Failed to load surveyor claim details:", err);
      setError("Unable to find claim or permission denied.");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.inspectionDate) {
      errs.inspectionDate = "Inspection date is required";
    }
    const loss = parseFloat(formData.estimatedLoss);
    if (!formData.estimatedLoss || isNaN(loss) || loss < 0) {
      errs.estimatedLoss = "Please provide a valid estimated loss amount";
    }
    if (!formData.findings.trim()) {
      errs.findings = "Inspection findings summary is required";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        claim: id,
        inspectionDate: formData.inspectionDate,
        estimatedLoss: parseFloat(formData.estimatedLoss),
        findings: formData.findings.trim(),
        damageDescription: formData.damageDescription.trim() || undefined,
        recommendation: formData.recommendation,
        remarks: formData.remarks.trim() || undefined,
      };

      const res = await surveyService.createSurveyReport(payload);
      setActionSuccess("Official survey report submitted successfully.");
      setExistingReport(res.report);
      loadClaimData();
    } catch (err) {
      console.error("Survey report creation failed:", err);
      alert(err.response?.data?.message || "Failed to submit survey report.");
    } finally {
      setSubmitting(false);
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
      <StaffLayout pageTitle="Field Inspection Dossier">
        <PageLoader message="Loading assigned inspection case..." />
      </StaffLayout>
    );
  }

  if (error || !claim) {
    return (
      <StaffLayout pageTitle="Field Inspection Dossier">
        <div className="max-w-xl mx-auto py-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{error || "Claim not found"}</h2>
          <Button variant="outline" size="sm" onClick={() => navigate("/surveyor/claims")}>
            Back to Assigned Queue
          </Button>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout pageTitle={`Field Dossier #${claim.claimNumber}`}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <Link
            to="/surveyor/claims"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Assigned Claims</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Claim Status:</span>
            <StatusBadge status={claim.status} />
          </div>
        </div>

        {actionSuccess && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess("")} className="text-emerald-700 font-bold">
              &times;
            </button>
          </div>
        )}

        {/* Claim & Policy Overview Header */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold uppercase px-2.5 py-0.5 rounded bg-slate-100 text-slate-800">
                  {claim.claimType} Insurance
                </span>
                <StatusBadge status={claim.status} />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 font-mono">
                Claim #{claim.claimNumber}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Policyholder: <span className="font-semibold text-slate-800">{claim.customer?.name}</span> ({claim.customer?.email})
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-right">
              <span className="text-xs font-semibold uppercase text-slate-400 block mb-0.5">
                Amount Claimed
              </span>
              <span className="text-2xl font-extrabold text-slate-900">
                {formatCurrency(claim.claimedAmount)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Policy Number</span>
              <span className="font-mono font-bold text-slate-900 mt-0.5 block">{claim.policy?.policyNumber || "N/A"}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Max Coverage</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{formatCurrency(claim.policy?.coverageAmount)}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Incident Date</span>
              <span className="font-medium text-slate-900 mt-0.5 block">{formatDate(claim.incidentDate)}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-semibold text-[10px]">Report Status</span>
              <span className="font-bold text-slate-900 mt-0.5 block">
                {existingReport ? "Submitted" : "Pending Report"}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-400 block uppercase font-semibold text-[10px] mb-1">
              Claimant's Incident Description
            </span>
            <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
              {claim.description}
            </p>
          </div>
        </Card>

        {/* Existing Evidence Documents */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h2 className="text-sm font-bold text-slate-900">Submitted Evidence Documents</h2>
            <span className="text-xs text-slate-500">{documents.length} files on record</span>
          </div>

          {documents.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              No evidence documents available for this claim.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {documents.map((doc) => (
                <div key={doc._id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-900 capitalize block">{doc.documentType}</span>
                    <span className="text-[11px] text-slate-500 font-mono truncate block max-w-[200px]">
                      {doc.filename}
                    </span>
                  </div>
                  {doc.filePath && (
                    <a
                      href={`http://localhost:5000/${doc.filePath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-600 font-semibold text-xs flex items-center gap-1 hover:underline"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Survey Report Section: Either Display Completed Report OR Report Creation Form */}
        {existingReport ? (
          <Card className="p-6 border-emerald-200 bg-emerald-50/20">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-200/80 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Certified Survey Report Filed</h2>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Official Record
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-4">
              <div className="bg-white p-3.5 rounded-lg border border-emerald-100 shadow-sm">
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Inspection Date</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {formatDate(existingReport.inspectionDate)}
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-emerald-100 shadow-sm">
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Certified Loss Estimate</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {formatCurrency(existingReport.estimatedLoss)}
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-emerald-100 shadow-sm">
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Recommendation</span>
                <span className="font-bold text-primary-700 text-sm mt-0.5 block">
                  {existingReport.recommendation || "Recommended"}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
              <div>
                <span className="text-slate-500 font-semibold block uppercase text-[10px]">Findings</span>
                <p className="text-slate-800 mt-0.5 leading-relaxed">{existingReport.findings}</p>
              </div>
              {existingReport.damageDescription && (
                <div>
                  <span className="text-slate-500 font-semibold block uppercase text-[10px]">Damage Particulars</span>
                  <p className="text-slate-800 mt-0.5 leading-relaxed">{existingReport.damageDescription}</p>
                </div>
              )}
              {existingReport.remarks && (
                <div>
                  <span className="text-slate-500 font-semibold block uppercase text-[10px]">Surveyor Remarks</span>
                  <p className="text-slate-600 mt-0.5 italic">{existingReport.remarks}</p>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <FileCheck className="w-5 h-5 text-primary-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Record Field Inspection Report</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submit physical damage evaluation, assessed financial loss, and recommendation for underwriting manager.
                </p>
              </div>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Inspection Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.inspectionDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    required
                  />
                  {formErrors.inspectionDate && (
                    <p className="text-rose-600 text-[11px] mt-1">{formErrors.inspectionDate}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Assessed / Estimated Loss (INR) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g. 45000"
                      value={formData.estimatedLoss}
                      onChange={(e) => setFormData({ ...formData, estimatedLoss: e.target.value })}
                      className="w-full pl-7 pr-3 py-2 border rounded-lg bg-white font-bold"
                      required
                    />
                  </div>
                  {formErrors.estimatedLoss && (
                    <p className="text-rose-600 text-[11px] mt-1">{formErrors.estimatedLoss}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Accredited Recommendation <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.recommendation}
                  onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white font-medium"
                >
                  <option value="Recommended for Full Approval">Recommended for Full Approval</option>
                  <option value="Recommended with Deductions (Depreciation Applied)">
                    Recommended with Deductions (Depreciation Applied)
                  </option>
                  <option value="Further Evidence Required from Claimant">
                    Further Evidence Required from Claimant
                  </option>
                  <option value="Recommended for Rejection (Policy Exclusion)">
                    Recommended for Rejection (Policy Exclusion)
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Inspection Findings Summary <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Detail the physical inspection results, condition of property/vehicle, verification of bills, and evidence matching..."
                  value={formData.findings}
                  onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                  required
                />
                {formErrors.findings && (
                  <p className="text-rose-600 text-[11px] mt-1">{formErrors.findings}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Damage Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Specific components damaged or surgical procedures examined..."
                  value={formData.damageDescription}
                  onChange={(e) => setFormData({ ...formData, damageDescription: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Surveyor Remarks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Additional observations or notes for the claims manager..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/surveyor/claims")}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={submitting}
                  leftIcon={<FileCheck className="w-4 h-4" />}
                >
                  Submit Certified Report
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </StaffLayout>
  );
};

export default SurveyorClaimDetailsPage;
