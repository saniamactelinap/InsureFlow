import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const Input = ({
  label,
  id,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  helperText,
  leftIcon,
  required = false,
  disabled = false,
  className = "",
  autoComplete,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name;
  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={actualType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          className={`block w-full rounded-lg text-sm text-slate-900 border transition-all duration-150 py-2.5 ${
            leftIcon ? "pl-10" : "pl-3.5"
          } ${isPassword ? "pr-10" : "pr-3.5"} ${
            error
              ? "border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20"
              : "border-slate-200 hover:border-slate-300 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 bg-white"
          } disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-rose-600 font-medium">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${inputId}-helper`} className="mt-1 text-xs text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
