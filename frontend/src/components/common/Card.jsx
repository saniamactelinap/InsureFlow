import React from "react";

export const Card = ({
  children,
  className = "",
  hover = false,
  padding = "md",
  ...props
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/80 shadow-card ${
        hover
          ? "transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-slate-300"
          : ""
      } ${paddingClasses[padding] || paddingClasses.md} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "" }) => (
  <div className={`border-b border-slate-100 pb-4 mb-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-slate-900 ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-slate-500 mt-1 ${className}`}>{children}</p>
);

export default Card;
