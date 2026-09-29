import React from "react";
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

const STAGES = [
  { key: "submitted", label: "Claim Submitted", description: "Filing received" },
  { key: "documents_verified", label: "Documents Verified", description: "Records validated" },
  { key: "under_investigation", label: "Investigation", description: "Surveyor assessment" },
  { key: "approved", label: "Manager Approval", description: "Decision & amount authorized" },
  { key: "settlement_processing", label: "Settlement Processing", description: "Finance disbursement" },
  { key: "settled", label: "Settled & Closed", description: "Payout complete" },
];

export const ClaimJourney = ({ status = "submitted", orientation = "horizontal" }) => {
  const isRejected = status === "rejected";

  // Map backend status to stage index
  const getStageIndex = (st) => {
    switch (st) {
      case "submitted":
        return 0;
      case "documents_under_review":
        return 0;
      case "documents_verified":
        return 1;
      case "under_investigation":
        return 2;
      case "approved":
        return 3;
      case "rejected":
        return 3;
      case "settlement_processing":
        return 4;
      case "settled":
      case "closed":
        return 5;
      default:
        return 0;
    }
  };

  const currentIndex = getStageIndex(status);

  if (orientation === "vertical") {
    return (
      <div className="space-y-6 relative pl-2">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex && !isRejected;
          const isUpcoming = idx > currentIndex && !isRejected;
          const isStageRejected = idx === currentIndex && isRejected;

          return (
            <div key={stage.key} className="flex items-start gap-4 relative">
              {/* Connector line */}
              {idx < STAGES.length - 1 && (
                <div
                  className={`absolute left-3.5 top-7 bottom-[-24px] w-0.5 ${
                    isCompleted ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}

              {/* Node indicator */}
              <div className="relative z-10">
                {isCompleted && (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                {isCurrent && (
                  <div className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center ring-4 ring-primary-100 animate-pulse">
                    <Clock className="w-4 h-4" />
                  </div>
                )}
                {isStageRejected && (
                  <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center ring-4 ring-rose-50">
                    <XCircle className="w-4 h-4" />
                  </div>
                )}
                {isUpcoming && (
                  <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-slate-300 text-slate-400 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                  </div>
                )}
              </div>

              {/* Text info */}
              <div className="pt-0.5">
                <p
                  className={`text-sm font-semibold ${
                    isCurrent
                      ? "text-primary-700"
                      : isCompleted
                      ? "text-slate-900"
                      : isStageRejected
                      ? "text-rose-700"
                      : "text-slate-400"
                  }`}
                >
                  {isStageRejected ? "Claim Rejected" : stage.label}
                  {isCurrent && (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-200">
                      In Progress
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isStageRejected ? "Decision finalized with rejection" : stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal layout for dashboard preview
  return (
    <div className="w-full py-4 overflow-x-auto">
      <div className="min-w-[580px] flex items-center justify-between relative px-4">
        {/* Background track line */}
        <div className="absolute left-8 right-8 top-4 h-0.5 bg-slate-200 -z-0" />

        {/* Dynamic progress bar */}
        <div
          className="absolute left-8 top-4 h-0.5 bg-emerald-500 transition-all duration-500 -z-0"
          style={{
            width: `${Math.min(100, Math.max(0, (currentIndex / (STAGES.length - 1)) * 100))}%`,
          }}
        />

        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex && !isRejected;
          const isStageRejected = idx === currentIndex && isRejected;

          return (
            <div
              key={stage.key}
              className="flex flex-col items-center text-center relative z-10 w-24"
            >
              {/* Node */}
              <div className="mb-2">
                {isCompleted && (
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                {isCurrent && (
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center ring-4 ring-primary-100 animate-pulse shadow-sm">
                    <Clock className="w-4 h-4" />
                  </div>
                )}
                {isStageRejected && (
                  <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center ring-4 ring-rose-100 shadow-sm">
                    <XCircle className="w-4 h-4" />
                  </div>
                )}
                {!isCompleted && !isCurrent && !isStageRejected && (
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-300 text-slate-400 flex items-center justify-center shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                  </div>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] font-semibold leading-tight ${
                  isCurrent
                    ? "text-primary-700"
                    : isCompleted
                    ? "text-slate-800"
                    : isStageRejected
                    ? "text-rose-700"
                    : "text-slate-400"
                }`}
              >
                {isStageRejected ? "Rejected" : stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClaimJourney;
