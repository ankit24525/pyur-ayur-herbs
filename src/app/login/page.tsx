"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Phone, ArrowLeft, Loader2 } from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleSendOtp = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to generate OTP.");
        setLoading(false);
        return;
      }

      setSuccessMsg(data.message || "OTP Sent!");
      setOtpSent(true);
      setLoading(false);
    } catch {
      setError("Failed to connect to the server.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Validate phone number format (only for Sign Up)
    if (!isLogin && !isForgotPassword && formData.phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phone)) {
        setError("Please enter a valid 10-digit mobile number.");
        return;
      }
    }

    setLoading(true);

    try {
      if (isForgotPassword) {
        // Reset password flow
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            otp: otpInput,
            newPassword: formData.password
          }),
        });

        const data = await res.json();
        if (!data.success) {
          setError(data.error || "Reset failed. Verify your email.");
          setLoading(false);
          return;
        }

        setSuccessMsg(data.message || "Password updated successfully!");
        setLoading(false);
        setIsForgotPassword(false);
        setOtpSent(false);
        setOtpInput("");
        setIsLogin(true);
        // Prefill email
        setFormData((prev) => ({ ...prev, password: "" }));
        return;
      }

      // Login / Signup flow
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Authentication failed. Try again.");
        setLoading(false);
        return;
      }

      // Success login / signup — session cookie set by server automatically
      // No need to store anything in localStorage
      router.push(redirectUrl);
      setTimeout(() => {
        window.location.reload();
      }, 150);
    } catch (err) {
      setError("Failed to connect to the server.");
      setLoading(false);
    }
  };

  if (isForgotPassword) {
    return (
      <div className="w-full max-w-md bg-white border border-[#ddddd9] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#f8faf1] rounded-full -z-10 opacity-60" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#244f31]/5 rounded-full -z-10 opacity-60" />

        <div className="text-center mb-6">
          <h2 className="text-xl font-black text-[#17231b]">Reset Your Password</h2>
          <p className="text-xs text-gray-500 mt-1">
            {!otpSent 
              ? "Verify your account email address to receive a secure OTP code."
              : "Enter the verification code sent to your email and specify your new password."}
          </p>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-100">
            ✓ {successMsg}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#666666] mb-1">Registered Email *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Mail className="size-4" />
              </span>
              <input
                type="email"
                required
                disabled={otpSent}
                placeholder="e.g. ankit@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-[#ddddd9] outline-none focus:border-[#244f31] bg-[#f8faf1]/20 focus:bg-white transition disabled:opacity-60"
              />
            </div>
          </div>

          {!otpSent ? (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-[#244f31] hover:bg-[#1c3e26] text-white font-black uppercase tracking-wider rounded-xl py-3.5 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Checking account...</span>
                </>
              ) : (
                <span>Send Verification Code</span>
              )}
            </button>
          ) : (
            <>
              <div>
                <label className="block font-bold text-[#666666] mb-1">6-Digit Verification OTP *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Enter 6-digit OTP code"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border border-[#ddddd9] outline-none focus:border-[#244f31] bg-[#f8faf1]/20 focus:bg-white text-center font-mono font-bold tracking-widest text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-[#666666] mb-1">New Secure Password *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Lock className="size-4" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Enter new secure password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-3 py-3 rounded-xl border border-[#ddddd9] outline-none focus:border-[#244f31] bg-[#f8faf1]/20 focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#244f31] hover:bg-[#1c3e26] text-white font-black uppercase tracking-wider rounded-xl py-3.5 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Resetting password...</span>
                  </>
                ) : (
                  <span>Verify OTP & Update Password</span>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={(e) => {
                    setOtpSent(false);
                    setError("");
                    setSuccessMsg("");
                    handleSendOtp(e);
                  }}
                  className="text-gray-500 hover:text-gray-700 font-bold hover:underline text-[10px]"
                >
                  Resend Verification OTP
                </button>
              </div>
            </>
          )}

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setOtpSent(false);
                setOtpInput("");
                setError("");
                setSuccessMsg("");
              }}
              className="text-[#244f31] hover:underline font-bold text-xs"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white border border-[#ddddd9] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#f8faf1] rounded-full -z-10 opacity-60" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#244f31]/5 rounded-full -z-10 opacity-60" />

      {/* Tabs */}
      <div className="flex border-b border-[#ddddd9] mb-6 text-xs font-black uppercase tracking-wider">
        <button
          type="button"
          onClick={() => {
            setIsLogin(true);
            setIsForgotPassword(false);
            setError("");
            setSuccessMsg("");
          }}
          className={`w-1/2 pb-3 text-center transition ${
            isLogin
              ? "border-b-2 border-[#244f31] text-[#244f31]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => {
            setIsLogin(false);
            setIsForgotPassword(false);
            setError("");
            setSuccessMsg("");
          }}
          className={`w-1/2 pb-3 text-center transition ${
            !isLogin
              ? "border-b-2 border-[#244f31] text-[#244f31]"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Sign Up
        </button>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-black text-[#17231b]">
          {isLogin ? "Welcome Back to Pyur Ayur" : "Begin Your Wellness Journey"}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {isLogin
            ? "Sign in to manage your orders, track shippings, and redeem Pyur Coins."
            : "Register now to save address defaults, check out faster, and earn wellness coins."}
        </p>
      </div>

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-100">
          ✓ {successMsg}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {!isLogin && (
          <div>
            <label className="block font-bold text-[#666666] mb-1">Full Name *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <User className="size-4" />
              </span>
              <input
                type="text"
                required
                placeholder="e.g. Ankit Pandey"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-[#ddddd9] outline-none focus:border-[#244f31] bg-[#f8faf1]/20 focus:bg-white transition"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block font-bold text-[#666666] mb-1">Email Address *</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Mail className="size-4" />
            </span>
            <input
              type="email"
              required
              placeholder="e.g. ankit@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-9 pr-3 py-3 rounded-xl border border-[#ddddd9] outline-none focus:border-[#244f31] bg-[#f8faf1]/20 focus:bg-white transition"
            />
          </div>
        </div>

        {!isLogin && (
          <div>
            <label className="block font-bold text-[#666666] mb-1">Phone Number (Optional)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Phone className="size-4" />
              </span>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-9 pr-3 py-3 rounded-xl border border-[#ddddd9] outline-none focus:border-[#244f31] bg-[#f8faf1]/20 focus:bg-white transition"
              />
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block font-bold text-[#666666]">Password *</label>
            {isLogin && (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setError("");
                  setSuccessMsg("");
                  setFormData((prev) => ({ ...prev, password: "" }));
                }}
                className="text-[#244f31] hover:underline font-bold text-[10px]"
              >
                Forgot Password?
              </button>
            )}
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Lock className="size-4" />
            </span>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-9 pr-3 py-3 rounded-xl border border-[#ddddd9] outline-none focus:border-[#244f31] bg-[#f8faf1]/20 focus:bg-white transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#244f31] hover:bg-[#1c3e26] text-white font-black uppercase tracking-wider rounded-xl py-3.5 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Verifying credentials...</span>
            </>
          ) : (
            <span>{isLogin ? "Sign In" : "Register Account"}</span>
          )}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f8faf1] flex flex-col">
      {/* Top minimal header */}
      <header className="bg-white border-b border-[#ddddd9] py-4 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#244f31]">
          <ArrowLeft className="size-4" />
          <span>Back to Store</span>
        </Link>
        <span className="text-xs font-bold text-gray-400">Pure Ayur Herbs Wellness</span>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(#244f31_1px,transparent_1px)] [background-size:24px_24px] bg-opacity-[0.02]">
        <Suspense fallback={
          <div className="flex items-center justify-center p-8 bg-white rounded-3xl border border-[#ddddd9] shadow-md w-full max-w-sm">
            <Loader2 className="size-6 text-[#244f31] animate-spin" />
          </div>
        }>
          <LoginFormContent />
        </Suspense>
      </main>

      {/* Mini Footer */}
      <footer className="py-4 border-t border-[#ddddd9] text-center text-[10px] text-gray-400 bg-white">
        © {new Date().getFullYear()} Pyur Ayur Herbs. 100% Ministry of AYUSH Certified.
      </footer>
    </div>
  );
}
