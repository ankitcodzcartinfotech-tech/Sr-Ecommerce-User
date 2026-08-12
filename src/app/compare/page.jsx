"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitCompare,
  X,
  ShoppingBag,
  Star,
  ChevronLeft,
  Heart,
  Gem,
  Truck,
  ShieldCheck,
  RotateCcw,
  Scissors,
  Ruler,
  Sparkles,
  Calendar,
  Eye,
} from "lucide-react";
import { useCompare } from "@/contexts/CompareContext";
import { compareProducts } from "@/Api/AllApi";
import {
  formatCurrency,
  resolveMediaSrc,
  getProductName,
  getProductImagePath,
  getProductPrice,
  getProductMrp,
  getProductCategory,
  getProductDescription,
  getProductHref,
} from "@/lib/storefront";
import { addToCart, addToWishlist } from "@/Api/AllApi";
import { useRouter } from "next/navigation";

/* ── attribute sections to compare ─────────────────────────── */
const ATTR_SECTIONS = [
  {
    title: "Pricing",
    icon: Gem,
    attributes: [
      { label: "Selling Price", fn: (p) => formatCurrency(getProductPrice(p)), highlight: true },
      { label: "MRP", fn: (p) => formatCurrency(getProductMrp(p)) },
      {
        label: "Discount",
        fn: (p) => {
          const price = getProductPrice(p);
          const mrp = getProductMrp(p);
          if (mrp > price && price > 0) {
            return `${Math.round(((mrp - price) / mrp) * 100)}% OFF`;
          }
          return "—";
        },
      },
    ],
  },
  {
    title: "Product Details",
    icon: Scissors,
    attributes: [
      { label: "Product Name", fn: (p) => getProductName(p) },
      { label: "Category", fn: (p) => getProductCategory(p) },
      { label: "Description", fn: (p) => getProductDescription(p) },
    ],
  },
  {
    title: "Fabric Information",
    icon: Sparkles,
    attributes: [
      { label: "Fabric", fn: (p) => p.productDetail?.fabric || p.fabric || "—" },
      { label: "Occasion", fn: (p) => p.productDetail?.occasion || p.occasion || "—" },
      { label: "Color", fn: (p) => p.variants?.[0]?.color || "—" },
      { label: "Weight", fn: (p) => p.productDetail?.weight ? `${p.productDetail.weight} g` : "—" },
    ],
  },
  {
    title: "Availability",
    icon: Truck,
    attributes: [
      {
        label: "Stock Status",
        fn: (p) => {
          const hasStock = p.variants?.length > 0
            ? p.variants.some((v) => v.stock > 0)
            : (p.stockDetails?.openingQuantity > 0 || p.stock > 0);
          return hasStock ? "In Stock" : "Out of Stock";
        },
      },
      { label: "Total Variants", fn: (p) => (p.variants?.length ? `${p.variants.length} options` : "1 option") },
      
    ],
  },
  {
    title: "Care Instructions",
    icon: ShieldCheck,
    attributes: [
      { label: "Wash Care", fn: (p) => p.productDetail?.washCare || "Dry Clean Recommended" },
    ],
  },
];

function Toast({ msg, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-xl"
    >
      {msg}
    </motion.div>
  );
}

