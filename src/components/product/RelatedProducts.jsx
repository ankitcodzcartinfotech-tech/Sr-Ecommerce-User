"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, Eye, Star } from "lucide-react";
import { getProducts } from "@/Api/AllApi";
import { addToWishlist } from "@/Api/AllApi";
import {
  formatCurrency, getProductHref, getProductImagePath,
  getProductMetrics, getProductMrp, getProductName,
  getProductPrice, normalizeProductList, resolveMediaSrc,
} from "@/lib/storefront";

function ProductSlide({ product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const href  = getProductHref(product);
  const name  = getProductName(product);
  const price = getProductPrice(product);
  const mrp   = getProductMrp(product);
  const img   = resolveMediaSrc(getProductImagePath(product));
  const { rating, reviews } = getProductMetrics(product);
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  async function handleWishlist(e) {
    e.preventDefault();
    if (!(typeof window !== "undefined" && localStorage.getItem("userToken"))) return;
    setLoading(true);
    try {
      if (!wishlisted) {
        await addToWishlist({ productId: product._id || product.id });
        setWishlisted(true);
      } else {
        setWishlisted(false);
      }
    } catch { /* silent */ }
    setLoading(false);
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative flex w-[200px] shrink-0 flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.07)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-500 sm:w-[230px] lg:w-[260px]"
    >
      {/* Image */}
      <Link href={href} className="relative block overflow-hidden bg-[#FAFAF8] cursor-pointer" style={{ height: "300px" }}>
        {img ? (
          <Image
            src={img} alt={name} fill sizes="260px"
            className="object-contain p-3 transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-stone-100 text-stone-300">
            <Eye size={32}/>
          </div>
        )}
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white">
            {discount}% OFF
          </span>
        )}
        {/* Wishlist */}
        <button onClick={handleWishlist} disabled={loading}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow backdrop-blur-sm transition-all hover:bg-white hover:scale-105 cursor-not-allowed">
          <Heart size={15} className={wishlisted ? "fill-rose-500 text-rose-500" : "text-stone-500"}/>
        </button>
        {/* Quick view overlay */}
        <div className="absolute inset-x-3 bottom-3 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Link href={href}
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-white/95 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-800 hover:bg-[#e88436] hover:text-white transition-colors backdrop-blur-sm cursor-pointer">
            <Eye size={13}/> Quick View
          </Link>
        </div>
      </Link>
      {/* Info */}
      <div className="flex flex-1 flex-col px-4 py-4">
        <Link href={href} className="cursor-pointer">
          <p className="line-clamp-2 text-sm font-medium leading-snug text-stone-800 hover:text-[#e88436] transition-colors">{name}</p>
        </Link>
        {rating > 0 && (
          <div className="mt-1.5 flex items-center gap-1">
            <Star size={11} className="fill-[#e88436] text-[#e88436]"/>
            <span className="text-xs font-medium text-stone-600">{rating}</span>
            <span className="text-xs text-stone-400">({reviews})</span>
          </div>
        )}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-stone-900">{formatCurrency(price)}</span>
          {mrp > price && <span className="text-xs text-stone-400 line-through">{formatCurrency(mrp)}</span>}
        </div>
      </div>
    </motion.div>
  );
}

export default function RelatedProducts({ categoryId, excludeId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!categoryId) { 
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false); 
      return; 
    }
    const params = { limit: 12 };
    if (categoryId) params.category = categoryId;
    getProducts(params)
      .then(data => {
        const all = normalizeProductList(data).filter(p => (p._id||p.id) !== excludeId);
        setProducts(all.slice(0, 10));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categoryId, excludeId]);

  function scroll(dir) {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 280, behavior: "smooth" });
  }

  if (!loading && !products.length) return null;

  return (
    <section className="px-4 pb-16 sm:px-6 md:px-10 lg:px-14">
      <div className="mx-auto max-w-[1440px]">
        {/* Heading */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-[#e88436]">Recommendations</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-stone-900 sm:text-3xl">You May Also Like</h2>
            <p className="mt-1 text-sm text-stone-500">Handpicked recommendations based on this product</p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button onClick={() => scroll(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 hover:border-[#e88436] hover:text-[#e88436] transition-colors cursor-pointer">
              <ChevronLeft size={18}/>
            </button>
            <button onClick={() => scroll(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 hover:border-[#e88436] hover:text-[#e88436] transition-colors cursor-pointer">
              <ChevronRight size={18}/>
            </button>
          </div>
        </div>

        {/* Carousel */}
        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-[380px] w-[220px] shrink-0 animate-pulse rounded-[22px] bg-stone-100"/>
            ))}
          </div>
        ) : (
          <div ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {products.map((p, i) => (
              <div key={p._id || i} style={{ scrollSnapAlign: "start" }}>
                <ProductSlide product={p}/>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
