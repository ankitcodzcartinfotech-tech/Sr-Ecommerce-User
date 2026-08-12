"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, X, Loader2 } from "lucide-react";
import ValidatedInput from "@/components/common/ValidatedInput";
import { validateField } from "@/utils/validation";

export default function NotifyMe({ productId, productName }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | loading | done
  const [err, setErr] = useState("");
  const [touched, setTouched] = useState(false);

  // Pre-fill from localStorage if user is logged in
  function openModal() {
    const stored = typeof window !== "undefined" ? localStorage.getItem("userEmail") || "" : "";
    setEmail(stored);
    setErr("");
    setState("idle");
    setOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (validateField("email", email)) { return; }
    setState("loading");
    // Persist to localStorage (no backend endpoint yet)
    await new Promise(r => setTimeout(r, 800));
    try {
      const key = `notify_${productId}`;
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      if (!list.includes(email.trim())) {
        list.push(email.trim());
        localStorage.setItem(key, JSON.stringify(list));
      }
    } catch { /* ignore */ }
    setState("done");
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={openModal}
        className="flex w-full items-center justify-center gap-2.5 rounded-full border-2 border-stone-300 bg-stone-50 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-stone-600 transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 active:scale-[0.98] cursor-pointer"
      >
        <Bell size={16}/> Notify Me When Available
      </button>
      {/* Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm rounded-[28px] bg-white p-7 shadow-2xl"
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Back In Stock</p>
                  <h3 className="mt-1 text-lg font-bold text-[#1A1A1A]">Notify Me</h3>
                </div>
                <button onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 cursor-pointer">
                  <X size={16}/>
                </button>
              </div>

              {state === "done" ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <Check size={28} className="text-emerald-600"/>
                  </div>
                  <p className="font-bold text-[#1A1A1A]">You&apos;re on the list!</p>
                  <p className="mt-2 text-sm text-stone-500">
                    We&apos;ll notify you when <span className="font-medium text-[#1A1A1A]">{productName}</span> becomes available.
                  </p>
                  <button onClick={() => setOpen(false)} className="mt-6 rounded-full bg-emerald-700 px-8 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 cursor-pointer">
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-sm text-stone-500">
                    Enter your email and we&apos;ll let you know the moment this item is back in stock.
                  </p>
                  <ValidatedInput
                    type="email"
                    validationType="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErr(""); }}
                    onBlur={() => setTouched(true)}
                    touched={touched}
                    error={touched ? (validateField("email", email) || err) : err}
                    placeholder="your@email.com"
                  />
                  <button type="submit" disabled={state === "loading"}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 py-3.5 text-sm font-bold text-white transition-all hover:bg-emerald-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 cursor-not-allowed">
                    {state === "loading" ? <><Loader2 size={15} className="animate-spin"/> Saving…</> : <><Bell size={15}/> Notify Me</>}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
