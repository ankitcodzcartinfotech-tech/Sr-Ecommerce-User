"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, GitCompare } from "lucide-react";
import { useCompare } from "@/contexts/CompareContext";
import { getProductName, getProductImagePath, resolveMediaSrc } from "@/lib/storefront";

export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const router = useRouter();

  return (
    <AnimatePresence>
      {compareList.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 inset-x-0 z-50 border-t border-stone-200 bg-white/95 px-4 py-3 shadow-[0_-4px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm"
        >
          <div className="mx-auto flex max-w-5xl items-center gap-3">
            <GitCompare size={18} className="shrink-0 text-emerald-600" />
            <p className="hidden text-xs font-semibold text-stone-700 sm:block">
              Compare ({compareList.length}/3)
            </p>

            <div className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
              {compareList.map((product) => {
                const img = resolveMediaSrc(getProductImagePath(product));
                const id = product._id || product.id;
                return (
                  <div key={id} className="relative shrink-0 flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-2 py-1.5">
                    {img && (
                      <div className="relative h-8 w-7 overflow-hidden rounded-lg">
                        <Image src={img} alt={getProductName(product)} fill sizes="28px" className="object-cover" />
                      </div>
                    )}
                    <span className="max-w-20 truncate text-[11px] font-medium text-stone-700 sm:max-w-30">
                      {getProductName(product)}
                    </span>
                    <button
                      onClick={() => removeFromCompare(id)}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-200 text-stone-500 hover:bg-rose-100 hover:text-rose-600 cursor-pointer"
                    >
                      <X size={11} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={clearCompare}
                className="rounded-full border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-500 hover:border-stone-300 cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={() => router.push("/compare")}
                disabled={compareList.length < 2}
                className="flex items-center gap-1.5 rounded-full bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white transition-all hover:bg-emerald-600 disabled:opacity-50 cursor-not-allowed"
              >
                Compare Now <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
