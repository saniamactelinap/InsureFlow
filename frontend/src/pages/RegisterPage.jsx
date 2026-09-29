import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";
import Input from "../components/common/Input";

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "customer",
  });
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    // Validate inputs
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setFormError("Please fill in your name, email, and password.");
      return;
    }

    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    setSubmitting(true);
    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone.trim() || undefined,
      role: formData.role,
    });
    setSubmitting(false);

    if (result.success) {
      setSuccessMessage("Account created successfully! Redirecting to sign in...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      setFormError(result.error || "Registration failed. Please verify your details.");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* LEFT SIDE: Brand & Value Proposition */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Insure<span className="text-primary-400">Flow</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-400">
            <span>Fast Account Setup</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Join the digital insurance platform trusted for speed and clarity.
          </h2>

          <p className="text-slate-400 text-sm leading-relaxed">
            Create an account to submit claims, upload verification documentation,
            and monitor settlement progress with instant status alerts.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Transparent claim verification and live tracking</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Direct communication with surveyors and claim officers</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Permanent audit history for complete compliance</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          &copy; {new Date().getFullYear()} InsureFlow Platform. Strict Role Governance.
        </div>
      </div>

      {/* RIGHT SIDE: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-md w-full space-y-7">
          <div className="lg:hidden text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Insure<span className="text-primary-600">Flow</span>
              </span>
            </Link>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Get started with InsureFlow in less than a minute.
            </p>
          </div>

          {formError && (
            <div
              role="alert"
              className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-150"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{formError}</div>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              id="name"
              name="name"
              type="text"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Input
              label="Phone Number (Optional)"
              id="phone"
              name="phone"
              type="tel"
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
              leftIcon={<Phone className="w-4 h-4" />}
            />

            {/* Role Selection (Restricted to public roles) */}
            <div className="w-full">
              <label
                htmlFor="role"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Account Type <span className="text-rose-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full rounded-lg text-sm text-slate-900 border border-slate-200 hover:border-slate-300 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 bg-white py-2.5 px-3.5"
              >
                <option value="customer">Policyholder (Customer)</option>
                <option value="officer">Claims Officer</option>
                <option value="surveyor">Field Surveyor</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                Note: Manager &amp; Admin accounts are provisioned by enterprise administrators.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              className="w-full justify-center shadow-md shadow-primary-600/20 mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-xs text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-700 underline underline-offset-4"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
