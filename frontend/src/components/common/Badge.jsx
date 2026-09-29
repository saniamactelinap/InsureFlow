import React from "react";

export const Badge = ({
  children,
  variant = "slate",
  size = "md",
  className = "",
  icon = null,
}) => {
  const variantClasses = {
    primary: "bg-primary-50 text-primary-700 border-primary-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5 font-medium",
    md: "text-xs px-2.5 py-1 font-semibold",
    lg: "text-sm px-3 py-1.5 font-semibold",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${
        variantClasses[variant] || variantClasses.slate
      } ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {icon && <span className="w-3.5 h-3.5 flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const statusConfig = {
    submitted: { label: "Submitted", variant: "primary" },
    documents_verified: { label: "Docs Verified", variant: "emerald" },
    under_investigation: { label: "Under Investigation", variant: "amber" },
    approved: { label: "Approved", variant: "emerald" },
    rejected: { label: "Rejected", variant: "rose" },
    settlement_processing: { label: "Settlement Processing", variant: "purple" },
    settled: { label: "Settled", variant: "emerald" },
    closed: { label: "Closed", variant: "slate" },
  };

  const config = statusConfig[status] || {
    label: (status || "Unknown").replace(/_/g, " "),
    variant: "slate",
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default Badge;
