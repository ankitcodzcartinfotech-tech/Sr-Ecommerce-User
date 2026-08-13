"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { resetPassword } from "@/Api/AllApi";
import ValidatedInput from "@/components/common/ValidatedInput";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [touchedPass, setTouchedPass] = useState(false);
  const [touchedConf, setTouchedConf] = useState(false);

  /* Validate link on mount */
  useEffect(() => {
    if (!token || !email) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("Invalid or missing reset link. Please request a new one.");
    }
  }, [token, email]);

  const passOk = password.length >= 8;
  const matchOk = confirm.length > 0 && password === confirm;
  const canSubmit = passOk && matchOk && token && email && !submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    setTouchedPass(true);
    setTouchedConf(true);
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      await resetPassword({ token, email, newPassword: password });
      setDone(true);
      // Redirect to login after 2.5s
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(err?.message || "Could not reset password. The link may have expired.");
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
              Sr Software
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-(--gold)">
              Premium Sarees
            </p>
          </Link>
        </div>

        <div className="rounded-[24px] border border-(--border) bg-white p-6 shadow-(--shadow-soft) sm:p-8">
          <AnimatePresence mode="wait">

            {/* ── Invalid link ── */}
            {!token || !email ? (
              <motion.div
                key="invalid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-6 text-center"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
                  <AlertCircle size={28} className="text-rose-500" />
                </div>
                <h2 className="font-serif text-xl font-light text-(--text)">Invalid Reset Link</h2>
                <p className="mt-2 text-sm text-(--muted)">
                  This link is missing required parameters. Please request a new password reset.
                </p>
                <Link
                  href="/forgot-password"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-(--gold) px-7 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-(--text) cursor-pointer"
                >
                  Request New Link
                </Link>
              </motion.div>

            ) : done ? (
              /* ── Success ── */
              (<motion.div
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
                <h2 className="font-serif text-2xl font-light text-(--text)">Password Reset!</h2>
                <p className="mt-2 text-sm text-(--muted)">
                  Your password has been updated. Redirecting to login…
                </p>
              </motion.div>)

            ) : (
              /* ── Form ── */
              (<motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-6">
                  <h1 className="font-serif text-2xl font-light text-(--text)">Set new password</h1>
                  <p className="mt-1.5 text-sm text-(--muted)">
                    For <span className="font-semibold text-(--text)">{email}</span>
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* New password */}
                  <ValidatedInput
                    label="New Password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onBlur={() => setTouchedPass(true)}
                    touched={touchedPass}
                    error={touchedPass && password.length > 0 && !passOk ? "Minimum 8 characters" : ""}
                    success={passOk}
                    placeholder="At least 8 characters"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPass(s => !s)}
                        tabIndex={-1}
                        className="text-stone-400 hover:text-stone-700 cursor-pointer flex items-center justify-center"
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />

                  {/* Confirm password */}
                  <ValidatedInput
                    label="Confirm Password"
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    onBlur={() => setTouchedConf(true)}
                    touched={touchedConf}
                    error={touchedConf && confirm.length > 0 && !matchOk ? "Passwords don't match" : ""}
                    success={matchOk}
                    placeholder="Repeat your password"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowConfirm(s => !s)}
                        tabIndex={-1}
                        className="text-stone-400 hover:text-stone-700 cursor-pointer flex items-center justify-center"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />

                  {/* Server error */}
                  {error && (
                    <div className="rounded-[12px] bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
                      {error}{" "}
                      <Link href="/forgot-password" className="underline cursor-pointer">
                        Request a new link
                      </Link>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-stone-900 text-sm font-semibold text-white transition-all hover:bg-(--gold) disabled:opacity-60 cursor-not-allowed"
                  >
                    {submitting
                      ? <><Loader2 size={16} className="animate-spin" /> Updating…</>
                      : "Reset Password"}
                  </button>
                </form>
              </motion.div>)
            )}
          </AnimatePresence>
        </div>

        <p className="mt-6 text-center text-xs text-stone-400">
          © {new Date().getFullYear()} Sr Software . All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={24} className="animate-spin text-(--gold)" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
