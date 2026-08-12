"use client";

import { Gem, Check } from "lucide-react";

export default function WhyYoullLoveIt() {
  return (
    <div className="surface-card rounded-[28px] p-8 bg-linear-to-br from-amber-50 via-white to-amber-50/30 border border-amber-100">
      <div className="flex items-center gap-2 mb-4">
        <Gem size={22} className="text-(--gold)" />
        <h3 className="text-xl font-serif font-semibold text-(--text)">
          Why You&apos;ll Love It
        </h3>
      </div>

      <p className="text-base leading-relaxed text-(--muted)">
        Crafted from{" "}
        <strong className="text-(--text)">luxurious cotton fabric</strong>,
        this saree combines traditional artistry with modern elegance. Each
        thread is woven by skilled artisans, creating intricate patterns that
        tell a story of heritage and craftsmanship.
      </p>

      <p className="mt-4 text-base leading-relaxed text-(--muted)">
        Perfect for{" "}
        <strong className="text-(--text)">weddings</strong>,{" "}
        <strong className="text-(--text)">festive celebrations</strong>, and{" "}
        <strong className="text-(--text)">special occasions</strong>, this
        piece embodies grace and sophistication. The rich color and exquisite
        detailing ensure you stand out with timeless elegance.
      </p>

      <div className="mt-6 flex flex-wrap gap-4">
        {[
          "Lightweight & Breathable",
          "Easy to Drape",
          "Long-lasting Quality",
        ].map((benefit, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Check size={16} className="text-emerald-600 shrink-0" />
            <span className="text-sm font-medium text-stone-700">
              {benefit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
