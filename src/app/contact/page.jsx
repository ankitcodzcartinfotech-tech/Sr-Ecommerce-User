"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import PageHero from "@/components/common/PageHero";
import { Mail, Phone, Clock, Send, Loader2, MapPin, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitContactForm } from "@/Api/AllApi";
import ValidatedInput from "@/components/common/ValidatedInput";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  mobile: z.string().min(10, "Please enter a valid mobile number"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const contactCards = [
  {
    icon: <Mail size={20} className="text-emerald-700" />,
    title: "Customer Support",
    text: "Reach us for product guidance or post-order support.",
    value: "support@srecommerce.com",
    href: "mailto:support@srecommerce.com",
    cta: "Send Email",
  },
  {
    icon: <Phone size={20} className="text-emerald-700" />,
    title: "Phone Assistance",
    text: "Need quick help? Call our support team directly.",
    value: "+91 98246 76060",
    href: "tel:+919824676060",
    cta: "Call Now",
  },
  {
    icon: <Clock size={20} className="text-emerald-700" />,
    title: "Studio Hours",
    text: "Available for order help and product assistance.",
    value: "Mon–Sat, 10 AM – 7 PM",
    href: null,
    cta: null,
  },
];

const inputBase =
  "w-full rounded-xl border bg-stone-50 px-4 py-3.5 text-sm text-stone-800 placeholder:text-stone-400 outline-none transition-all duration-300 focus:bg-white focus:ring-4 hover:bg-stone-50";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      await submitContactForm(data);
      setSubmitStatus("success");
      reset();
    } catch (error) {
      console.error("Failed to submit contact form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell bg-white pb-16 lg:pb-28">
      <PageHero
        eyebrow="Contact SR Ecommerce"
        title="We're here to help you."
        description="Whether you need styling assistance, have questions about an order, or want to explore business partnerships — our team is ready."
      />

      <section className="px-4 py-8 sm:px-6 md:px-10 lg:px-14 lg:py-14">
        <div className="mx-auto max-w-6xl">

          {/* ── Info Cards ── */}
          <div className="mb-10 grid gap-4 sm:grid-cols-3 lg:mb-16 lg:gap-6">
            {contactCards.map((card, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                key={card.title}
                className="group relative overflow-hidden rounded-2xl border border-stone-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-[0_16px_40px_-12px_rgba(4,120,87,0.12)] lg:rounded-3xl lg:p-8"
              >
                {/* Top accent */}
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 border border-stone-100 transition-all duration-300 group-hover:bg-emerald-100 group-hover:border-emerald-200">
                  {card.icon}
                </div>

                <h3 className="mb-1.5 text-sm font-bold text-stone-900 lg:text-base">{card.title}</h3>
                <p className="mb-4 text-xs leading-relaxed text-stone-500 lg:text-sm">{card.text}</p>

                {card.href ? (
                  <a
                    href={card.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 transition-all hover:gap-2.5"
                  >
                    {card.value} <ArrowRight size={12} />
                  </a>
                ) : (
                  <p className="text-xs font-bold text-stone-700 lg:text-sm">{card.value}</p>
                )}
              </motion.div>
            ))}
          </div>

          {/* ── Contact Form + Side Info ── */}
          <div className="grid gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] lg:gap-8">

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative overflow-hidden rounded-2xl border border-stone-100 bg-white p-6 shadow-sm lg:rounded-3xl lg:p-10"
            >
              {/* Subtle glows */}
              <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-emerald-600/8 blur-[50px]" />
              <div className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-emerald-600/8 blur-[50px]" />

              <div className="relative z-10 mb-8">
                <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-700">Get In Touch</span>
                <h2 className="mt-2 text-2xl font-bold text-stone-900 lg:text-3xl">
                  Send us a <span className="font-light italic text-stone-500">message</span>
                </h2>
                <p className="mt-2 text-sm text-stone-500">We'll get back to you within 24 hours.</p>
              </div>

              {submitStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative z-10 mb-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 text-center"
                >
                  Thank you! Your message has been sent. We'll be in touch soon.
                </motion.div>
              )}

              {submitStatus === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative z-10 mb-6 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm font-medium text-rose-800 text-center"
                >
                  Something went wrong. Please try again or email us directly.
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="relative z-10 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <ValidatedInput
                      label="Full Name"
                      validationType="name"
                      {...register("name")}
                      error={errors.name?.message}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <ValidatedInput
                      label="Mobile Number"
                      validationType="mobileNumber"
                      {...register("mobile")}
                      error={errors.mobile?.message}
                      placeholder="+91 98246 76060"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <ValidatedInput
                    label="Email Address"
                    validationType="email"
                    type="email"
                    {...register("email")}
                    error={errors.email?.message}
                    placeholder="jane@example.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <ValidatedInput
                    label="Subject"
                    {...register("subject")}
                    error={errors.subject?.message}
                    placeholder="Order Inquiry, Wholesale, etc."
                    maxLength={100}
                  />
                </div>

                <div className="space-y-1.5">
                  <ValidatedInput
                    label="Message"
                    multiline
                    rows={5}
                    {...register("message")}
                    error={errors.message?.message}
                    placeholder="How can we help you?"
                    maxLength={500}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-emerald-700 py-4 text-xs font-bold uppercase tracking-[0.25em] text-white shadow-[0_12px_28px_-8px_rgba(4,120,87,0.45)] transition-all duration-300 hover:scale-[1.01] hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 cursor-pointer"
                  >
                    <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
                    <span className="relative flex items-center gap-2">
                      {isSubmitting ? (
                        <><Loader2 size={15} className="animate-spin" /> Sending…</>
                      ) : (
                        <>Send Message <Send size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></>
                      )}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Side info panel — desktop only */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="hidden space-y-5 lg:block"
            >
              {/* Quick contact */}
              <div className="rounded-3xl border border-stone-100 bg-white p-7 shadow-sm">
                <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Quick Contact</p>
                <div className="space-y-4">
                  <a href="mailto:support@srecommerce.com" className="flex items-start gap-3.5 group">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                      <Mail size={15} className="text-emerald-700" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">Email</p>
                      <p className="text-sm font-semibold text-stone-800 group-hover:text-emerald-700 transition-colors">support@srecommerce.com</p>
                    </div>
                  </a>
                  <a href="tel:+919824676060" className="flex items-start gap-3.5 group">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                      <Phone size={15} className="text-emerald-700" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">Phone</p>
                      <p className="text-sm font-semibold text-stone-800 group-hover:text-emerald-700 transition-colors">+91 98246 76060</p>
                    </div>
                  </a>
                  <div className="flex items-start gap-3.5">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                      <Clock size={15} className="text-emerald-700" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">Hours</p>
                      <p className="text-sm font-semibold text-stone-800">Mon–Sat</p>
                      <p className="text-xs text-stone-500">10 AM – 7 PM IST</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Studio location */}
              <div className="rounded-3xl border border-stone-100 bg-white p-7 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin size={15} className="text-emerald-700" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Location</p>
                </div>
                <p className="text-sm leading-relaxed text-stone-600">
                  ground floor, Raghuvir Scarlett,<br />
                  G-59, nr. Dmd Logistic park, Saroli,<br />
                 Surat Gujarat – 395002, India
                </p>
              </div>

              {/* Promise card */}
              <div className="rounded-3xl bg-gradient-to-br from-emerald-700 to-emerald-800 p-7 text-white shadow-[0_12px_30px_-8px_rgba(4,120,87,0.4)]">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">Our Promise</p>
                <p className="text-lg font-bold leading-snug">We reply within 24 hours, always.</p>
                <p className="mt-2 text-xs leading-relaxed text-white/80">
                  Every query matters. Our team is dedicated to giving you the best shopping experience.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
