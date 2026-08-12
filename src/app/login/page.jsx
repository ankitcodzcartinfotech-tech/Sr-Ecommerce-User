"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "@/utils/toast";
import { loginUser, registerUser, verifyOTP, resendOTP } from "@/Api/AllApi";
import { playSuccess, playNotification, playOrder } from "@/utils/notificationSound";
import ValidatedInput from "@/components/common/ValidatedInput";
import { validateField } from "@/utils/validation";

/* ─── helpers ─────────────────────────────────────────────── */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ─── Redirect Helper ─────────────────────────────────────── */
function getRedirectPath() {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
      return redirect;
    }
  }
  return "/";
}

/* ─── Removed FormField (Using ValidatedInput) ────────────── */

/* ─── OTP Input Field ─────────────────────────────────────── */
import { useRef } from "react";

function OtpField({ value, onChange, error }) {
  const inputs = useRef([]);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;
    
    // Only take the last typed character in case they type fast
    const char = val[val.length - 1];
    const newOtp = value.split("");
    newOtp[index] = char;
    const str = newOtp.join("").slice(0, 6);
    onChange(str);

    if (index < 5 && char) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = value.split("");
      if (!newOtp[index] && index > 0) {
        inputs.current[index - 1]?.focus();
      } else {
        newOtp[index] = "";
        onChange(newOtp.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      onChange(pastedData);
      const focusIndex = Math.min(pastedData.length, 5);
      inputs.current[focusIndex]?.focus();
    }
  };

  return (
    <div>
      <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-600 text-center">
        Enter 6-digit OTP
      </label>
      <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            ref={(el) => (inputs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ""}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`h-[50px] w-[40px] sm:h-[56px] sm:w-[48px] text-center text-xl font-semibold rounded-[12px] border focus:outline-none focus:ring-2 transition-all ${
              error ? "border-rose-400 bg-rose-50 focus:ring-rose-300/30 text-rose-600" : "border-stone-200 bg-white focus:ring-(--gold)/30 focus:border-(--gold) text-stone-900"
            }`}
          />
        ))}
      </div>
      {error && <p className="mt-2.5 text-center text-xs text-rose-500">{error}</p>}
    </div>
  );
}

