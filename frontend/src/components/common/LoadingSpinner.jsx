import React from "react";

export const LoadingSpinner = ({ size = "md", color = "primary", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
    xl: "w-12 h-12 border-4",
  };

  const colorClasses = {
    primary: "border-primary-200 border-t-primary-600",
    white: "border-white/30 border-t-white",
    slate: "border-slate-200 border-t-slate-700",
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`inline-block rounded-full animate-spin ${
        sizeClasses[size] || sizeClasses.md
      } ${colorClasses[color] || colorClasses.primary} ${className}`}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
