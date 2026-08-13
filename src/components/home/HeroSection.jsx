"use client";

import { useEffect, useState } from "react";
import { Sparkles, Star, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/Button";
import { getBanners } from "@/Api/AllApi";
import { normalizeBannerList, resolveMediaSrc } from "@/lib/storefront";

export default function HeroSection() {
  const [bannerImage, setBannerImage] = useState(null);

  useEffect(() => {
    getBanners()
      .then((response) => {
        const list = normalizeBannerList(response);
        if (list && list.length > 0) {
          const first = list[0];
          const src = resolveMediaSrc(first.desktopImage || first.image);
          if (src) setBannerImage(src);
        }
      })
      .catch(() => {}); // silent fallback to default image
  }, []);

  return (
    <section className="relative overflow-hidden bg-white pt-10 pb-4 sm:pt-28 md:pt-30 lg:pb-8">
      {/* Soft ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(4,120,87,0.06),transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-10 top-10 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(5,150,105,0.04),transparent_70%)] blur-3xl"
      />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-14">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* ── Left Column ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-7"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/10 bg-emerald-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-800">
              <Sparkles size={11} className="text-emerald-700 animate-pulse" />
              <span>#1 Premium Storefront</span>
            </div>

            {/* Headline */}
            <h1 className="max-w-2xl font-serif text-[2.25rem] xs:text-[2.5rem] font-light leading-[1.08] tracking-tight text-stone-900 sm:text-[clamp(2.75rem,5.5vw,4.25rem)]">
              Explore, shop,<br />
              <span className="font-extrabold text-[#047857]">repeat again.</span>
            </h1>

            {/* Description */}
            <p className="max-w-lg text-sm leading-7 text-stone-500 sm:text-base sm:leading-8">
              SR Ecommerce is a driving force behind curated lifestyle experiences. Explore a handpicked collection of apparel, home essentials, and accessories crafted for modern living.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center">
              <Button
                href="/shop"
                size="lg"
                className="w-full sm:w-auto hover:scale-[1.01] active:scale-95"
                style={{ backgroundColor: "#047857", color: "white", padding: "14px 36px" }}
              >
                Shop Collection
              </Button>
              <Button
                href="/collections"
                variant="outline"
                size="lg"
                className="w-full sm:w-auto hover:scale-[1.01] active:scale-95 border-stone-200 text-stone-700"
                style={{ padding: "14px 36px" }}
              >
                Browse Categories
              </Button>
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap items-center gap-6 border-t border-stone-100 pt-6 sm:gap-10">
              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-7 w-7 rounded-full border-2 border-white bg-emerald-50 flex items-center justify-center"
                    >
                      <span className="text-[8px] font-bold text-emerald-700">U{i}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={10} fill="currentColor" />
                    ))}
                  </div>
                  <p className="mt-0.5 text-[10px] font-semibold text-stone-500">12k+ Happy Shoppers</p>
                </div>
              </div>
              {/* Secure */}
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <ShieldCheck size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-900">Secure Payments</p>
                  <p className="text-[9px] text-stone-400">100% Encrypted</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Right Column: Single Banner Image ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.12, ease: "easeOut" }}
            className="w-full"
          >
            <div className="relative overflow-hidden rounded-[28px] border border-stone-100 shadow-md aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] bg-stone-100 group">
              <img
                src={bannerImage || "/images/hero-1.jpg"}
                alt="SR Ecommerce Hero Banner"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              {/* Subtle gradient overlay at bottom */}
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.45)_0%,transparent_55%)]" />
              {/* Badge on image */}
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-200 backdrop-blur-md">
                  New Collection
                </span>
                <h2 className="mt-2 text-base font-bold sm:text-lg">
                  Designed for comfort,<br />crafted for elegance.
                </h2>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