/* ─── Login form ──────────────────────────────────────────── */
function LoginForm({ onSwitch }) {
  const [step,          setStep]        = useState("phone"); // "phone" | "otp"
  const [mobileNumber,  setMobileNumber]= useState("");
  const [otp,           setOtp]         = useState("");
  const [touched,       setTouched]     = useState({});
  const [submitting,    setSubmitting]  = useState(false);
  const [resending,     setResending]   = useState(false);
  const [resendTimer,   setResendTimer] = useState(0);
  const [expiryTimer,   setExpiryTimer] = useState(0);

  const mobileErr = validateField("mobileNumber", mobileNumber);
  const otpErr    = step === "otp" ? validateField("otp", otp) : "";

  useEffect(() => {
    let interval;
    if (step === "otp") {
      interval = setInterval(() => {
        setResendTimer((t) => Math.max(0, t - 1));
        setExpiryTimer((t) => Math.max(0, t - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  function touch(field) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    setTouched({ mobileNumber: true });
    if (mobileErr) return;
    setSubmitting(true);
    try {
      await loginUser({ mobileNumber });
      toast.success("OTP sent to your mobile number");
      setStep("otp");
      setOtp("");
      setTouched({});
      setResendTimer(30);
      setExpiryTimer(300);
    } catch (err) {
      toast.error(err?.message || "Account not found. Please register first.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setTouched({ otp: true });
    if (otpErr) return;
    setSubmitting(true);
    try {
      const data = await verifyOTP({ mobileNumber, otp });
      if (data?.token) {
        localStorage.setItem("userToken", data.token);
        playSuccess();
        toast.success("Welcome back!");
        setTimeout(() => {
          window.location.href = getRedirectPath();
        }, 1500);
      }
    } catch (err) {
      toast.error(err?.message || "Invalid OTP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendOtp() {
    setResending(true);
    try {
      await resendOTP({ mobileNumber });
      toast.success("OTP resent successfully!");
      setResendTimer(30);
      setExpiryTimer(300);
    } catch (err) {
      toast.error(err?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyOtp} noValidate className="space-y-6">
      <div>
          {/* Modern SMS Preview Card */}
          <div className="mb-5 rounded-[18px] bg-gradient-to-br from-stone-50 to-stone-100 border border-stone-200 p-4">
            {/* Header row */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-white text-xs font-bold shrink-0">
                K
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-stone-800 uppercase tracking-[0.15em]">KESHRAG</p>
                <p className="text-[10px] text-stone-400">+91 {mobileNumber}</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] font-semibold text-emerald-700 uppercase tracking-wide">Sent</span>
              </div>
            </div>

            {/* SMS Bubble */}
            {/* <div className="rounded-[12px] rounded-tl-[4px] bg-white border border-stone-200/80 px-3.5 py-3 shadow-sm">
              <p className="text-[11px] leading-[1.7] text-stone-600">
                Your <span className="font-semibold text-stone-900">Keshrag</span> login code is:{" "}
                <span className="inline-block font-mono font-bold text-stone-900 tracking-[0.15em] bg-stone-100 px-1.5 py-0.5 rounded-md">_ _ _ _ _ _</span>
              </p>
            </div> */}
          </div>

          <OtpField value={otp} onChange={setOtp} error={touched.otp ? otpErr : ""} />

          {expiryTimer > 0 ? (
            <p className="mt-3 text-center text-xs text-stone-500">
              Code expires in <span className="font-semibold text-(--gold)">{formatTime(expiryTimer)}</span>
            </p>
          ) : (
            <p className="mt-3 text-center text-xs text-rose-500 font-medium">OTP has expired. Please resend.</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={submitting}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-stone-900 text-sm font-semibold text-white transition-all hover:bg-(--gold) disabled:opacity-60 cursor-not-allowed"
        >
          {submitting ? <><Loader2 size={16} className="animate-spin" /> Verifying…</> : "Verify & Log In"}
        </button>

        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending || resendTimer > 0}
            className={`text-sm font-semibold transition-colors ${resendTimer > 0 ? 'text-stone-400 cursor-not-allowed' : 'text-(--gold) hover:underline cursor-pointer'}`}
          >
            {resending ? "Resending..." : resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
          </button>
          <button
            type="button"
            onClick={() => setStep("phone")}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
          >
            <ArrowLeft size={14} /> Change mobile number
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendOtp} noValidate className="space-y-4">
      <ValidatedInput
        label="Mobile Number"
        type="tel"
        validationType="mobileNumber"
        value={mobileNumber}
        onChange={(e) => setMobileNumber(e.target.value)}
        onBlur={() => touch("mobileNumber")}
        touched={touched.mobileNumber}
        error={touched.mobileNumber ? mobileErr : ""}
        placeholder="10-digit mobile number"
        required
      />
      
      <button
        type="submit"
        disabled={submitting}
        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-stone-900 text-sm font-semibold text-white transition-all hover:bg-(--gold) disabled:opacity-60 cursor-not-allowed"
      >
        {submitting ? <><Loader2 size={16} className="animate-spin" /> Sending OTP…</> : "Log In via OTP"}
      </button>

      <p className="text-center text-sm text-stone-500">
        Don&apos;t have an account?{" "}
        <button type="button" onClick={onSwitch} className="font-semibold text-(--gold) hover:underline cursor-pointer">
          Sign up
        </button>
      </p>
    </form>
  );
}

/* ─── Register form ───────────────────────────────────────── */
function RegisterForm({ onSwitch }) {
  const [step,          setStep]        = useState("details"); // "details" | "otp"
  const [name,          setName]        = useState("");
  const [mobileNumber,  setMobileNumber]= useState("");
  const [otp,           setOtp]         = useState("");
  const [agree,         setAgree]       = useState(false);
  const [touched,       setTouched]     = useState({});
  const [submitting,    setSubmitting]  = useState(false);
  const [resending,     setResending]   = useState(false);
  const [resendTimer,   setResendTimer] = useState(0);
  const [expiryTimer,   setExpiryTimer] = useState(0);

  const nameErr   = validateField("name", name);
  const mobileErr = validateField("mobileNumber", mobileNumber);
  const agreeErr  = !agree ? "You must accept the terms" : "";
  const otpErr    = step === "otp" ? validateField("otp", otp) : "";

  useEffect(() => {
    let interval;
    if (step === "otp") {
      interval = setInterval(() => {
        setResendTimer((t) => Math.max(0, t - 1));
        setExpiryTimer((t) => Math.max(0, t - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  function touch(field) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    setTouched({ name: true, mobileNumber: true, agree: true });
    if (nameErr || mobileErr || agreeErr) return;
    setSubmitting(true);
    try {
      await registerUser({ name, mobileNumber });
      toast.success("OTP sent to your mobile number");
      setStep("otp");
      setOtp("");
      setTouched({});
      setResendTimer(30);
      setExpiryTimer(300);
    } catch (err) {
      toast.error(err?.message || "Could not register. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setTouched({ otp: true });
    if (otpErr) return;
    setSubmitting(true);
    try {
      const data = await verifyOTP({ mobileNumber, otp });
      if (data?.token) {
        localStorage.setItem("userToken", data.token);
        playSuccess();
        toast.success("Welcome to Keshrag!");
        setTimeout(() => {
          window.location.href = getRedirectPath();
        }, 1500);
      }
    } catch (err) {
      toast.error(err?.message || "Invalid OTP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendOtp() {
    setResending(true);
    try {
      await resendOTP({ mobileNumber });
      toast.success("OTP resent successfully!");
      setResendTimer(30);
      setExpiryTimer(300);
    } catch (err) {
      toast.error(err?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyOtp} noValidate className="space-y-6">
        <div>
          {/* Modern SMS Preview Card */}
          <div className="mb-5 rounded-[18px] bg-gradient-to-br from-stone-50 to-stone-100 border border-stone-200 p-4">
            {/* Header row */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-white text-xs font-bold shrink-0">
                K
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-stone-800 uppercase tracking-[0.15em]">KESHRAG</p>
                <p className="text-[10px] text-stone-400">+91 {mobileNumber}</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] font-semibold text-emerald-700 uppercase tracking-wide">Sent</span>
              </div>
            </div>
            {/* SMS Bubble */}
            <div className="rounded-[12px] rounded-tl-[4px] bg-white border border-stone-200/80 px-3.5 py-3 shadow-sm">
              <p className="text-[11px] leading-[1.7] text-stone-600">
                Your <span className="font-semibold text-stone-900">Keshrag</span> verification code is:{" "}
                <span className="inline-block font-mono font-bold text-stone-900 tracking-[0.15em] bg-stone-100 px-1.5 py-0.5 rounded-md">_ _ _ _ _ _</span>
              </p>
            </div>
          </div>

          <OtpField value={otp} onChange={setOtp} error={touched.otp ? otpErr : ""} />

          {expiryTimer > 0 ? (
            <p className="mt-3 text-center text-xs text-stone-500">
              Code expires in <span className="font-semibold text-(--gold)">{formatTime(expiryTimer)}</span>
            </p>
          ) : (
            <p className="mt-3 text-center text-xs text-rose-500 font-medium">OTP has expired. Please resend.</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={submitting}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-stone-900 text-sm font-semibold text-white transition-all hover:bg-(--gold) disabled:opacity-60 cursor-not-allowed"
        >
          {submitting ? <><Loader2 size={16} className="animate-spin" /> Verifying…</> : "Verify & Create Account"}
        </button>

        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending || resendTimer > 0}
            className={`text-sm font-semibold transition-colors ${resendTimer > 0 ? 'text-stone-400 cursor-not-allowed' : 'text-(--gold) hover:underline cursor-pointer'}`}
          >
            {resending ? "Resending..." : resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
          </button>
          <button
            type="button"
            onClick={() => setStep("details")}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
          >
            <ArrowLeft size={14} /> Change details
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendOtp} noValidate className="space-y-4">
      <ValidatedInput
        label="Full Name"
        type="text"
        validationType="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => touch("name")}
        touched={touched.name}
        error={touched.name ? nameErr : ""}
        placeholder="Your full name"
        required
      />
      <ValidatedInput
        label="Mobile Number"
        type="tel"
        validationType="mobileNumber"
        value={mobileNumber}
        onChange={(e) => setMobileNumber(e.target.value)}
        onBlur={() => touch("mobileNumber")}
        touched={touched.mobileNumber}
        error={touched.mobileNumber ? mobileErr : ""}
        placeholder="10-digit mobile number"
        required
      />
      {/* Terms & Privacy */}
      <div>
        <label className="flex cursor-pointer items-start gap-2.5">
          <div
            onClick={() => setAgree((a) => !a)}
            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border-2 transition-all ${
              agree ? "border-(--gold) bg-(--gold)" : "border-stone-300 bg-white"
            } cursor-pointer`}
          >
            {agree && <Check size={10} className="text-white" strokeWidth={3} />}
          </div>
          <span className="text-sm leading-relaxed text-stone-600">
            I agree to the{" "}
            <Link href="/terms" className="font-semibold text-(--gold) hover:text-(--gold)/80 cursor-pointer">
              Terms & Condition
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-semibold text-(--gold) hover:underline cursor-pointer">
              Privacy Policy
            </Link>
          </span>
        </label>
        {touched.agree && agreeErr && (
          <p className="mt-1.5 text-xs text-rose-500">{agreeErr}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-stone-900 text-sm font-semibold text-white transition-all hover:bg-(--gold) disabled:opacity-60 cursor-not-allowed"
      >
        {submitting ? <><Loader2 size={16} className="animate-spin" /> Sending OTP…</> : "Create an Account"}
      </button>
      <p className="text-center text-sm text-stone-500">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="font-semibold text-(--gold) hover:underline cursor-pointer">
          Log in
        </button>
      </p>
    </form>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function LoginPage() {
  const [tab, setTab] = useState("login"); // "login" | "signup"

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryTab = params.get("tab");
      if (queryTab === "signup" || queryTab === "register") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTab("signup");
      }
      
      const token = params.get("token");
      if (token) {
        localStorage.setItem("userToken", token);
        playSuccess();
        toast.success("Welcome back!");
        setTimeout(() => {
          window.location.href = getRedirectPath();
        }, 1500);
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--background) px-4 py-10 sm:py-16">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block cursor-pointer">
            <p className="font-serif text-2xl font-semibold uppercase tracking-[0.24em] text-(--text) sm:text-3xl sm:tracking-[0.28em]">
              KESHRAG
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-(--gold)">
              Premium Sarees
            </p>
          </Link>
          <motion.p
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 text-base text-(--muted)"
          >
            {tab === "login" ? "Welcome back — sign in to your account" : "Create your Keshrag account"}
          </motion.p>
        </div>

        {/* Card */}
        <div className="rounded-[24px] border border-(--border) bg-white p-5 shadow-(--shadow-soft) sm:rounded-[28px] sm:p-8">

          {/* Tab switcher */}
          <div className="mb-7 flex overflow-hidden rounded-[14px] border border-stone-200 bg-stone-100 p-1">
            {["login", "signup"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`min-h-[44px] flex-1 rounded-[10px] px-2 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-all sm:text-xs sm:tracking-[0.18em] ${
                  tab === t
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                } cursor-pointer`}
              >
                {t === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Animated form swap */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: tab === "login" ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tab === "login" ? 16 : -16 }}
              transition={{ duration: 0.22 }}
            >
              {tab === "login" ? (
                <LoginForm onSwitch={() => setTab("signup")} />
              ) : (
                <RegisterForm onSwitch={() => setTab("login")} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-6 text-center text-xs text-stone-400">
          © {new Date().getFullYear()} Keshrag. All rights reserved.
        </p>
      </div>
    </div>
  );
}
