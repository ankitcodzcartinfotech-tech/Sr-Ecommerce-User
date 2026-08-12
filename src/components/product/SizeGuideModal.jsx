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
        <button className="flex items-center gap-2 h-11 px-5 rounded-full border border-stone-200 bg-white/50 text-sm font-semibold uppercase tracking-wider text-[#b67b45] transition-all hover:border-[#b67b45] hover:bg-[#fffaf3] active:scale-98 shadow-sm hover:shadow cursor-pointer">
          <Ruler size={18} className="animate-pulse" />
          <span>Size Guide</span>
        </button>
      </DialogTrigger>
      <DialogContent
        hideCloseButton
        className="w-full h-dvh max-w-none rounded-t-[28px] rounded-b-none p-0 md:max-w-6xl md:h-auto md:max-h-[90vh] md:rounded-3xl flex flex-col bg-[#fffaf3] border-stone-200/50 overflow-hidden"
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
              <div className="shrink-0 relative overflow-hidden bg-linear-to-r from-[#241713] to-[#402a22] px-5 py-6 md:p-8 text-center text-[#fffaf3] select-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(182,123,69,0.15),transparent_50%)]" />
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[24px_24px]" />

                <h2 className="text-2xl md:text-4xl font-semibold font-serif tracking-wide text-[#fffdf8] mb-1">
                  Size Chart
                </h2>
                <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-[#ead7c4]/80">
                  Find your perfect fit before placing an order
                </p>

                {/* Elegant Floral Motif divider */}
                <div className="flex justify-center items-center gap-3 mt-4 text-[#ead7c4]/50">
                  <span className="h-px w-12 bg-linear-to-r from-transparent to-[#ead7c4]/50" />
                  <Sparkles size={12} className="text-[#ead7c4]/65 animate-pulse" />
                  <span className="h-px w-12 bg-linear-to-l from-transparent to-[#ead7c4]/50" />
                </div>
              </div>

              {/* Modal Body */}
              <div className="shrink-0 p-6 space-y-6">
                {/* Standard Saree Information Card */}
                <div className="rounded-2xl md:rounded-3xl border border-[#ead7c4] bg-[#fffaf3] p-6 md:p-8 flex flex-col items-center justify-center text-center gap-6 shadow-sm md:shadow-xl">
                  <div className="space-y-2">
                    <h4 className="text-xl md:text-2xl font-serif font-semibold text-[#241713]">Standard Saree Dimensions</h4>
                    <p className="text-sm md:text-base text-[#6d5e57]">Sarees are universally "Free Size" and perfectly fit all body types.</p>
                  </div>

                  <div className="grid gap-3 w-full max-w-2xl text-left mt-2">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#ead7c4]/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:border-[#b67b45]/40">
                      <div className="mt-1 font-bold text-[#b67b45] text-lg font-serif">01</div>
                      <div>
                        <p className="text-sm md:text-base font-semibold text-[#241713]">Length: <span className="text-[#b67b45]">5.5 Meters</span> <span className="text-xs font-medium text-stone-400 font-sans">(Approx. 216 inches)</span></p>
                        <p className="text-xs md:text-sm text-[#6d5e57] mt-1.5 leading-relaxed">This generous length ensures you can perfectly drape the saree with beautiful pleats and a flowing pallu.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#ead7c4]/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:border-[#b67b45]/40">
                      <div className="mt-1 font-bold text-[#b67b45] text-lg font-serif">02</div>
                      <div>
                        <p className="text-sm md:text-base font-semibold text-[#241713]">Width (Panna): <span className="text-[#b67b45]">1.1 Meters</span> <span className="text-xs font-medium text-stone-400 font-sans">(Approx. 44 inches)</span></p>
                        <p className="text-xs md:text-sm text-[#6d5e57] mt-1.5 leading-relaxed">Provides ample height to ensure full floor-length coverage when draped elegantly.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#ead7c4]/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:border-[#b67b45]/40">
                      <div className="mt-1 font-bold text-[#b67b45] text-lg font-serif">03</div>
                      <div>
                        <p className="text-sm md:text-base font-semibold text-[#241713]">Blouse Piece: <span className="text-[#b67b45]">0.8 Meters</span> <span className="text-xs font-medium text-stone-400 font-sans">(Unstitched)</span></p>
                        <p className="text-xs md:text-sm text-[#6d5e57] mt-1.5 leading-relaxed">Included with the saree. It can be easily cut and custom-tailored to your exact size.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Elegant Footer Disclaimer */}
              <div className="shrink-0 border-t border-stone-200/60 bg-stone-50/50 p-4 text-center select-none mt-auto">
                <p className="text-xs md:text-sm uppercase tracking-wider text-[#6d5e57]">
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