export default function ComparePage() {
  const router = useRouter();
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const ids = compareList.map((p) => p._id || p.id).filter(Boolean);
    if (!ids.length) {
      setProducts([]);
      return;
    }

    setLoading(true);
    compareProducts(ids)
      .then((d) => setProducts(d?.products || d || []))
      .catch(() => setProducts(compareList)) // fallback to context data
      .finally(() => setLoading(false));
  }, [compareList]);

  async function handleAddToCart(product) {
    const token = typeof window !== "undefined" && localStorage.getItem("userToken");
    if (!token) {
      router.push("/login");
      return;
    }
    
    const availableVariant = product?.variants?.find(v => v.stock > 0) || product?.variants?.[0];
    const stock = availableVariant ? (availableVariant.stock || 0) : (product?.stockDetails?.openingQuantity || product?.stock || 0);
    if (stock === 0) {
      setToast("This product is currently out of stock");
      return;
    }

    try {
      await addToCart({
        productId: product._id || product.id,
        variantId: availableVariant?._id || availableVariant?.id,
        quantity: 1,
      });
      setToast("Added to cart! 🛍️");
    } catch (ex) {
      setToast(ex.message || "Could not add to cart");
    }
  }

  async function handleAddToWishlist(product) {
    const token = typeof window !== "undefined" && localStorage.getItem("userToken");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      await addToWishlist({ productId: product._id || product.id });
      setToast("Added to wishlist! ❤️");
    } catch (ex) {
      setToast(ex.message || "Could not add to wishlist");
    }
  }

  const display = products.length ? products : compareList;

  // Find best value product (lowest price)
  const prices = display.map((p) => getProductPrice(p)).filter((p) => p > 0);
  const lowestPrice = prices.length ? Math.min(...prices) : null;

  return (
    <div className="min-h-screen bg-stone-50 pb-32 pt-20">
      {/* Header Hero */}
      <div className="bg-linear-to-b from-white/80 via-white/60 to-stone-50 px-6 py-10 backdrop-blur-md md:px-10">
        <div className="mx-auto max-w-[1440px]">
          <Link
            href="/shop"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} /> Back to Shop
          </Link>

          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-700">
                  Product Compare
                </p>
                {display.length > 0 && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    {display.length} Products
                  </span>
                )}
              </div>
              <h1 className="mt-2 font-serif text-3xl font-semibold text-[#1A1A1A] md:text-4xl lg:text-5xl">
                Find Your Perfect Product
              </h1>
              <p className="mt-2 max-w-xl text-sm text-stone-500">
                Compare premium products side by side to make the perfect choice
              </p>
            </div>

            {display.length > 0 && (
              <button
                onClick={clearCompare}
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
              >
                <RotateCcw size={12} /> Clear All
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-10">
        {/* Empty state */}
        {!loading && display.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center rounded-4xl bg-white px-8 py-24 text-center shadow-[0_4px_50px_rgba(0,0,0,0.04)]"
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
              <GitCompare size={40} className="text-emerald-600" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-[#1A1A1A]">No products to compare</h2>
            <p className="mt-2 max-w-sm text-sm text-stone-500">
              Add products using the compare button on product cards
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-600 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              Browse Products
            </Link>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-(520px) animate-pulse rounded-[28px] bg-stone-100" />
            ))}
          </div>
        )}

        {/* Desktop Comparison (Cards + Sections) */}
        {!loading && display.length > 0 && (
          <div className="hidden lg:block">
            {/* Product Header Cards */}
            <div className="mb-8 grid gap-6 lg:grid-cols-3">
              {display.map((product, index) => {
                const img = resolveMediaSrc(getProductImagePath(product));
                const id = product._id || product.id;
                const price = getProductPrice(product);
                const isBestValue = lowestPrice && price === lowestPrice;

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`group relative rounded-4xl bg-white p-6 shadow-[0_8px_60px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_80px_rgba(0,0,0,0.1)] ${
                      isBestValue ? "ring-2 ring-emerald-600 ring-offset-4" : ""
                    }`}
                  >
                    {/* Best Value Badge */}
                    {isBestValue && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          <Sparkles size={10} /> Best Value
                        </span>
                      </div>
                    )}
                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCompare(id)}
                      className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-stone-50 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                    {/* Product Image */}
                    <div className="relative mx-auto mb-6 aspect-3/4 w-full max-w-xs overflow-hidden rounded-3xl bg-stone-50">
                      {img ? (
                        <Image
                          src={img}
                          alt={getProductName(product)}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-stone-300">
                          <ShoppingBag size={48} />
                        </div>
                      )}
                    </div>
                    {/* Product Info */}
                    <div className="text-center">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                        {getProductCategory(product)}
                      </p>
                      <h3 className="mb-3 line-clamp-2 font-serif text-lg font-semibold text-[#1A1A1A]">
                        {getProductName(product)}
                      </h3>

                      {/* Price */}
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-bold text-[#1A1A1A]">
                          {formatCurrency(getProductPrice(product))}
                        </span>
                        {getProductMrp(product) > getProductPrice(product) && (
                          <span className="text-sm text-stone-400 line-through">
                            {formatCurrency(getProductMrp(product))}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => handleAddToWishlist(product)}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
                        >
                          <Heart size={18} />
                        </button>
                        <Link
                          href={getProductHref(product)}
                          className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 hover:border-emerald-500 hover:text-emerald-700 transition-all cursor-pointer"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-emerald-600 transition-all cursor-pointer"
                        >
                          <ShoppingBag size={14} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Comparison Sections */}
            <div className="space-y-6">
              {ATTR_SECTIONS.map((section, sectionIndex) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + sectionIndex * 0.1 }}
                    className="overflow-hidden rounded-4xl bg-white shadow-[0_4px_50px_rgba(0,0,0,0.04)]"
                  >
                    {/* Section Header */}
                    <div className="flex items-center gap-3 border-b border-stone-100 bg-stone-50 px-8 py-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                        <Icon size={18} className="text-emerald-600" />
                      </div>
                      <h2 className="font-serif text-xl font-semibold text-[#1A1A1A]">{section.title}</h2>
                    </div>

                    {/* Section Rows */}
                    <div className="divide-y divide-stone-100">
                      {section.attributes.map((attr, rowIndex) => (
                        <div
                          key={attr.label}
                          className={`grid grid-cols-[200px_1fr_1fr_1fr] items-center ${
                            rowIndex % 2 === 0 ? "bg-white" : "bg-stone-50/30"
                          }`}
                        >
                          {/* Feature Label */}
                          <div className="px-8 py-5">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                              {attr.label}
                            </p>
                          </div>

                          {/* Feature Values */}
                          {display.map((product, productIndex) => {
                            const value = attr.fn(product);
                            const price = getProductPrice(product);
                            const isLowestPrice = attr.highlight && lowestPrice && price === lowestPrice;

                            return (
                              <div
                                key={productIndex}
                                className={`border-l border-stone-100 px-8 py-5 ${
                                  productIndex === display.length - 1 ? "" : ""
                                }`}
                              >
                                {attr.highlight ? (
                                  <p
                                    className={`text-lg font-bold ${
                                      isLowestPrice ? "text-emerald-700" : "text-[#1A1A1A]"
                                    }`}
                                  >
                                    {value}
                                  </p>
                                ) : attr.label === "Stock Status" ? (
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                                      value === "In Stock"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-rose-50 text-rose-700"
                                    }`}
                                  >
                                    {value === "In Stock" ? (
                                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    ) : (
                                      <div className="h-2 w-2 rounded-full bg-rose-500" />
                                    )}
                                    {value}
                                  </span>
                                ) : (
                                  <p className="text-sm text-stone-700 leading-relaxed">{value}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile Horizontal Comparison */}
        {!loading && display.length > 0 && (
          <div className="lg:hidden">
            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
              {display.map((product, index) => {
                const img = resolveMediaSrc(getProductImagePath(product));
                const id = product._id || product.id;
                const price = getProductPrice(product);
                const isBestValue = lowestPrice && price === lowestPrice;

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="shrink-0 w-70"
                  >
                    <div
                      className={`relative rounded-[28px] bg-white p-5 shadow-[0_8px_60px_rgba(0,0,0,0.06)] ${
                        isBestValue ? "ring-2 ring-emerald-600" : ""
                      }`}
                    >
                      {/* Best Value Badge */}
                      {isBestValue && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                            <Sparkles size={10} /> Best Value
                          </span>
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCompare(id)}
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-stone-50 text-stone-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                      >
                        <X size={14} />
                      </button>

                      {/* Image */}
                      <div className="relative mt-3 aspect-3/4 w-full overflow-hidden rounded-[20px] bg-stone-50">
                        {img && (
                          <Image
                            src={img}
                            alt={getProductName(product)}
                            fill
                            sizes="280px"
                            className="object-cover"
                          />
                        )}
                      </div>

                      {/* Name & Price */}
                      <div className="mt-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                          {getProductCategory(product)}
                        </p>
                        <h3 className="mt-1 line-clamp-2 font-serif text-base font-semibold text-[#1A1A1A]">
                          {getProductName(product)}
                        </h3>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xl font-bold text-[#1A1A1A]">
                            {formatCurrency(getProductPrice(product))}
                          </span>
                          {getProductMrp(product) > getProductPrice(product) && (
                            <span className="text-xs text-stone-400 line-through">
                              {formatCurrency(getProductMrp(product))}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Key Attributes */}
                      <div className="mt-4 space-y-2 border-t border-stone-100 pt-4">
                        {ATTR_SECTIONS.slice(0, 2).flatMap((s) =>
                          s.attributes.slice(0, 2).map((attr) => (
                            <div key={`${s.title}-${attr.label}`} className="flex items-start justify-between">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                                {attr.label}
                              </span>
                              <span className="text-xs font-medium text-stone-700 text-right max-w-40">
                                {attr.fn(product)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleAddToWishlist(product)}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 cursor-pointer"
                        >
                          <Heart size={16} />
                        </button>
                        <Link
                          href={getProductHref(product)}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 cursor-pointer"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex flex-1 items-center justify-center rounded-full bg-emerald-700 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white cursor-pointer"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <AnimatePresence>{toast && <Toast msg={toast} onClose={() => setToast(null)} />}</AnimatePresence>
    </div>
  );
}
