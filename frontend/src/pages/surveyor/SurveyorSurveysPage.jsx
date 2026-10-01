import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileCheck,
  Search,
  ArrowRight,
  AlertCircle,
  Calendar,
  IndianRupee,
} from "lucide-react";
import StaffLayout from "../../components/layout/StaffLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import PageLoader from "../../components/common/PageLoader";
import surveyService from "../../services/surveyService";

export const SurveyorSurveysPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await surveyService.getSurveyReports();
      setReports(data || []);
    } catch (err) {
      console.error("Failed to load surveyor reports:", err);
      setError("Unable to load survey reports. Please try again.");
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

  const filteredReports = reports.filter((r) => {
    const term = searchTerm.toLowerCase();
    const claimNum = (r.claim?.claimNumber || "").toLowerCase();
    const findings = (r.findings || "").toLowerCase();
    return claimNum.includes(term) || findings.includes(term);
  });

  if (loading) {
    return (
      <StaffLayout pageTitle="Survey Reports Registry">
        <PageLoader message="Fetching your submitted survey reports..." />
      </StaffLayout>
    );
  }

  return (
    <StaffLayout pageTitle="Survey Reports Registry">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Completed Survey Reports</h1>
            <p className="text-sm text-slate-500 mt-1">
              Permanent repository of field inspection dossiers submitted by your surveyor desk.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
            Total Filed: {reports.length}
          </span>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchReports}>
              Retry
            </Button>
          </div>
        )}

        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by claim number or findings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-600 bg-white"
          />
        </div>

        {filteredReports.length === 0 ? (
          <Card className="p-12 text-center bg-slate-50/50">
            <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No survey reports found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              You haven't filed any inspection reports yet. Open an assigned claim to submit a report.
            </p>
            <Link to="/surveyor/claims">
              <Button variant="primary" size="sm">
                View Assigned Claims
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <Card key={report._id} className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Claim Reference</span>
                      <span className="font-mono font-bold text-base text-slate-900">
                        #{report.claim?.claimNumber || "N/A"}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      Filed
                    </span>
                  </div>

                  <div className="py-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Inspection Date</span>
                      <span className="font-medium text-slate-700">{formatDate(report.inspectionDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimated Loss</span>
                      <span className="font-extrabold text-slate-900">{formatCurrency(report.estimatedLoss)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-slate-400 block mb-0.5">Recommendation:</span>
                      <span className="font-semibold text-primary-700 block">{report.recommendation || "Recommended"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Findings Summary:</span>
                      <p className="text-slate-600 line-clamp-2 italic">"{report.findings}"</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    to={`/surveyor/claims/${report.claim?._id || report.claim}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                  >
                    <span>View Inspection Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default SurveyorSurveysPage;
