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
  Users,
  History,
  FileText,
  Car,
  HeartPulse,
  Home,
  ChevronRight,
  Check,
} from "lucide-react";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import SectionHeading from "../components/common/SectionHeading";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

// 6 Real-World Insurance Lifecycle Stages
const WORKFLOW_STEPS = [
  {
    step: "01",
    id: "submit",
    title: "Submit Claim",
    badge: "Customer Filing",
    badgeVariant: "primary",
    desc: "The policyholder selects an active policy, specifies the incident date and description, and requests a claimed amount.",
    actor: "Policyholder",
    image: "/images/submit-claim.jpg",
    auditNote: "Claim reference generated: #CLM-8924",
  },
  {
    step: "02",
    id: "documents",
    title: "Upload Documents",
    badge: "Evidence Submission",
    badgeVariant: "amber",
    desc: "Diagnostic bills, hospital discharge summaries, or police FIR reports are uploaded directly to the digital dossier.",
    actor: "Policyholder",
    image: "/images/document-verification.jpg",
    auditNote: "Files linked to claim record (5 MB limit)",
  },
  {
    step: "03",
    id: "verification",
    title: "Verification",
    badge: "Underwriting Review",
    badgeVariant: "emerald",
    desc: "A designated claims officer reviews uploaded invoices, inspects policy limits, and validates document authenticity.",
    actor: "Claims Officer",
    image: "/images/document-verification.jpg",
    auditNote: "Documents certified & marked verified",
  },
  {
    step: "04",
    id: "survey",
    title: "Survey & Investigation",
    badge: "Field Inspection",
    badgeVariant: "amber",
    desc: "For motor and property losses, an authorized independent surveyor conducts on-site inspection and files a technical loss report.",
    actor: "Licensed Surveyor",
    image: "/images/survey-inspection.jpg",
    auditNote: "Technical survey report filed with loss estimate",
  },
  {
    step: "05",
    id: "approval",
    title: "Manager Approval",
    badge: "Management Authorization",
    badgeVariant: "emerald",
    desc: "The claims manager evaluates the surveyor's findings against policy coverage and formally authorizes the approved payout.",
    actor: "Claims Manager",
    image: "/images/approval-settlement.jpg",
    auditNote: "Settlement amount officially authorized",
  },
  {
    step: "06",
    id: "settlement",
    title: "Settlement",
    badge: "Disbursement & Close",
    badgeVariant: "purple",
    desc: "Financial settlement is executed with bank transfer references, payment status confirmed, and the case file archived.",
    actor: "Finance / Settlement Officer",
    image: "/images/approval-settlement.jpg",
    auditNote: "Bank transfer logged & claim closed",
  },
];

// Interactive Claim Simulator Stages
const SIMULATOR_STAGES = [
  {
    id: "submitted",
    name: "Claim Submitted",
    actor: "Customer",
    statusText: "Submitted",
    badgeVariant: "primary",
    amount: "₹65,000 claimed",
    comment: "Claim filed online under Health Shield Policy #POL-8901",
    date: "Sep 18, 2026",
  },
  {
    id: "documents_verified",
    name: "Documents Verified",
    actor: "Claims Officer",
    statusText: "Docs Verified",
    badgeVariant: "emerald",
    amount: "3 Bills Verified",
    comment: "Medical summaries and diagnostic bills verified against policy schedule",
    date: "Sep 19, 2026",
  },
  {
    id: "under_investigation",
    name: "Survey Investigation",
    actor: "Licensed Surveyor",
    statusText: "Investigation Completed",
    badgeVariant: "amber",
    amount: "Assessed Loss: ₹58,000",
    comment: "Technical inspection completed; physical assessment report filed",
    date: "Sep 20, 2026",
  },
  {
    id: "approved",
    name: "Manager Approval",
    actor: "Claims Manager",
    statusText: "Approved",
    badgeVariant: "emerald",
    amount: "Authorized: ₹58,000",
    comment: "Formal managerial sign-off authorized within policy entitlement limits",
    date: "Sep 21, 2026",
  },
  {
    id: "settlement_processing",
    name: "Settlement Processing",
    actor: "Finance Department",
    statusText: "Payment Initiated",
    badgeVariant: "purple",
    amount: "NEFT / RTGS Pending",
    comment: "Disbursement instruction transmitted to payment gateway",
    date: "Sep 22, 2026",
  },
  {
    id: "settled",
    name: "Claim Settled",
    actor: "System Audit",
    statusText: "Settled & Closed",
    badgeVariant: "emerald",
    amount: "Disbursed: ₹58,000",
    comment: "Bank reference logged (#TXN-882194); claim officially closed",
    date: "Sep 22, 2026",
  },
];

