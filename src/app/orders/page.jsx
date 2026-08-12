"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Package, Clock, CheckCircle, XCircle, Truck,
  ShoppingBag,
  Calendar, Filter, ArrowRight, Eye, RotateCcw,
  Star, TrendingUp,
} from "lucide-react";
import { getOrders } from "@/Api/AllApi";
import { formatCurrency, resolveMediaSrc } from "@/lib/storefront";

/* ── Status config ─────────────────────────────────────────── */
const STATUS = {
  Pending: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", icon: Clock },
  Confirmed: { color: "text-stone-900", bg: "bg-stone-100", border: "border-stone-200", dot: "bg-stone-500", icon: CheckCircle },
  Processing: { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-600", icon: Package },
  Shipped: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", icon: Truck },
  Delivered: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", icon: CheckCircle },
  Cancelled: { color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", dot: "bg-rose-500", icon: XCircle },
};

const STEPS = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];

/* Expected delivery = +5 days from createdAt */
function expectedDelivery(createdAt) {
  const d = new Date(createdAt);
  d.setDate(d.getDate() + 5);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Horizontal progress track ─────────────────────────────── */
function ProgressTrack({ status }) {
  if (status === "Cancelled") return null;
  const current = STEPS.indexOf(status);
  return (
    <div className="mt-6 mb-2 flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = i <= current;
        const active = i === current;
        return (
          <div key={step} className="flex flex-1 items-center">
            <div className={`flex h-6 w-6 lg:h-7 lg:w-7 shrink-0 items-center justify-center rounded-full border-2 text-[10px] lg:text-xs font-bold transition-all duration-500 ${done ? "border-emerald-600 bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-600/20" : "border-[#E5E0D8] bg-white text-[#A39C93]"
              } ${active ? "ring-4 ring-emerald-500/20 scale-125" : ""}`}>
              {active && <span className="absolute inset-0 rounded-full animate-ping bg-emerald-500/20" />}
              <span className="relative z-10">{done && !active ? "✓" : i + 1}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="relative flex-1 mx-1 lg:mx-2 h-0.5 lg:h-1 rounded-full bg-[#E5E0D8] overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: i < current ? "100%" : "0%" }}
                  transition={{ duration: 0.8, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-600 to-emerald-500" 
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("userToken")) {
      router.push("/login?redirect=/orders");
      return;
    }
    getOrders()
      .then((r) => setOrders(Array.isArray(r?.orders || r?.data) ? (r?.orders || r?.data) : []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [router]);

  const FILTERS = [
    { value: "all", label: "All Orders" },
    { value: "Pending", label: "Pending" },
    { value: "Shipped", label: "Shipped" },
    { value: "Delivered", label: "Delivered" },
    { value: "Cancelled", label: "Cancelled" },
  ].map(f => ({ ...f, count: f.value === "all" ? orders.length : orders.filter(o => o.orderStatus === f.value).length }));

  const filtered = orders.filter(o => filter === "all" || o.orderStatus === filter);

  const totalSpent = orders.filter(o => o.orderStatus !== "Cancelled").reduce((s, o) => s + (o.totalAmount || 0), 0);
  const inProgress = orders.filter(o => ["Confirmed", "Processing", "Shipped"].includes(o.orderStatus)).length;

  /* ── Skeleton ──────────────────────────────────────────────*/
  if (loading) return (
    <div className="min-h-screen pb-24 pt-20 page-shell">
      <div className="mx-auto w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl px-4 sm:px-6 md:px-10 py-10 space-y-8">
        {/* Header Skeleton */}
        <div>
          <div className="h-4 w-24 animate-pulse rounded-full bg-black/5 mb-3" />
          <div className="h-10 w-48 sm:h-12 sm:w-64 animate-pulse rounded-xl bg-black/5 mb-3" />
          <div className="h-4 w-64 sm:w-80 animate-pulse rounded-full bg-black/5" />
        </div>
        
        {/* Stats Skeleton */}
        <div className="flex gap-4 overflow-hidden sm:grid sm:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 min-w-[220px] sm:min-w-0 animate-pulse rounded-2xl bg-black/5" />)}
        </div>

        {/* Filter Skeleton */}
        <div className="flex gap-3 overflow-hidden py-2">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 w-24 animate-pulse rounded-full bg-black/5 shrink-0" />)}
        </div>

        {/* Order Card Skeletons */}
        <div className="space-y-6">
          {[1, 2, 3].map(i => <div key={i} className="h-72 w-full animate-pulse rounded-[24px] bg-black/5" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 pt-20 page-shell">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="relative px-4 sm:px-6 py-8 sm:py-10 md:px-10">
        <div className="mx-auto w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">My Account</p>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#2D2A26] tracking-tight">My Orders</h1>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-[#736B63] max-w-lg">Track, manage, and reorder your exclusive purchases.</p>
          </motion.div>

          {orders.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-8 flex overflow-x-auto gap-3 sm:gap-4 lg:gap-6 pb-4 sm:pb-0 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3">
              {[
                { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-[#2D2A26]", bg: "bg-gradient-to-br from-stone-50 to-white" },
                { label: "In Progress", value: inProgress, icon: Truck, color: "text-emerald-700", bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50" },
                { label: "Total Spent", value: formatCurrency(totalSpent), icon: TrendingUp, color: "text-emerald-800", bg: "bg-gradient-to-br from-emerald-50 to-emerald-100" },
              ].map((s) => (
                <div key={s.label} className="relative shrink-0 w-[240px] sm:w-auto flex items-center gap-4 p-4 sm:p-5 lg:p-6 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
                  <div className={`flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-full shadow-inner ${s.bg}`}>
                    <s.icon size={20} className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${s.color}`} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className={`text-lg sm:text-xl lg:text-2xl font-black tracking-tight leading-none ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] sm:text-[11px] lg:text-xs font-bold uppercase tracking-wider text-muted mt-1 opacity-80">{s.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
      {/* ── Body ───────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl px-4 sm:px-6 py-4 sm:py-8 md:px-10">
        
        {/* Filter pills */}
        <div className="mb-6 sm:mb-8 flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Filter size={16} className="shrink-0 text-muted mr-3 hidden sm:block" />
          <LayoutGroup>
            {FILTERS.map(tab => {
              const isActive = filter === tab.value;
              return (
                <button key={tab.value} onClick={() => setFilter(tab.value)}
                  className={`relative group flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-xs lg:text-sm font-semibold transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${isActive
                      ? "text-white"
                      : "bg-white text-[#736B63] hover:bg-gray-50 border border-black/5 hover:border-black/10 hover:shadow-sm"
                    } cursor-pointer`}>
                  {isActive && (
                    <motion.div layoutId="activeFilter" className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full shadow-lg shadow-emerald-700/20" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                  {tab.count > 0 && <span className={`relative z-10 rounded-full px-2 py-0.5 text-[10px] lg:text-xs font-bold transition-colors ${isActive ? "bg-white/20 text-white" : "bg-black/5 text-[#2D2A26] group-hover:bg-black/10"}`}>{tab.count}</span>}
                </button>
              );
            })}
          </LayoutGroup>
        </div>

        {/* Empty */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="surface-card flex flex-col items-center px-8 py-20 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-stone-100">
              <ShoppingBag size={34} className="text-[#A39C93]" />
            </div>
            <p className="text-xl font-serif font-semibold text-[#2D2A26]">{filter === "all" ? "No orders yet" : `No ${filter.toLowerCase()} orders`}</p>
            <p className="mt-2 text-sm text-[#736B63]">Start exploring our premium collection and make your first purchase.</p>
            <Link href="/shop" className="btn-primary mt-8 inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold cursor-pointer">
              Browse Collection <ArrowRight size={16} />
            </Link>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-6">
              {filtered.map((order, index) => {
                const cfg = STATUS[order.orderStatus] || STATUS.Pending;
                const StatusIcon = cfg.icon;
                const items = order.items || [];
                const preview = items.slice(0, 2);
                const extra = items.length - 2;
                const isDelivered = order.orderStatus === "Delivered";
                const isCancelled = order.orderStatus === "Cancelled";

                return (
                  <motion.div key={order._id}
                    initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }} transition={{ delay: index * 0.04 }}>
                    <div className="relative overflow-hidden rounded-[24px] bg-white border border-[#E5E0D8]/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
                      
                      {/* Modern glassy highlight behind header */}
                      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/[0.02] to-transparent pointer-events-none" />

                      {/* Accent bar */}
                      <div className={`h-1.5 w-full bg-gradient-to-r from-transparent via-current to-transparent opacity-70 ${cfg.color}`} />

                      <div className="p-5 sm:p-7 relative z-10">
                        {/* Top row */}
                        <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="order-id-text text-base sm:text-[1.1rem] font-bold text-[#2D2A26] truncate">
                              {order.orderNumber || `ORD-${order._id?.slice(-8).toUpperCase()}`}
                            </p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-[#736B63]">
                              <span className="flex items-center gap-1.5"><Calendar size={13} className="text-emerald-600" /> Placed {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                              {!isCancelled && <span className="flex items-center gap-1.5 text-[#1FA971]"><Truck size={13} /> Exp. {expectedDelivery(order.createdAt)}</span>}
                            </div>
                          </div>
                          <span className={`shrink-0 flex items-center gap-1.5 rounded-full border px-3 sm:px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                            <StatusIcon size={12} strokeWidth={2.5} />{order.orderStatus}
                          </span>
                        </div>

                        {/* Progress track */}
                        <ProgressTrack status={order.orderStatus} />

                        {/* Products preview */}
                        <div className="mt-6 space-y-3">
                          {preview.map(item => {
                            const img = resolveMediaSrc(item.productImage || item.product?.productDetail?.images?.[0]);
                            return (
                              <div key={item._id} className="group flex items-center gap-4 rounded-2xl border border-black/5 bg-gradient-to-br from-white to-stone-50/50 p-3 transition-all duration-300 hover:shadow-md hover:border-emerald-500/30">
                                <div className="relative h-16 w-14 sm:h-20 sm:w-16 shrink-0 overflow-hidden rounded-xl bg-stone-50 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                  {img ? <Image src={img} alt={item.productName} fill sizes="64px" className="object-cover" /> : <Package size={16} className="absolute inset-0 m-auto text-[#A39C93]" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="line-clamp-1 text-sm sm:text-base font-bold text-[#2D2A26] group-hover:text-emerald-700 transition-colors">{item.productName}</p>
                                  <p className="mt-1 text-xs sm:text-sm text-[#736B63]">Qty: {item.quantity} <span className="mx-1.5 text-emerald-600/50">•</span> <span className="font-semibold text-[#2D2A26]">{formatCurrency(item.price)}</span> each</p>
                                </div>
                                <p className="shrink-0 text-sm sm:text-base font-black text-emerald-700">{formatCurrency(item.subtotal)}</p>
                              </div>
                            );
                          })}
                          {extra > 0 && <p className="pl-2 pt-1 text-xs font-bold text-[#736B63]">+{extra} more item{extra > 1 ? "s" : ""}</p>}
                        </div>

                        {/* Footer */}
                        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-t border-black/5 pt-5">
                          <div className="w-full sm:w-auto flex justify-between sm:block items-end sm:items-start">
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#736B63]">Order Total</p>
                             <p className="total-amount-text text-xl sm:text-2xl font-bold text-emerald-700">{formatCurrency(order.totalAmount)}</p>
                          </div>
                          {/* Action buttons */}
                          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                            {isDelivered ? (
                              <>
                                <Link href={`/shop`} className="flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-2.5 text-xs font-bold text-[#2D2A26] transition-all hover:bg-gray-50 hover:shadow-sm active:scale-95 cursor-pointer">
                                  <RotateCcw size={14} /> Buy Again
                                </Link>
                                 <Link href={`/orders/orders-details/${order._id}`} className="flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100 px-6 py-2.5 text-xs font-bold text-emerald-800 transition-all hover:from-emerald-600 hover:to-emerald-700 hover:text-white shadow-sm hover:shadow-md active:scale-95 cursor-pointer">
                                  <Star size={14} /> Write Review
                                </Link>
                              </>
                            ) : (
                              <Link href={`/orders/orders-details/${order._id}`} className="flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-2.5 text-xs font-bold text-[#2D2A26] transition-all hover:bg-gray-50 hover:shadow-sm active:scale-95 cursor-pointer">
                                <Truck size={14} /> Track Order
                              </Link>
                            )}
                            <Link href={`/orders/orders-details/${order._id}`} className="flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-full bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 cursor-pointer">
                              <Eye size={14} /> View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
