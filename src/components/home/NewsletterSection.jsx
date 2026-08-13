"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Mail, ArrowRight } from "lucide-react";
import ValidatedInput from "@/components/common/ValidatedInput";
import { validateField } from "@/utils/validation";

const PERKS = [
  "Early access to new collections",
  "Exclusive member-only offers",
  "Styling inspiration & lookbooks",
  "Festival edit previews",
];

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [touched, setTouched] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    const trimmed = email.trim();
    if (!trimmed || validateField("email", trimmed)) {
      return;
    }

    setState("loading");
    setErrorMsg("");

    try {
      await new Promise((r) => setTimeout(r, 1200));
      setState("success");
      setEmail("");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setState("idle");
    }
  }

  return (
    <section
      id="newsletter"
      className="relative w-full bg-white px-4 py-20 sm:px-6 md:px-10 lg:px-14 lg:py-28"
    >
      <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[2.5rem] md:rounded-[4rem] bg-gradient-to-br from-emerald-50/40 via-stone-50/60 to-white px-6 py-20 border border-emerald-100/40 shadow-[0_20px_50px_rgba(0,0,0,0.05)] sm:px-12 md:px-20 lg:px-24">
        {/* Ambient Premium Glows */}
        <div className="pointer-events-none absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-emerald-100 opacity-[0.25] blur-[120px]" />
        <div className="pointer-events-none absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-emerald-200 opacity-[0.2] blur-[120px]" />
        <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-overlay" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <AnimatePresence mode="wait">
            {/* ── Success State ── */}
            {state === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col items-center py-12 text-center lg:py-24"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 240,
                    damping: 20,
                    delay: 0.1,
                  }}
                  className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-emerald-200/50 bg-emerald-50 shadow-[0_0_40px_rgba(4,120,87,0.1)]"
                >
                  <Check size={40} className="text-emerald-600" strokeWidth={2.5} />
                </motion.div>
                <h2 className="font-serif text-4xl font-light text-gray-900 md:text-5xl">
                  Welcome to the <span className="italic text-emerald-600 font-normal">Circle</span>
                </h2>
                <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-gray-600">
                  You are now on the list. Watch your inbox for exclusive launches, member offers, and style inspiration from SR Ecommerce.
                </p>
                <button
                  onClick={() => setState("idle")}
                  className="group mt-10 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-emerald-600 cursor-pointer"
                >
                  Subscribe another email
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
            ) : (
              /* ── Default State ── */
              (<motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-16 lg:grid-cols-[1.1fr_1fr] lg:items-center"
              >
                {/* Left: Copy & Perks */}
                <div>
                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-[11px] font-bold uppercase tracking-[0.35em] text-emerald-600"
                  >
                    Join the SR Ecommerce Circle
                  </motion.p>
                  
                  <motion.h2
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="mt-6 font-serif text-4xl font-light leading-[1.15] text-gray-900 sm:text-5xl lg:text-6xl"
                  >
                    Be the First <br className="hidden sm:block" />
                    <span className="italic text-gray-500 font-normal">to Know</span>
                  </motion.h2>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 max-w-md text-base leading-relaxed text-gray-600"
                  >
                    Join thousands of subscribers who receive early access, curated edits, and exclusive offers directly in their inbox.
                  </motion.p>
 
                  <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {PERKS.map((p, i) => (
                      <motion.li
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        key={p}
                        className="flex items-center gap-3.5 text-[13px] font-medium tracking-wide text-gray-700"
                      >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
                          <Check size={12} className="text-emerald-600" strokeWidth={3} />
                        </div>
                        {p}
                      </motion.li>
                    ))}
                  </ul>
                </div>
                {/* Right: Form Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
                  className="relative lg:ml-auto w-full max-w-lg"
                >
                  {/* Subtle Card Shadow */}
                   <div className="absolute -inset-0.5 rounded-[32px] bg-gradient-to-br from-emerald-500/10 to-transparent opacity-40 blur-xl" />
                  
                  <div className="relative rounded-[32px] border border-gray-100 bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] sm:p-10">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                      
                      <ValidatedInput
                        label="Your Email Address"
                        variant="stone"
                        type="email"
                        validationType="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
                        onBlur={() => setTouched(true)}
                        touched={touched}
                        error={touched ? (validateField("email", email) || errorMsg) : errorMsg}
                        placeholder="you@example.com"
                        icon={Mail}
                        disabled={state === "loading"}
                        inputClassName="rounded-full h-[52px]"
                      />
 
                      <button
                        type="submit"
                        disabled={state === "loading" || !email.trim()}
                        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-emerald-700 py-4.5 text-[11px] font-bold uppercase tracking-[0.25em] text-white transition-all duration-300 hover:bg-emerald-800 hover:shadow-[0_0_20px_rgba(4,120,87,0.2)] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none cursor-pointer disabled:cursor-not-allowed"
                      >
                        <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[100%]" />
                        <span className="relative flex items-center gap-2">
                          {state === "loading" ? (
                            <><Loader2 size={16} className="animate-spin" /> Subscribing…</>
                          ) : (
                            <>Subscribe Now <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" /></>
                          )}
                        </span>
                      </button>
 
                      <p className="text-center text-[10px] uppercase tracking-wider text-gray-400">
                        No spam. Unsubscribe anytime.
                      </p>
                    </form>
                  </div>
                </motion.div>
              </motion.div>)
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

