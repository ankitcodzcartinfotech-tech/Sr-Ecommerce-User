"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Gem, Leaf, ShieldCheck, Truck } from "lucide-react";
import { HoverExpand_001 } from "@/components/ui/skiper-ui/skiper52";

/* ── Stats ────────────────────────────────────────────────── */
const STATS = [
  { value: "1000+", label: "Happy Customers" },
  { value: "250+",  label: "Curated Products" },
  { value: "4.9★",  label: "Customer Rating" },
  { value: "7 Days", label: "Easy Returns"   },
];

/* ── Pillar data passed as `images` to HoverExpand_001 ──────
   We add extra fields (icon, number, title, desc) alongside
   the required src/alt that skiper52 expects.
───────────────────────────────────────────────────────────── */
const PILLARS = [
  {
    src:    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    alt:    "Premium Finish",
    icon:   Gem,
    number: "01",
    title:  "Premium\nFinish",
    desc:   "Every piece passes a strict quality check for texture, detail, and finishing before it reaches you.",
  },
  {
    src:    "https://images.unsplash.com/photo-1581497396202-5645e76a3a8e?auto=format&fit=crop&w=600&q=80",
    alt:    "Quality Materials",
    icon:   Leaf,
    number: "02",
    title:  "Quality\nMaterials",
    desc:   "Carefully selected fabrics, components, and finishes chosen for comfort, style, and longevity.",
  },
  {
    src:    "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=600&q=80",
    alt:    "Fast Dispatch",
    icon:   Truck,
    number: "03",
    title:  "Fast\nDispatch",
    desc:   "Gift-ready packaging and reliable delivery across the country, for every single order.",
  },
  {
    src:    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    alt:    "Trusted Support",
    icon:   ShieldCheck,
    number: "04",
    title:  "Trusted\nSupport",
    desc:   "Real help for orders, product questions, and post-purchase care — Monday to Saturday.",
  },
];

/* ── Stat card ────────────────────────────────────────────── */
function StatCard({ value, label, delay = 0 }) {
  const [shown, setShown] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const o = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setShown(true); },
      { threshold: 0.3 }
    );
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center rounded-[20px] border border-(--border) bg-(--surface) px-3 py-5 sm:px-6 sm:py-8 text-center"
      style={{
        opacity:    shown ? 1 : 0,
        transform:  shown ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      <p className="font-serif text-3xl font-semibold text-emerald-700 sm:text-5xl">{value}</p>
      <p className="mt-2 text-[9px] sm:text-xs font-semibold uppercase tracking-[0.24em] text-(--muted)">{label}</p>
    </div>
  );
}

/* ── Content overlay rendered inside each expanded panel ─── */
function PillarOverlay({ image }) {
  const Icon = image.icon;
  return (
    <div>
      {/* Icon badge */}
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
        <Icon size={18} className="text-white" strokeWidth={1.6} />
      </div>
      {/* Number */}
      <p className="text-[10px] font-bold tracking-[0.32em] text-white/50">
        {image.number}
      </p>
      {/* Title */}
      <h3 className="mt-1 whitespace-pre-line text-xl font-light leading-tight text-white sm:text-2xl">
        {image.title}
      </h3>
      {/* Description */}
      <p className="mt-2 max-w-[26ch] text-xs leading-5 text-white/70">
        {image.desc}
      </p>
      {/* Emerald accent */}
      <div className="mt-4 h-0.5 w-8 rounded-full bg-emerald-600" />
    </div>
  );
}

/* ── Mobile swipe cards (skiper52 doesn't do mobile) ─────── */
function MobileCards() {
  const [active, setActive] = useState(0);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    
    let closestIndex = 0;
    let minDistance = Infinity;
    
    Array.from(container.children).forEach((child, index) => {
       const childRect = child.getBoundingClientRect();
       const containerRect = container.getBoundingClientRect();
       const childCenter = childRect.left + childRect.width / 2;
       const containerCenter = containerRect.left + containerRect.width / 2;
       
       const distance = Math.abs(containerCenter - childCenter);
       if (distance < minDistance) {
         minDistance = distance;
         closestIndex = index;
       }
    });
    
    setActive((prev) => prev !== closestIndex ? closestIndex : prev);
  };

  const scrollTo = (index) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const child = container.children[index];
      if (child) {
        const childRect = child.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const offset = (childRect.left + childRect.width / 2) - (containerRect.left + containerRect.width / 2);
        container.scrollBy({ left: offset, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="md:hidden space-y-4">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto pb-3 no-scrollbar snap-x snap-mandatory"
      >
        {PILLARS.map(({ src, alt, icon: Icon, number, title, desc }, index) => (
          <div
            key={index}
            onClick={() => scrollTo(index)}
            className="relative min-w-[76vw] max-w-72.5 shrink-0 snap-center overflow-hidden rounded-3xl cursor-pointer"
            style={{ height: 400 }}
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 768px) 80vw, 50vw"
              loading="lazy"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <Icon size={16} className="text-white" strokeWidth={1.6} />
              </div>
              <p className="text-[9px] font-bold tracking-[0.28em] text-white/50">{number}</p>
              <h3 className="mt-1 whitespace-pre-line text-lg font-light leading-tight text-white">{title}</h3>
              <p className="mt-1.5 text-xs leading-5 text-white/70">{desc}</p>
              <div className="mt-3 h-0.5 w-7 rounded-full bg-emerald-600" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        {PILLARS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollTo(i)}
            className={`rounded-full transition-all duration-300 ${
              active === i ? "w-6 h-2 bg-emerald-600" : "w-2 h-2 bg-emerald-600/30"
            } cursor-pointer`}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Section ──────────────────────────────────────────────── */
export default function WhyKeshrag() {
  return (
    <section className="bg-(--surface) px-4 py-14 sm:px-6 md:px-10 lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[1440px]">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-emerald-600">
            Why Choose Us
          </p>
          <h2 className="mt-4 font-serif text-3xl font-light tracking-tight text-(--text) sm:text-4xl">
            The SR Ecommerce Standard
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-(--muted)">
            A premium storefront built around quality, ease, and lasting wardrobe value.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="mb-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <StatCard key={s.label} value={s.value} label={s.label} delay={i * 80} />
          ))}
        </div>

        {/* Desktop — exact HoverExpand_001 from skiper52 */}
        <div className="hidden md:flex justify-center">
          <HoverExpand_001
            images={PILLARS}
            renderOverlay={(image) => <PillarOverlay image={image} />}
          />
        </div>

        {/* Mobile swipe cards */}
        <MobileCards />
      </div>
    </section>
  );
}
