"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { TextRoll } from "@/components/ui/TextRoll";
import { ArrowRight, Sparkles, Heart, Star } from "lucide-react";

/* ── Animated scroll path ── */
function LinePath({ scrollYProgress }) {
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <svg
      viewBox="0 0 600 900"
      fill="none"
      overflow="visible"
      className="pointer-events-none absolute right-[-15%] top-0 h-full w-1/2 opacity-20"
      aria-hidden="true"
    >
      <motion.path
        d="M500 50 C400 100 200 80 150 200 C100 320 300 340 350 460 C400 580 150 600 100 720 C50 840 300 860 400 900"
        stroke="var(--gold)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        style={{ pathLength }}
      />
    </svg>
  );
}

/* ── Stat card ── */
function Stat({ value, label, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col gap-1 border-l-2 border-(--gold) pl-5"
    >
      <span className="text-4xl font-bold tracking-tight text-(--text)">{value}</span>
      <span className="text-xs font-medium uppercase tracking-[0.22em] text-(--muted)">{label}</span>
    </motion.div>
  );
}

/* ── Value card ── */
function ValueCard({ icon: Icon, title, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay }}
      className="group relative overflow-hidden rounded-[28px] border border-(--border) bg-(--surface) p-8 transition-shadow hover:shadow-(--shadow-soft)"
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-(--gold-soft)">
        <Icon size={22} className="text-(--gold)" />
      </div>
      <h3 className="mb-3 text-lg font-semibold text-(--text)">{title}</h3>
      <p className="text-sm leading-relaxed text-(--muted)">{description}</p>
      <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-(--gold-soft) opacity-40 transition-all duration-500 group-hover:scale-150" />
    </motion.div>
  );
}

