"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { getRecentlyViewed, addRecentlyViewed, getProduct } from "@/Api/AllApi";
import {
  formatCurrency, resolveMediaSrc, getProductName,
  getProductImagePath, getProductPrice, getProductHref, getProductMrp,
} from "@/lib/storefront";
import {
  getGuestRecentlyViewed,
  clearGuestRecentlyViewed,
} from "@/lib/guestRecentlyViewed";

export default function RecentlyViewedSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  useEffect(() => {
    const token = typeof window !== "undefined" && localStorage.getItem("userToken");

    if (token) {
      // ── Logged-in: merge any guest IDs then fetch from API ──────────────
      const guestIds = getGuestRecentlyViewed();

      // Push guest IDs to backend (fire-and-forget)
      if (guestIds.length > 0) {
        Promise.all(
          guestIds.map((id) => addRecentlyViewed({ productId: id }).catch(() => {}))
        ).then(() => clearGuestRecentlyViewed());
      }

      getRecentlyViewed()
        .then((d) =>
          setProducts(
            (d?.products || []).map((i) => i.product).filter(Boolean).slice(0, 10)
          )
        )
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      // ── Guest: read IDs from localStorage then fetch each product ───────
      const guestIds = getGuestRecentlyViewed();

      if (guestIds.length === 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(false);
        return;
      }

      // Fetch all products in parallel (cap at 10)
      Promise.allSettled(
        guestIds.slice(0, 10).map((id) => getProduct(id).then((d) => d?.product || null))
      )
        .then((results) => {
          const loaded = results
            .filter((r) => r.status === "fulfilled" && r.value)
            .map((r) => r.value);
          setProducts(loaded);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, []);

  if (!loading && products.length === 0) return null;

  const scroll = (dir) => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <section className="px-4 py-14 sm:px-6 md:px-10 lg:px-14">
      <div className="mx-auto max-w-[1440px]">
        {/* Heading */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-emerald-700">Your History</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-[#1A1A1A] sm:text-3xl">
              Continue Where You Left Off
            </h2>
            <p className="mt-1 text-sm text-stone-500">Products You&apos;ve Recently Explored</p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button onClick={() => scroll(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 hover:border-emerald-500 hover:text-emerald-700 transition-all cursor-pointer">
              <ChevronLeft size={18}/>
            </button>
            <button onClick={() => scroll(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 hover:border-emerald-500 hover:text-emerald-700 transition-all cursor-pointer">
              <ChevronRight size={18}/>
            </button>
          </div>
        </div>

        {/* Slider */}
        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-56 shrink-0">
                <div className="aspect-3/4 animate-pulse rounded-2xl bg-stone-100"/>
                <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-stone-100"/>
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-stone-100"/>
              </div>
            ))}
          </div>
        ) : (
          <div ref={sliderRef}
            className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth snap-x snap-mandatory">
            {products.map((product, i) => {
              const img = resolveMediaSrc(getProductImagePath(product));
              const name = getProductName(product);
              const price = getProductPrice(product);
              const mrp = getProductMrp(product);
              const href = getProductHref(product);
              const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

              return (
                <motion.div key={product._id || i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="w-44 shrink-0 snap-start sm:w-52 md:w-56">
                  <Link href={`/product/${product._id || product.id}`}>
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-100">
                      {img
                        ? <Image src={img} alt={name} fill sizes="224px" className="object-cover group-hover:scale-105 transition-transform duration-500"/>
                        : <div className="flex h-full items-center justify-center text-stone-300"><Clock size={28}/></div>
                      }
                      {discount > 0 && (
                        <span className="absolute left-3 top-3 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-rose-600">{discount}% OFF</span>
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="line-clamp-2 text-xs font-medium leading-snug text-stone-800 group-hover:text-emerald-700 transition-colors">{name}</p>
                      <div className="mt-1.5 flex items-baseline gap-2">
                        <span className="text-sm font-bold font-sans text-[#1A1A1A]">{formatCurrency(price)}</span>
                        {mrp > price && <span className="text-xs font-medium text-stone-400 line-through">{formatCurrency(mrp)}</span>}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