export const LandingPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [simIndex, setSimIndex] = useState(0);
  const [videoError, setVideoError] = useState(false);

  // Auto-cycle simulator gently
  useEffect(() => {
    const timer = setInterval(() => {
      setSimIndex((prev) => (prev + 1) % SIMULATOR_STAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const currentSim = SIMULATOR_STAGES[simIndex];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-primary-600 selection:text-white">
      <Navbar />

      <main className="flex-grow pt-20 sm:pt-24">
        {/* ================= HERO SECTION ================= */}
        <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-10 pb-16 lg:pt-16 lg:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
              {/* Left Column: Core Positioning */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">
                  <Shield className="w-3.5 h-3.5 text-primary-600" />
                  <span>Enterprise Insurance Claim Platform</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                  Insurance Claims,{" "}
                  <span className="text-primary-600">Simplified.</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                  Submit, track, verify, and settle insurance claims through one
                  transparent digital platform. Engineered for policyholders,
                  licensed surveyors, claims officers, and underwriting managers.
                </p>

                {/* Primary & Secondary Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto shadow-sm"
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      Submit a Claim
                    </Button>
                  </Link>

                  <a href="#how-it-works" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      How It Works
                    </Button>
                  </a>
                </div>

                {/* Trust Credentials */}
                <div className="pt-8 border-t border-slate-100 grid grid-cols-3 gap-6 text-center lg:text-left">
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900">
                      100%
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Traceable Audit Log
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900">
                      5 Roles
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Governed Workflow
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900">
                      Zero
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Manual Paperwork Queues
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Real Photography & Live Product Overlay */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-lg lg:max-w-none">
                  {/* Main Hero Visual Card */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-xl bg-slate-900 aspect-[4/3] sm:aspect-[16/11]">
                    {!videoError ? (
                      <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster="/images/hero-consultation.jpg"
                        onError={() => setVideoError(true)}
                        className="w-full h-full object-cover object-center filter brightness-95"
                      >
                        <source src="/videos/hero-insurance.mp4" type="video/mp4" />
                        <img
                          src="/images/hero-consultation.jpg"
                          alt="Insurance advisor reviewing claim with client"
                          className="w-full h-full object-cover"
                        />
                      </video>
                    ) : (
                      <img
                        src="/images/hero-consultation.jpg"
                        alt="Insurance advisor reviewing claim with client"
                        className="w-full h-full object-cover object-center"
                      />
                    )}

                    {/* Gradient vignette for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent pointer-events-none" />

                    {/* Image Caption */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs text-white/90 drop-shadow">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/50 backdrop-blur-sm text-[11px] font-medium border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Client Advisory &amp; Filing
                      </span>
                    </div>

                    {/* Realistic Product Feature Overlay (NOT a hologram) */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-slate-200 shadow-lg text-left">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            Claim #CLM-1024
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            Motor Accident
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                          Active Dossier
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <span className="text-emerald-600 font-bold">✓</span> Document Verification
                          </span>
                          <span className="font-semibold text-emerald-700">Completed</span>
                        </div>

                        <div className="flex items-center justify-between text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            <span className="w-2 h-2 -ml-3.5 rounded-full bg-amber-500" />
                            Survey Inspection
                          </span>
                          <span className="font-semibold text-amber-700">In Progress</span>
                        </div>

                        <div className="flex items-center justify-between text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <span className="text-slate-400">○</span> Manager Approval
                          </span>
                          <span className="text-slate-500">Pending</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION: HOW IT WORKS (STORYTELLING) ================= */}
        <section id="how-it-works" className="py-16 sm:py-24 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Workflow Transparency"
              title="How InsureFlow Works"
              subtitle="From the moment an incident happens to final bank settlement, every step is coordinated, audited, and accessible."
            />

            {/* Stepper Tabs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
              {WORKFLOW_STEPS.map((s, idx) => {
                const isActive = activeStep === idx;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveStep(idx)}
                    type="button"
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      isActive
                        ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-mono font-bold ${
                          isActive ? "text-primary-400" : "text-slate-400"
                        }`}
                      >
                        {s.step}
                      </span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                      )}
                    </div>
                    <div
                      className={`text-xs font-bold truncate ${
                        isActive ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {s.title}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Step Spotlight Card */}
            {(() => {
              const current = WORKFLOW_STEPS[activeStep];
              return (
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-primary-100 text-primary-800">
                          Step {current.step}
                        </span>
                        <Badge variant={current.badgeVariant}>
                          {current.badge}
                        </Badge>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        {current.title}
                      </h3>

                      <p className="text-base text-slate-600 leading-relaxed">
                        {current.desc}
                      </p>

                      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-white rounded-lg border border-slate-200">
                          <span className="text-slate-400 block mb-0.5 uppercase tracking-wider font-semibold text-[10px]">
                            Primary Responsible Actor
                          </span>
                          <span className="font-bold text-slate-800 text-sm">
                            {current.actor}
                          </span>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-slate-200">
                          <span className="text-slate-400 block mb-0.5 uppercase tracking-wider font-semibold text-[10px]">
                            Audit Trail Logging
                          </span>
                          <span className="font-medium text-slate-700">
                            {current.auditNote}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-5">
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm aspect-[4/3]">
                        <img
                          src={current.image}
                          alt={current.title}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {/* ================= REALISTIC IMAGE + TEXT STORYTELLING SECTIONS ================= */}

        {/* Section 1: Submit Your Claim (Image Left, Text Right) */}
        <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md aspect-[4/3]">
                  <img
                    src="/images/submit-claim.jpg"
                    alt="Customer submitting an insurance claim on laptop"
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                    Self-Service Policyholder Portal
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-700">
                  Digital Claim Initiation
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Submit Your Claim Without the Paperwork
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  Start your claim digitally without unnecessary paperwork. Select your active insured policy, specify incident specifics, and register an official claim number instantly.
                </p>

                <div className="space-y-3 pt-2 text-sm text-slate-700">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Instant automatic claim reference generation</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Real-time policy coverage limit validation</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Immediate progress visibility from day one</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Transparent Verification (Text Left, Image Right) */}
        <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-700">
                  Underwriting &amp; Document Review
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Transparent Document Verification
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  Documents can be reviewed and verified through a structured digital workflow. Medical bills, damage estimates, and identity records are audited by authorized officers with remarks.
                </p>

                <div className="space-y-3 pt-2 text-sm text-slate-700">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Upload verification certificates (PDF, PNG, JPG up to 5 MB)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Clear verification status badges (Verified, Pending, Rejected)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Detailed reviewer comments for full policyholder transparency</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md aspect-[4/3]">
                  <img
                    src="/images/document-verification.jpg"
                    alt="Insurance officer verifying claim documents"
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                    Officer Verification &amp; Certification
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Survey & Investigation (Image Left, Text Right) */}
        <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md aspect-[4/3]">
                  <img
                    src="/images/survey-inspection.jpg"
                    alt="Automobile claims surveyor inspecting vehicle damage"
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                    Licensed Field Loss Assessment
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Field Assessment
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Survey &amp; Technical Investigation
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  Assigned surveyors can record inspection findings and submit reports. For motor accidents and property damages, an objective technical evaluation ensures equitable loss estimation.
                </p>

                <div className="space-y-3 pt-2 text-sm text-slate-700">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Independent surveyor assignment per claim discipline</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Structured loss estimation and technical findings reporting</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Immutable inspection records archived into claim history</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Approval & Settlement (Text Left, Image Right) */}
        <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Managerial Authorization &amp; Disbursement
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Structured Approval &amp; Settlement
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  Claims move through structured approval and settlement stages. Managers authorize approved compensation amounts within policy terms, and settlements are executed with traceable bank reference numbers.
                </p>

                <div className="space-y-3 pt-2 text-sm text-slate-700">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Multi-tiered authorization preventing unapproved disbursements</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Direct recording of bank transfer references (NEFT/RTGS)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Automated notification alerts when settlement is finalized</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md aspect-[4/3]">
                  <img
                    src="/images/approval-settlement.jpg"
                    alt="Insurance manager approving settlement payment"
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                    Financial Settlement Execution
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= INTERACTIVE CLAIM JOURNEY SIMULATOR ================= */}
        <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Interactive Simulation"
              title="Trace an Insurance Claim"
              subtitle="Experience the exact lifecycle a claim follows in InsureFlow, from submission to final settlement."
            />

            {/* Desktop Horizontal Timeline / Mobile Vertical */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              {/* Stepper Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8">
                {SIMULATOR_STAGES.map((st, idx) => (
                  <button
                    key={st.id}
                    onClick={() => setSimIndex(idx)}
                    type="button"
                    className={`p-3 rounded-lg text-left transition-all ${
                      simIndex === idx
                        ? "bg-slate-900 text-white font-semibold"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">
                      Phase 0{idx + 1}
                    </div>
                    <div className="text-xs font-bold truncate mt-0.5">{st.name}</div>
                  </button>
                ))}
              </div>

              {/* Active Stage Dossier Preview */}
              <div className="p-5 sm:p-6 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Case Dossier Stage
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                      {currentSim.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={currentSim.badgeVariant} size="lg">
                      {currentSim.statusText}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">Acting Party:</span>
                    <span className="font-bold text-slate-800 text-sm">{currentSim.actor}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">Financial Metric:</span>
                    <span className="font-bold text-slate-800 text-sm">{currentSim.amount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-medium">Audit Timestamp:</span>
                    <span className="font-medium text-slate-700 text-sm">{currentSim.date}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-start gap-2.5 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800 shrink-0">Official Log:</span>
                  <span className="italic">"{currentSim.comment}"</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= REAL COVERAGE SECTORS ================= */}
        <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Supported Lines of Insurance"
              title="Tailored Across All Policy Types"
              subtitle="InsureFlow coordinates workflows tailored specifically for motor, health, and property underwriting requirements."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Motor */}
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 hover:shadow-md transition-shadow">
                <div className="h-44 overflow-hidden">
                  <img
                    src="/images/survey-inspection.jpg"
                    alt="Motor Insurance"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="w-4 h-4 text-primary-600" />
                    <h3 className="font-bold text-slate-900 text-base">Motor Insurance</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Automated surveyor assignment, garage repair estimate audits, vehicle RC verification, and accident loss assessment.
                  </p>
                </div>
              </div>

              {/* Health */}
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 hover:shadow-md transition-shadow">
                <div className="h-44 overflow-hidden">
                  <img
                    src="/images/medical-care.jpg"
                    alt="Health Insurance"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <HeartPulse className="w-4 h-4 text-rose-600" />
                    <h3 className="font-bold text-slate-900 text-base">Health Insurance</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Hospitalization summaries, diagnostic invoice certification, medical coverage validation, and cashless / reimbursement claims.
                  </p>
                </div>
              </div>

              {/* Property */}
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 hover:shadow-md transition-shadow">
                <div className="h-44 overflow-hidden">
                  <img
                    src="/images/property-insurance.jpg"
                    alt="Property Insurance"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-slate-900 text-base">Property Insurance</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Structural damage inspection, fire and water loss assessments, rebuilding cost auditing, and formal payout settlements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= TRUST SECTION ================= */}
        <section id="security" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Integrity &amp; Compliance"
              title="Built for Transparency and Trust"
              subtitle="InsureFlow eliminates arbitrary delays with strict role-based separation of concerns and an unalterable history log."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">Secure Documents</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Supporting documents remain permanently tied to the structured claim workflow with strict owner-access boundaries.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">Transparent Status</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Policyholders follow the exact phase of their claim with timely notifications whenever a stage advances.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">Structured Review</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Claims pass sequentially through document verification, technical survey, and manager approval before settlement.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                    <History className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">Claim History</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every status update is recorded with previous status, new status, reviewer name, role, comments, and timestamp.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">Role-Based Access</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Customers, surveyors, officers, managers, and administrators see only operations relevant to their responsibilities.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">Authenticated Sessions</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Protected API routes and password hashing safeguard user data across every claim interaction.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="py-16 sm:py-20 bg-slate-900 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Ready to simplify your claim journey?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto font-normal">
              Experience transparent claim tracking, structured underwriting reviews, and reliable settlement management.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto shadow-md"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Submit a Claim
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto bg-slate-800 text-white border-slate-700 hover:bg-slate-700 hover:border-slate-600"
                >
                  Access Customer Portal
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
