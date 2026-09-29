import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  FileCheck2,
  Clock,
  CheckCircle2,
  Banknote,
  ArrowRight,
  ClipboardList,
  Search,
  Bell,
  Lock,
  Layers,
  Sparkles,
  Users,
  History,
  FileText,
} from "lucide-react";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import SectionHeading from "../components/common/SectionHeading";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

// Claim Workflow Stages for interactive simulator
const WORKFLOW_STAGES = [
  {
    step: "01",
    id: "submitted",
    title: "Claim Submitted",
    badge: "Submitted",
    badgeVariant: "primary",
    desc: "Customer submits claim with incident date, description, and claimed amount.",
    actor: "Customer",
    meta: "Claim #CLM-8924 | ₹45,000",
    historyComment: "Initial claim submission filed online",
  },
  {
    step: "02",
    id: "documents_verified",
    title: "Documents Verified",
    badge: "Docs Verified",
    badgeVariant: "emerald",
    desc: "Officer verifies uploaded diagnostic bills, medical summary, and ID records.",
    actor: "Claims Officer",
    meta: "3 of 3 Documents Verified",
    historyComment: "All medical and policy documents verified",
  },
  {
    step: "03",
    id: "under_investigation",
    title: "Survey Investigation",
    badge: "Under Investigation",
    badgeVariant: "amber",
    desc: "Assigned surveyor assesses physical damage, findings, and submits loss report.",
    actor: "Licensed Surveyor",
    meta: "Estimated Loss: ₹42,000",
    historyComment: "On-site assessment completed with report",
  },
  {
    step: "04",
    id: "approved",
    title: "Manager Approval",
    badge: "Approved",
    badgeVariant: "emerald",
    desc: "Claim manager evaluates surveyor findings and authorizes payout settlement.",
    actor: "Claims Manager",
    meta: "Approved Amount: ₹42,000",
    historyComment: "Claim approved within policy limits",
  },
  {
    step: "05",
    id: "settled",
    title: "Settlement & Payout",
    badge: "Settled",
    badgeVariant: "purple",
    desc: "Settlement initiated with bank reference, completed, and claim safely closed.",
    actor: "Finance Officer",
    meta: "Ref: SET-882194 | Bank Transfer",
    historyComment: "Settlement completed & claim closed",
  },
];

