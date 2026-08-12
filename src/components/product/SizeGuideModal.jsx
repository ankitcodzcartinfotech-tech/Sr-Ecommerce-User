"use client";

import { useState } from "react";
import {
  Ruler,
  Sparkles,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Custom Close Button Component
function CloseButton({ onClose }) {
  return (
    <button
      onClick={onClose}
      className="absolute right-4 top-4 md:right-6 md:top-6 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-all backdrop-blur-sm border border-white/20 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
      aria-label="Close dialog"
    >
      <X size={18} />
    </button>
  );
}

export default function SizeGuideModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 h-11 px-5 rounded-full border border-stone-200 bg-white/50 text-sm font-semibold uppercase tracking-wider text-(--primary) transition-all hover:border-(--primary) hover:bg-(--gold-soft) active:scale-98 shadow-sm hover:shadow cursor-pointer">
          <Ruler size={18} className="animate-pulse" />
          <span>Size Guide</span>
        </button>
      </DialogTrigger>
      <DialogContent
        hideCloseButton
        className="w-full h-dvh max-w-none rounded-t-[28px] rounded-b-none p-0 md:max-w-6xl md:h-auto md:max-h-[90vh] md:rounded-3xl flex flex-col bg-white border-stone-200 overflow-hidden"
      >
        <CloseButton onClose={() => setIsOpen(false)} />
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col h-full overflow-y-auto overflow-x-hidden scroll-smooth"
            >
              {/* Decorative Luxury Header Banner */}
              <div className="shrink-0 relative overflow-hidden bg-linear-to-r from-[#064e3b] to-[#047857] px-5 py-6 md:p-8 text-center text-white select-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_50%)]" />
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[24px_24px]" />

                <h2 className="text-2xl md:text-4xl font-semibold font-serif tracking-wide text-white mb-1">
                  Size Chart
                </h2>
                <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-emerald-100/80">
                  Find your perfect fit before placing an order
                </p>

                {/* Elegant Motif divider */}
                <div className="flex justify-center items-center gap-3 mt-4 text-emerald-200/50">
                  <span className="h-px w-12 bg-linear-to-r from-transparent to-emerald-200/50" />
                  <Sparkles size={12} className="text-emerald-200/65 animate-pulse" />
                  <span className="h-px w-12 bg-linear-to-l from-transparent to-emerald-200/50" />
                </div>
              </div>

              {/* Modal Body */}
              <div className="shrink-0 p-6 space-y-6">
                {/* Standard Apparel Table Card */}
                <div className="rounded-2xl md:rounded-3xl border border-stone-200 bg-stone-50/50 p-6 md:p-8 flex flex-col items-center justify-center text-center gap-6 shadow-sm md:shadow-xl">
                  <div className="space-y-2">
                    <h4 className="text-xl md:text-2xl font-serif font-semibold text-stone-900">Standard Apparel Size Chart</h4>
                    <p className="text-sm md:text-base text-stone-500">Find your best fit based on body measurements.</p>
                  </div>

                  <div className="w-full overflow-x-auto mt-2">
                    <table className="w-full border-collapse text-left text-sm bg-white rounded-2xl overflow-hidden border border-stone-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                      <thead>
                        <tr className="border-b border-stone-200 bg-stone-50/80 text-stone-700">
                          <th className="p-4 font-semibold">Size</th>
                          <th className="p-4 font-semibold">Chest (in)</th>
                          <th className="p-4 font-semibold">Waist (in)</th>
                          <th className="p-4 font-semibold">Hips (in)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-stone-600">
                        <tr className="transition-all hover:bg-stone-50/30">
                          <td className="p-4 font-medium text-stone-900">S (Small)</td>
                          <td className="p-4">34 - 36</td>
                          <td className="p-4">28 - 30</td>
                          <td className="p-4">35 - 37</td>
                        </tr>
                        <tr className="transition-all hover:bg-stone-50/30">
                          <td className="p-4 font-medium text-stone-900">M (Medium)</td>
                          <td className="p-4">38 - 40</td>
                          <td className="p-4">32 - 34</td>
                          <td className="p-4">39 - 41</td>
                        </tr>
                        <tr className="transition-all hover:bg-stone-50/30">
                          <td className="p-4 font-medium text-stone-900">L (Large)</td>
                          <td className="p-4">42 - 44</td>
                          <td className="p-4">36 - 38</td>
                          <td className="p-4">43 - 45</td>
                        </tr>
                        <tr className="transition-all hover:bg-stone-50/30">
                          <td className="p-4 font-medium text-stone-900">XL (Extra Large)</td>
                          <td className="p-4">46 - 48</td>
                          <td className="p-4">40 - 42</td>
                          <td className="p-4">47 - 49</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Elegant Footer Disclaimer */}
              <div className="shrink-0 border-t border-stone-200/60 bg-stone-50/50 p-4 text-center select-none mt-auto">
                <p className="text-xs md:text-sm uppercase tracking-wider text-stone-500">
                  Need help? Contact our premium concierge service for personalized fitting advice.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
