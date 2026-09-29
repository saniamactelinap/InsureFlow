import React from "react";

export const SectionHeading = ({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className = "",
}) => {
  const alignClasses = {
    center: "text-center mx-auto items-center",
    left: "text-left items-start",
  };

  return (
    <div className={`max-w-3xl flex flex-col ${alignClasses[align]} mb-12 lg:mb-16 ${className}`}>
      {eyebrow && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-primary-700 bg-primary-50 border border-primary-100 mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