/* ── Main ── */
export default function AboutPageClient() {
  const storyRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: storyRef,
    offset: ["start center", "end end"],
  });

  return (
    <div className="overflow-hidden">
      {/* ── Hero — Skiper58 style ── */}
      <section className="relative min-h-screen px-6 pb-20 pt-16 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1440px]">

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-4 py-2 text-[10px] font-bold uppercase tracking-[0.32em] text-(--gold)"
          >
            <Sparkles size={11} />
            About Keshrag
          </motion.p>

          {/* Large TextRoll words — Skiper58 exact pattern: full-width <li> triggers hover */}
          <ul className="mb-10 w-full border-t border-(--border)">
            {[
              { text: "Crafted.",    color: "text-(--text)" },
              { text: "Curated.",    color: "text-(--text)" },
              { text: "Celebrated.", color: "text-(--gold)" },
            ].map(({ text, color }) => (
              <li
                key={text}
                className="relative flex w-full cursor-pointer flex-col border-b border-(--border)"
              >
                <TextRoll
                  className={`font-serif text-[13vw] font-semibold tracking-[-0.03em] md:text-[11vw] lg:text-[9vw] ${color}`}
                >
                  {text}
                </TextRoll>
              </li>
            ))}
          </ul>

          {/* Sub row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
          >
            <p className="max-w-md text-base leading-relaxed text-(--muted) md:text-lg">
              Built for women who want timeless drapes without a dated experience —
              expressive textures, warm colour stories, considered from first click
              to final unboxing.
            </p>
            <div className="flex shrink-0 gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-(--gold) px-7 py-3.5 text-xs font-bold uppercase tracking-[0.22em] text-white transition-all hover:bg-(--text) cursor-pointer"
              >
                Shop Now <ArrowRight size={14} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border-2 border-(--border) px-7 py-3.5 text-xs font-bold uppercase tracking-[0.22em] text-(--text) transition-all hover:border-(--gold) hover:text-(--gold) cursor-pointer"
              >
                Talk to Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      {/* ── Stats ── */}
      <section className="border-y border-(--border) bg-(--surface) px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-10 lg:grid-cols-4">
          <Stat value="500+" label="Saree Styles" delay={0.1} />
          <Stat value="12+" label="Fabric Types" delay={0.2} />
          <Stat value="Pan India" label="Delivery" delay={0.3} />
          <Stat value="100%" label="Authentic Craft" delay={0.4} />
        </div>
      </section>
      {/* ── Values ── */}
      <section className="px-6 py-20 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1440px]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-(--gold)">
              What We Stand For
            </p>
            <h2 className="font-serif text-4xl font-semibold text-(--text) md:text-5xl">
              <TextRoll className="text-(--text)">Crafted with</TextRoll>
              <TextRoll className="text-(--gold)">intention.</TextRoll>
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ValueCard
              icon={Heart}
              title="Curated Heritage"
              description="Saree edits that balance centuries of Indian weaving tradition with a modern, considered aesthetic — never overdone, always meaningful."
              delay={0.1}
            />
            <ValueCard
              icon={Sparkles}
              title="Thoughtful Presentation"
              description="A warmer shopping experience with refined guidance — from fabric descriptions to styling suggestions and gifting advice."
              delay={0.2}
            />
            <ValueCard
              icon={Star}
              title="Celebratory Dressing"
              description="Collections shaped around the moments that matter — gifting, weddings, festive wear, and the elevated everyday."
              delay={0.3}
            />
          </div>
        </div>
      </section>
      {/* ── Dark scroll story ── */}
      <section
        ref={storyRef}
        className="relative overflow-hidden bg-(--text) px-6 py-28 md:px-12 lg:px-20"
      >
        <LinePath scrollYProgress={scrollYProgress} />
        <div className="mx-auto max-w-[1440px]">
          <div className="grid items-center gap-16 lg:grid-cols-2">

            {/* Left */}
            <div>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="mb-6 text-xs font-bold uppercase tracking-[0.32em] text-(--gold)"
              >
                Our Story
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-serif text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl"
              >
                Drapes that carry
                <br />
                <span className="text-(--gold)">a story.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="mt-8 max-w-md text-base leading-relaxed text-stone-400"
              >
                Born from a love of Indian craftsmanship, Keshrag was created to
                bridge the gap between heirloom-quality sarees and the modern woman
                who wears them — with no compromise on either.
              </motion.p>
            </div>

            {/* Right: numbered timeline */}
            <div className="space-y-8">
              {[
                {
                  step: "01",
                  title: "Heritage First",
                  desc: "We source directly from master weavers in Varanasi, Kanjivaram, and Chanderi — preserving techniques passed down through generations.",
                },
                {
                  step: "02",
                  title: "Curated Selection",
                  desc: "Every saree is hand-picked for its texture, drape quality, and colour story. Less is more — only the finest make the cut.",
                },
                {
                  step: "03",
                  title: "Considered Delivery",
                  desc: "From eco-conscious packaging to detailed care cards, every unboxing is designed to feel like receiving a gift.",
                },
              ].map(({ step, title, desc }, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: i * 0.15 }}
                  className="flex gap-6"
                >
                  <span className="mt-1 shrink-0 font-serif text-4xl font-bold leading-none text-(--gold) opacity-40">
                    {step}
                  </span>
                  <div>
                    <h4 className="mb-2 text-base font-semibold text-white">{title}</h4>
                    <p className="text-sm leading-relaxed text-stone-400">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* ── Brand footer ── */}
      <section className="overflow-hidden bg-(--surface) px-6 py-20 text-center md:px-10">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-(--gold)"
        >
          Premium Sarees · Est. India
        </motion.p>
        <div className="overflow-hidden">
          <motion.h2
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-[18vw] font-bold leading-none tracking-tighter text-(--text)"
          >
            KESHRAG
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-(--muted)"
        >
          Rooted in India&apos;s weaving legacy. Presented for the modern woman.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="mt-10"
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-(--gold) px-8 py-4 text-xs font-bold uppercase tracking-[0.22em] text-white transition-all hover:bg-(--text) cursor-pointer"
          >
            Shop the Collection <ArrowRight size={14} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
