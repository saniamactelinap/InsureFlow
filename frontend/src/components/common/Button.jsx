import React from "react";
import LoadingSpinner from "./LoadingSpinner";

export const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  leftIcon = null,
  rightIcon = null,
  onClick,
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const variantClasses = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow focus-visible:ring-primary-600 border border-transparent",
    secondary:
      "bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow focus-visible:ring-slate-900 border border-transparent",
    outline:
      "bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 hover:border-slate-400 focus-visible:ring-primary-600",
    ghost:
      "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400 border border-transparent",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 shadow-sm focus-visible:ring-rose-600 border border-transparent",
    emerald:
      "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm focus-visible:ring-emerald-600 border border-transparent",
  };

  const sizeClasses = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
    lg: "text-base px-6 py-3 gap-2.5",
  };

  const spinnerColor =
    variant === "outline" || variant === "ghost" ? "primary" : "white";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size={size === "lg" ? "md" : "sm"} color={spinnerColor} />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!loading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;
