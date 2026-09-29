import React from "react";
import { Badge } from "./Badge";

export const StatusBadge = ({ status, size = "md" }) => {
  const statusConfig = {
    // Claims statuses
    submitted: { label: "Submitted", variant: "primary" },
    documents_under_review: { label: "Docs Under Review", variant: "amber" },
    documents_verified: { label: "Docs Verified", variant: "emerald" },
    under_investigation: { label: "Under Investigation", variant: "amber" },
    pending_approval: { label: "Pending Approval", variant: "purple" },
    approved: { label: "Approved", variant: "emerald" },
    rejected: { label: "Rejected", variant: "rose" },
    settlement_processing: { label: "Settlement Processing", variant: "purple" },
    settled: { label: "Settled", variant: "emerald" },
    closed: { label: "Closed", variant: "slate" },

    // Policy statuses
    active: { label: "Active", variant: "emerald" },
    inactive: { label: "Inactive", variant: "slate" },
    expired: { label: "Expired", variant: "rose" },
    cancelled: { label: "Cancelled", variant: "slate" },

    // Document statuses
    pending: { label: "Pending", variant: "amber" },
    verified: { label: "Verified", variant: "emerald" },
  };

  const normalized = (status || "").toLowerCase();
  const config = statusConfig[normalized] || {
    label: (status || "Unknown").replace(/_/g, " "),
    variant: "slate",
  };

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
