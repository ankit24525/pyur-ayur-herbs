"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Mail,
  Lock,
  Phone,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

const isPasswordStrong = (password: string) => {
  if (password.length < 8)
    return { valid: false, error: "Password must be at least 8 characters long." };
  if (!/[A-Z]/.test(password))
    return { valid: false, error: "Password must contain at least one uppercase letter (A-Z)." };
  if (!/[a-z]/.test(password))
    return { valid: false, error: "Password must contain at least one lowercase letter (a-z)." };
  if (!/[0-9]/.test(password))
    return { valid: false, error: "Password must contain at least one digit (0-9)." };
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password))
    return { valid: false, error: "Password must contain at least one special character." };
  return { valid: true };
};

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  // Login Mode: "phone" (default for mobile commerce) or "email"
  const [authMode, setAuthMode] = useState<"phone" | "email">("phone");

  // Phone OTP States
  const [phone, setPhone] = useState("");
  const [phoneName, setPhoneName] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Email/Password States
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  // Common Feedback States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Resend Countdown Timer for Phone OTP
  useEffect(() => {
    if (phoneOtpSent && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [phoneOtpSent, resendTimer]);

  // Setup Firebase invisible reCAPTCHA
  const getRecaptchaVerifier = () => {
    if (typeof window === "undefined") return null;
    if ((window as any).recaptchaVerifier) {
      return (window as any).recaptchaVerifier;
    }
    const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => {},
      "expired-callback": () => {
        setError("reCAPTCHA expired. Please try requesting OTP again.");
      },
    });
    (window as any).recaptchaVerifier = verifier;
    return verifier;
  };

  // --- Phone OTP Handlers ---
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const clean = phone.replace(/\D/g, "").slice(-10);
    if (clean.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      const appVerifier = getRecaptchaVerifier();
      const formattedPhone = `+91${clean}`;
      console.log(`[Firebase Phone Auth]: Requesting OTP for ${formattedPhone}`);

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setPhoneOtpSent(true);
      setResendTimer(30);
      setSuccessMsg(`6-digit verification code sent to ${formattedPhone}`);
    } catch (err: any) {
      console.error("[Firebase Phone Auth Error]:", err);
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch {}
        (window as any).recaptchaVerifier = null;
      }

      if (err.code === "auth/invalid-phone-number") {
        setError("Invalid phone number format. Please check and try again.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many requests from this number. Please wait a few minutes.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError(
          "Domain not authorized. Please ensure your domain is added under Firebase Console > Authentication > Settings > Authorized Domains."
        );
      } else {
        setError(err.message || "Failed to send verification code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!confirmationResult) {
      setError("Please request an OTP first.");
      return;
    }

    if (phoneOtp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(phoneOtp.trim());
      const firebaseUser = userCredential.user;

      // Sync user session with our backend database
      const res = await fetch("/api/auth/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: firebaseUser.phoneNumber || phone,
          firebaseUid: firebaseUser.uid,
          name: phoneName.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to establish session.");
        setLoading(false);
        return;
      }

      // Store in localStorage for instant profile synchronization
      try {
        localStorage.setItem("pyur_user", JSON.stringify(data.user));
        localStorage.setItem("pyur_last_activity", Date.now().toString());
        window.dispatchEvent(new Event("pyur_auth_change"));
      } catch {}

      setSuccessMsg("Signed in successfully! Redirecting...");
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 500);
    } catch (err: any) {
      console.error("[OTP Verification Error]:", err);
      if (err.code === "auth/invalid-verification-code") {
        setError("Incorrect OTP code. Please check the code and try again.");
      } else if (err.code === "auth/code-expired") {
        setError("The OTP code has expired. Please click Resend Code.");
      } else {
        setError(err.message || "Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Email / Password Handlers ---
  const handleSendEmailOtp = async (e: React.MouseEvent) => {
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

      setSuccessMsg(data.message || "OTP Sent to your email!");
      setEmailOtpSent(true);
      setLoading(false);
    } catch {
      setError("Failed to connect to the server.");
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isLogin && !isForgotPassword && formData.phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phone)) {
        setError("Please enter a valid 10-digit mobile number.");
        return;
      }
    }

    if (!isLogin || isForgotPassword) {
      const strength = isPasswordStrong(formData.password);
      if (!strength.valid) {
        setError(strength.error || "Password is not strong enough.");
        return;
      }
    }

    setLoading(true);

    try {
      if (isForgotPassword) {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            otp: emailOtpInput,
            newPassword: formData.password,
          }),
        });

        const data = await res.json();
        if (!data.success) {
          setError(data.error || "Failed to reset password.");
          setLoading(false);
          return;
        }

        setSuccessMsg("Password reset successfully! Please sign in with your new password.");
        setIsForgotPassword(false);
        setEmailOtpSent(false);
        setEmailOtpInput("");
        setFormData((prev) => ({ ...prev, password: "" }));
        setLoading(false);
        return;
      }

      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Authentication failed. Try again.");
        setLoading(false);
        return;
      }

      if (data.user && typeof window !== "undefined") {
        try {
          localStorage.setItem("pyur_user", JSON.stringify(data.user));
          localStorage.setItem("pyur_last_activity", Date.now().toString());
          window.dispatchEvent(new Event("pyur_auth_change"));
        } catch {}
      }
      window.location.href = redirectUrl;
    } catch {
      setError("Failed to connect to the server.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-[#ddddd9] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#f8faf1] rounded-full -z-10 opacity-60" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#244f31]/5 rounded-full -z-10 opacity-60" />

      {/* Hidden container for invisible reCAPTCHA */}
      <div id="recaptcha-container" />

      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-1 rounded-full bg-white shadow-lg border border-[#244f31]/20 mb-3">
          <Image
            src="/brand/pure-ayur-logo.png"
            alt="Pure Ayur Herbs Logo"
            width={80}
            height={80}
            className="size-20 rounded-full object-cover"
            priority
          />
        </div>
        <h2 className="text-xl font-black text-[#17231b]">
          {authMode === "phone"
            ? "Sign in to Pure Ayur Herbs"
            : isLogin
            ? "Welcome Back to Pure Ayur"
            : "Begin Your Wellness Journey"}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {authMode === "phone"
            ? "Login or register instantly using your phone number"
            : isLogin
            ? "Sign in to manage orders, tracking, and Pure Coins"
            : "Register now to check out faster and earn wellness coins"}
        </p>
      </div>

      {/* Session Expired Notice */}
      {searchParams.get("expired") === "1" && !error && !successMsg && (
        <div className="mb-4 p-3.5 bg-amber-50 text-amber-900 text-xs font-semibold rounded-xl border border-amber-200 flex items-center gap-2.5">
          <span className="text-base">⏰</span>
          <span>Your session expired after 15 minutes of inactivity. Please sign in again.</span>
        </div>
      )}

      {/* Alerts */}
      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-100 flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100">
          ⚠️ {error}
        </div>
      )}

      {/* ================= MODE 1: PHONE OTP LOGIN ================= */}
      {authMode === "phone" ? (
        <div>
          {!phoneOtpSent ? (
            /* Step 1: Phone Number Input */
            <form onSubmit={handleSendPhoneOtp} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#666666] mb-1">
                  Mobile Number *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 flex items-center text-gray-600 font-bold text-xs border-r pr-2 border-gray-200">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-20 pr-3 py-3 rounded-xl border border-[#ddddd9] outline-none focus:border-[#244f31] bg-[#f8faf1]/20 focus:bg-white text-sm font-semibold tracking-wider transition"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  We'll send a 6-digit verification code to this mobile number.
                </p>
              </div>

              <div>
                <label className="block font-bold text-[#666666] mb-1">
                  Your Name (Optional)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <User className="size-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Ankit Pandey"
                    value={phoneName}
                    onChange={(e) => setPhoneName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#ddddd9] outline-none focus:border-[#244f31] bg-[#f8faf1]/20 focus:bg-white transition text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.replace(/\D/g, "").length !== 10}
                className="w-full bg-[#244f31] hover:bg-[#1c3e26] text-white font-black uppercase tracking-wider rounded-xl py-3.5 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="size-4" />
                    <span>Get Verification OTP</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-1">
                <ShieldCheck className="size-3.5 text-[#244f31]" />
                <span>Protected by Google Firebase Security</span>
              </div>
            </form>
          ) : (
            /* Step 2: 6-Digit OTP Verification */
            <form onSubmit={handleVerifyPhoneOtp} className="space-y-4 text-xs">
              <div className="bg-[#f8faf1] p-3 rounded-xl border border-[#ddddd9] text-center">
                <p className="text-xs text-gray-600">
                  Enter the 6-digit code sent to{" "}
                  <strong className="text-[#17231b]">+91 {phone}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPhoneOtpSent(false);
                    setPhoneOtp("");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="text-[#244f31] hover:underline font-bold text-[11px] mt-1"
                >
                  Change Number
                </button>
              </div>

              <div>
                <label className="block font-bold text-[#666666] mb-1 text-center">
                  6-Digit OTP Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  autoFocus
                  placeholder="------"
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3 py-3 rounded-xl border border-[#ddddd9] outline-none focus:border-[#244f31] bg-[#f8faf1]/20 focus:bg-white text-center font-mono font-black text-xl tracking-[0.4em] transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading || phoneOtp.length !== 6}
                className="w-full bg-[#244f31] hover:bg-[#1c3e26] text-white font-black uppercase tracking-wider rounded-xl py-3.5 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Verifying code...</span>
                  </>
                ) : (
                  <span>Verify OTP & Login</span>
                )}
              </button>

              <div className="text-center pt-1">
                {resendTimer > 0 ? (
                  <span className="text-[11px] text-gray-400 font-medium">
                    Resend code in <strong className="text-[#17231b]">{resendTimer}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendPhoneOtp}
                    className="text-[#244f31] hover:underline font-bold text-[11px]"
                  >
                    Resend Verification OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Switch to Email Password */}
          <div className="mt-6 pt-4 border-t border-[#ddddd9] text-center">
            <button
              type="button"
              onClick={() => {
                setAuthMode("email");
                setError("");
                setSuccessMsg("");
              }}
              className="text-xs font-bold text-gray-600 hover:text-[#244f31] transition"
            >
              Or sign in with Email & Password →
            </button>
          </div>
        </div>
      ) : (
        /* ================= MODE 2: EMAIL / PASSWORD ================= */
        <div>
          {/* Tabs */}
          <div className="flex border-b border-[#ddddd9] mb-5 text-xs font-black uppercase tracking-wider">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setIsForgotPassword(false);
                setError("");
                setSuccessMsg("");
              }}
              className={`w-1/2 pb-2.5 text-center transition ${
                isLogin
                  ? "border-b-2 border-[#244f31] text-[#244f31]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setIsForgotPassword(false);
                setError("");
                setSuccessMsg("");
              }}
              className={`w-1/2 pb-2.5 text-center transition ${
                !isLogin
                  ? "border-b-2 border-[#244f31] text-[#244f31]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Create Account
            </button>
          </div>

          {isForgotPassword ? (
            /* Forgot Password Sub-flow */
            <form onSubmit={handleEmailSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#666666] mb-1">Registered Email *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Mail className="size-4" />
                  </span>
                  <input
                    type="email"
                    required
                    disabled={emailOtpSent}
                    placeholder="e.g. ankit@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-3 rounded-xl border border-[#ddddd9] outline-none focus:border-[#244f31] bg-[#f8faf1]/20 focus:bg-white transition disabled:opacity-60"
                  />
                </div>
              </div>

              {!emailOtpSent ? (
                <button
                  type="button"
                  onClick={handleSendEmailOtp}
                  disabled={loading}
                  className="w-full bg-[#244f31] hover:bg-[#1c3e26] text-white font-black uppercase tracking-wider rounded-xl py-3.5 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-75"
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
                    <label className="block font-bold text-[#666666] mb-1">
                      6-Digit Email OTP *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="Enter 6-digit OTP code"
                      value={emailOtpInput}
                      onChange={(e) => setEmailOtpInput(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-[#ddddd9] outline-none focus:border-[#244f31] bg-[#f8faf1]/20 focus:bg-white text-center font-mono font-bold tracking-widest text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#666666] mb-1">
                      New Secure Password *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <Lock className="size-4" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Enter new password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-9 pr-10 py-3 rounded-xl border border-[#ddddd9] outline-none focus:border-[#244f31] bg-[#f8faf1]/20 focus:bg-white transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#244f31]"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#244f31] hover:bg-[#1c3e26] text-white font-black uppercase tracking-wider rounded-xl py-3.5 transition shadow-md flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Updating password...</span>
                      </>
                    ) : (
                      <span>Verify OTP & Update Password</span>
                    )}
                  </button>
                </>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setEmailOtpSent(false);
                    setEmailOtpInput("");
                    setError("");
                  }}
                  className="text-[#244f31] hover:underline font-bold text-xs"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            /* Standard Email Sign In / Sign Up Form */
            <form onSubmit={handleEmailSubmit} className="space-y-4 text-xs">
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
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-10 py-3 rounded-xl border border-[#ddddd9] outline-none focus:border-[#244f31] bg-[#f8faf1]/20 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#244f31] transition"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#244f31] hover:bg-[#1c3e26] text-white font-black uppercase tracking-wider rounded-xl py-3.5 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>{isLogin ? "Sign In" : "Register Account"}</span>
                )}
              </button>
            </form>
          )}

          {/* Switch back to Phone OTP */}
          <div className="mt-6 pt-4 border-t border-[#ddddd9] text-center">
            <button
              type="button"
              onClick={() => {
                setAuthMode("phone");
                setError("");
                setSuccessMsg("");
              }}
              className="text-xs font-bold text-[#244f31] hover:underline flex items-center justify-center gap-1.5 mx-auto"
            >
              <Smartphone className="size-3.5" />
              <span>Sign in with Mobile OTP instead (Instant)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f8faf1] flex flex-col">
      {/* Top minimal header */}
      <header className="bg-white border-b border-[#ddddd9] py-4 px-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#244f31]"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Store</span>
        </Link>
        <span className="text-xs font-bold text-gray-400">Pure Ayur Herbs Wellness</span>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(#244f31_1px,transparent_1px)] [background-size:24px_24px] bg-opacity-[0.02]">
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8 bg-white rounded-3xl border border-[#ddddd9] shadow-md w-full max-w-sm">
              <Loader2 className="size-6 text-[#244f31] animate-spin" />
            </div>
          }
        >
          <LoginFormContent />
        </Suspense>
      </main>

      {/* Mini Footer */}
      <footer className="py-4 border-t border-[#ddddd9] text-center text-[10px] text-gray-400 bg-white">
        © {new Date().getFullYear()} Pure Ayur Herbs. 100% Ministry of AYUSH Certified.
      </footer>
    </div>
  );
}
