"use client";

import { Gem, Check } from "lucide-react";

export default function WhyYoullLoveIt() {
  return (
    <div className="surface-card rounded-[28px] p-8 bg-linear-to-br from-emerald-50/60 via-white to-emerald-50/20 border border-emerald-100/80">
      <div className="flex items-center gap-2 mb-4">
        <Gem size={22} className="text-(--gold)" />
        <h3 className="text-xl font-serif font-semibold text-(--text)">
          Why You&apos;ll Love It
        </h3>
      </div>

      <p className="text-base leading-relaxed text-(--muted)">
        Crafted from{" "}
        <strong className="text-(--text)">premium quality materials</strong>,
        this product combines exquisite design with modern styling. Every
        detail is carefully considered, creating a beautiful piece that stands out.
      </p>

      <p className="mt-4 text-base leading-relaxed text-(--muted)">
        Perfect for{" "}
        <strong className="text-(--text)">gifting</strong>,{" "}
        <strong className="text-(--text)">lifestyle upgrades</strong>, and{" "}
        <strong className="text-(--text)">everyday utility</strong>, this
        selection embodies sophistication and style. The premium finish and exquisite
        detailing ensure you stand out with timeless elegance.
      </p>

      <div className="mt-6 flex flex-wrap gap-4">
        {[
          "Premium Craftsmanship",
          "Sophisticated Aesthetic",
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
