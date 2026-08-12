"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { forgotPassword } from "@/Api/AllApi";
import ValidatedInput from "@/components/common/ValidatedInput";
import { validateField } from "@/utils/validation";

export default function ForgotPasswordPage() {
  const [email,       setEmail]       = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [done,        setDone]        = useState(false);
  const [error,       setError]       = useState("");
  const [touched,     setTouched]     = useState(false);

  const isInvalid = validateField("email", email);

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (isInvalid) { return; }
    setSubmitting(true);
    setError("");
    try {
      await forgotPassword({ email: email.trim() });
      setDone(true);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--background) px-4 py-10">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block cursor-pointer">
            <p className="font-serif text-2xl font-semibold uppercase tracking-[0.24em] text-(--text)">
              KESHRAG
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-(--gold)">
              Premium Sarees
            </p>
          </Link>
        </div>

        <div className="rounded-[24px] border border-(--border) bg-white p-6 shadow-(--shadow-soft) sm:p-8">
          <AnimatePresence mode="wait">

            {/* ── Success state ── */}
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 240, damping: 18 }}
                  className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50"
                >
                  <CheckCircle size={32} className="text-emerald-600" />
                </motion.div>
                <h2 className="font-serif text-2xl font-light text-(--text)">Check your inbox</h2>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-(--muted)">
                  If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link. Check your spam folder too.
                </p>
                <Link
                  href="/login"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-(--gold) px-7 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-(--text) cursor-pointer"
                >
                  Back to Login
                </Link>
              </motion.div>

            ) : (
              /* ── Form state ── */
              (<motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-6">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--muted) transition-colors hover:text-(--gold) cursor-pointer"
                  >
                    <ArrowLeft size={13} /> Back to login
                  </Link>
                  <h1 className="mt-4 font-serif text-2xl font-light text-(--text)">
                    Forgot your password?
                  </h1>
                  <p className="mt-2 text-sm text-(--muted)">
                    Enter your email and we&apos;ll send you a link to reset it.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <ValidatedInput
                    label="Email Address"
                    type="email"
                    validationType="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    onBlur={() => setTouched(true)}
                    touched={touched}
                    error={touched ? (isInvalid || error) : error}
                    placeholder="you@example.com"
                    icon={Mail}
                  />

                  <button
                    type="submit"
                    disabled={submitting || !email.trim()}
                    className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-stone-900 text-sm font-semibold text-white transition-all hover:bg-(--gold) disabled:opacity-60 cursor-not-allowed"
                  >
                    {submitting
                      ? <><Loader2 size={16} className="animate-spin" /> Sending…</>
                      : "Send Reset Link"}
                  </button>
                </form>
              </motion.div>)
            )}
          </AnimatePresence>
        </div>

        <p className="mt-6 text-center text-xs text-stone-400">
          © {new Date().getFullYear()} Keshrag. All rights reserved.
        </p>
      </div>
    </div>
  );
}