export const LandingPage = () => {
  const [activeStage, setActiveStage] = useState(0);

  // Auto-cycle stages gently every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % WORKFLOW_STAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const currentWorkflow = WORKFLOW_STAGES[activeStage];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-primary-500 selection:text-white">
      <Navbar />

      <main className="flex-grow pt-24 sm:pt-28">
        {/* ================= HERO SECTION ================= */}
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
          {/* Subtle background glow grid */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-70"></div>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary-200/40 blur-[120px] rounded-full pointer-events-none -z-10"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Hero Left: Copy & CTAs */}
              <div className="lg:col-span-7 text-center lg:text-left space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-200/80 text-xs font-semibold text-primary-800 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                  <span>Transparent Digital Claims Lifecycle</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                  Insurance Claims,{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-700 via-primary-600 to-blue-500">
                    Simplified.
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                  Submit, track, verify, and settle insurance claims through one
                  transparent digital platform. Engineered for policyholders,
                  surveyors, officers, and claims managers.
                </p>

                {/* Hero CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto shadow-md shadow-primary-600/20"
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      Get Started
                    </Button>
                  </Link>

                  <a href="#how-it-works" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      How It Works
                    </Button>
                  </a>
                </div>

                {/* Trust badges */}
                <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900">
                      100%
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Digital Audit Trail
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900">
                      5 Roles
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Governed Access
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900">
                      100%
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Status Visibility
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Right: Interactive Claim Lifecycle Simulator */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-7 relative overflow-hidden">
                    {/* Header bar of sample card */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                          IF
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900">
                            Claim Progress Live View
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Policy: Comprehensive Health #POL-4091
                          </div>
                        </div>
                      </div>
                      <Badge variant={currentWorkflow.badgeVariant}>
                        {currentWorkflow.badge}
                      </Badge>
                    </div>

                    {/* Stage selector tabs */}
                    <div className="grid grid-cols-5 gap-1.5 mb-6 bg-slate-100 p-1 rounded-lg">
                      {WORKFLOW_STAGES.map((s, idx) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setActiveStage(idx)}
                          className={`py-1.5 text-center text-xs font-semibold rounded transition-all duration-200 ${
                            activeStage === idx
                              ? "bg-white text-primary-700 shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {s.step}
                        </button>
                      ))}
                    </div>

                    {/* Active Stage Details */}
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span>Current Workflow Phase</span>
                          <span className="font-semibold text-slate-700">
                            {currentWorkflow.actor}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mb-1">
                          {currentWorkflow.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {currentWorkflow.desc}
                        </p>
                      </div>

                      {/* Meta & Audit Preview */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                          <span className="text-[10px] uppercase font-bold text-blue-800 block mb-0.5">
                            Details
                          </span>
                          <span className="font-medium text-slate-800">
                            {currentWorkflow.meta}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
                          <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-0.5">
                            Audit Status
                          </span>
                          <span className="font-medium text-slate-800">
                            {currentWorkflow.historyComment}
                          </span>
                        </div>
                      </div>

                      {/* Notification Preview */}
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50/60 border border-amber-200/60 text-xs">
                        <Bell className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <div className="truncate">
                          <span className="font-semibold text-amber-900 block truncate">
                            Notification Triggered: {currentWorkflow.title}
                          </span>
                          <span className="text-amber-700 text-[11px] block truncate">
                            Automated alert delivered to {currentWorkflow.actor.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS SECTION ================= */}
        <section id="how-it-works" className="py-16 sm:py-24 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Workflow Transparency"
              title="How InsureFlow Works"
              subtitle="From the moment an incident happens to final bank settlement, every step is coordinated, audited, and accessible."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative">
              {/* Step 1 */}
              <div className="relative p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-extrabold text-lg mb-4">
                    01
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    Submit Claim
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Customer provides incident specifics, select insured policy, and enters claimed amount.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-400 font-medium">
                  Status: Submitted
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-lg mb-4">
                    02
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    Upload Documents
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Customer attaches relevant bills, ID proof, and reports. Officers review and verify authenticity.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-400 font-medium">
                  Status: Docs Verified
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-extrabold text-lg mb-4">
                    03
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    Survey &amp; Inspection
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Licensed surveyor is assigned, investigates damages, and files an independent technical loss report.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-400 font-medium">
                  Status: Under Investigation
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-lg mb-4">
                    04
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    Manager Approval
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Claims manager audits the findings, authorizes approved compensation amount, and signs decision.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-400 font-medium">
                  Status: Approved
                </div>
              </div>

              {/* Step 5 */}
              <div className="relative p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-extrabold text-lg mb-4">
                    05
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    Settlement &amp; Close
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Payout executed with transaction tracking, bank reference recorded, and claim formally closed.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-400 font-medium">
                  Status: Settled / Closed
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FEATURES SECTION ================= */}
        <section id="features" className="py-16 sm:py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Core Architecture"
              title="Platform Capabilities"
              subtitle="InsureFlow replaces fragmented emails and manual spreadsheets with dedicated modules for every stakeholder."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card hover className="p-7">
                <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-5">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Claim Lifecycle Tracking
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Transparent status updates from initial submission through document review, survey investigation, approval, and final settlement.
                </p>
              </Card>

              {/* Feature 2 */}
              <Card hover className="p-7">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Document Management
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Structured upload pipeline for medical bills, repair estimates, and ID proof with status verification and reviewer remarks.
                </p>
              </Card>

              {/* Feature 3 */}
              <Card hover className="p-7">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Survey &amp; Investigation
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Assigned licensed surveyors can inspect damage, compile field observations, and submit comprehensive loss assessment reports.
                </p>
              </Card>

              {/* Feature 4 */}
              <Card hover className="p-7">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Manager Approval Workflow
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Structured managerial decisions with approved payout authorization, claim rejection records, and information request loops.
                </p>
              </Card>

              {/* Feature 5 */}
              <Card hover className="p-7">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5">
                  <Banknote className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Settlement &amp; Payout Records
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Direct recording of bank transfer references, payment status transitions (processing, completed), and final claim closure.
                </p>
              </Card>

              {/* Feature 6 */}
              <Card hover className="p-7">
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5">
                  <History className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Notifications &amp; Claim History
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Automated milestone alerts delivered to customer and staff, paired with an immutable audit log detailing who changed what and when.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* ================= TRUST & SECURITY SECTION ================= */}
        <section id="security" className="py-16 sm:py-24 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Governance & Integrity"
              title="Built on Trust and Strict Role Governance"
              subtitle="InsureFlow enforces clear separation of concerns across insurance operations so no single party can bypass compliance."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-primary-600" />
                  <h4 className="font-bold text-slate-900 text-base">
                    Role-Based Access
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Strict authorization rules isolate Customer, Claims Officer, Surveyor, Manager, and Admin roles from unauthorized data access.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="w-5 h-5 text-primary-600" />
                  <h4 className="font-bold text-slate-900 text-base">
                    Secure JWT Authentication
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Stateless JSON Web Tokens with salted bcrypt password hashing protect user accounts and sensitive insurance records.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-3">
                  <History className="w-5 h-5 text-primary-600" />
                  <h4 className="font-bold text-slate-900 text-base">
                    Transparent Claim History
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every state transition creates a permanent ClaimHistory entry containing previous status, new status, timestamp, and user identity.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-3">
                  <Layers className="w-5 h-5 text-primary-600" />
                  <h4 className="font-bold text-slate-900 text-base">
                    Centralized Documents
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Uploaded files are linked directly to parent claims with ownership checks preventing access across different customers.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-primary-600" />
                  <h4 className="font-bold text-slate-900 text-base">
                    Structured Approvals
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Managers cannot authorize amounts higher than claimed values, and settlement records require prior manager approval.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <h4 className="font-bold text-slate-900 text-base">
                    Transparent Status Visibility
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Policyholders receive prompt notifications as soon as their documents are verified, surveys completed, or settlement processed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-slate-900 to-navy-900 text-white text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Ready to simplify your claim journey?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto font-normal">
              Join InsureFlow to experience faster turnaround times, complete process
              transparency, and trusted insurance settlement management.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto shadow-lg shadow-primary-500/20"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Get Started
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto bg-slate-800 text-white border-slate-700 hover:bg-slate-700 hover:border-slate-600"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
