"use client";

import { Info } from "lucide-react";

export default function SareeSpecifications({ selectedColor }) {
  const specifications = [
    { label: "Fabric", value: "100% Pure Cotton", highlight: true },
    { label: "Work", value: "Hand Embroidery", highlight: true },
    { label: "Length", value: "5.5 Meter + 0.8m Blouse", highlight: false },
    { label: "Blouse Piece", value: "Included (Unstitched)", highlight: false },
    { label: "Occasion", value: "Wedding, Festive, Party", highlight: false },
    { label: "Wash Care", value: "Dry Clean Only", highlight: false },
    { label: "Weight", value: "650 grams (approx)", highlight: false },
    { label: "Color", value: selectedColor || "As Shown", highlight: false },
  ];

  return (
    <div className="surface-card rounded-(24px) p-6 border-2 border-(--gold)/20">
      <h3 className="text-lg font-serif font-semibold text-(--text) mb-4 flex items-center gap-2">
        <Info size={20} className="text-(--gold)" />
        Saree Details
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        {specifications.map((spec, idx) => (
          <div
            key={idx}
            className={`flex justify-between items-center py-2.5 px-3 rounded-xl transition-colors ${
              spec.highlight ? "bg-(--gold-soft)" : "bg-stone-50"
            }`}
          >
            <span className="text-sm font-medium text-(--muted)">
              {spec.label}
            </span>
            <span
              className={`text-sm font-semibold ${
                spec.highlight ? "text-(--gold)" : "text-(--text)"
              }`}
            >
              {spec.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
