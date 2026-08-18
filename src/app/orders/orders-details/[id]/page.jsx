"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, MapPin, CreditCard, CheckCircle, Clock,
  Truck, Home, XCircle, ChevronLeft, Download, Phone,
  Mail, MessageCircle, RotateCcw, Star, Shield,
  Calendar, AlertCircle, ArrowLeft, RefreshCw, FileText, Loader2,
} from "lucide-react";
import { getOrder, cancelOrder, downloadInvoicePdf } from "@/Api/AllApi";
import { formatCurrency, resolveMediaSrc, getProductImagePath } from "@/lib/storefront";
import { getSocket } from "@/lib/socket";
import { playNotification, playWarning } from "@/utils/notificationSound";
import { toast } from "@/utils/toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

/* ── Status config ─────────────────────────────────────────── */
const STATUS = {
  Pending:    { color: "text-amber-700",   bg: "bg-amber-50",    border: "border-amber-200",  icon: Clock        },
  Confirmed:  { color: "text-blue-700",    bg: "bg-blue-50",     border: "border-blue-200",   icon: CheckCircle  },
  Processing: { color: "text-violet-700",  bg: "bg-violet-50",   border: "border-violet-200", icon: Package      },
  Shipped:    { color: "text-indigo-700",  bg: "bg-indigo-50",   border: "border-indigo-200", icon: Truck        },
  Delivered:  { color: "text-emerald-700", bg: "bg-emerald-50",  border: "border-emerald-200",icon: CheckCircle  },
  Cancelled:  { color: "text-rose-700",    bg: "bg-rose-50",     border: "border-rose-200",   icon: XCircle      },
};

const TIMELINE_STEPS = [
  { key: "Pending",    label: "Order Placed",    icon: Package      },
  { key: "Confirmed",  label: "Order Confirmed", icon: CheckCircle  },
  { key: "Processing", label: "Processing",      icon: Package      },
  { key: "Shipped",    label: "Shipped",         icon: Truck        },
  { key: "Delivered",  label: "Delivered",       icon: Home         },
];

/* ── Section wrapper ────────────────────────────────────────── */
function Section({ title, icon: Icon, children, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="rounded-[22px] bg-white p-5 shadow-sm ring-1 ring-stone-900/5 md:p-7">
      {title && (
        <div className="mb-4 flex items-center gap-2.5 border-b border-stone-100 pb-4 md:mb-5">
          {Icon && <Icon size={18} className="text-emerald-600" />}
          <h2 className="text-sm font-bold text-[#1A1A1A] md:text-base">{title}</h2>
        </div>
      )}
      {children}
    </motion.div>
  );
}

/* ── Row helper ─────────────────────────────────────────────── */
function Row({ label, value, highlight, green }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-stone-500">{label}</span>
      <span className={`font-semibold ${green ? "text-emerald-600" : highlight ? "text-[#1A1A1A] text-base" : "text-[#1A1A1A]"}`}>{value}</span>
    </div>
  );
}

/* ── Return / Exchange Modal ────────────────────────────────── */
const RETURN_REASONS = [
  "Wrong size / doesn't fit",
  "Received wrong product",
  "Product damaged or defective",
  "Product not as described",
  "Changed my mind",
  "Other",
];

function ReturnExchangeModal({ open, onClose, order, type }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) { 
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedItems([]); 
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReason(""); 
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotes(""); 
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDone(false); 
    }
  }, [open]);

  function toggleItem(id) {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedItems.length) return;
    if (!reason) return;
    setSubmitting(true);
    // Simulate API call — replace with real endpoint when available
    await new Promise(r => setTimeout(r, 900));
    setSubmitting(false);
    setDone(true);
  }

  const title = type === "exchange" ? "Request Exchange" : "Request Return";
  const color = type === "exchange" ? "text-indigo-600" : "text-rose-600";
  const bg    = type === "exchange" ? "bg-indigo-50"   : "bg-rose-50";
  const btn   = type === "exchange" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-rose-600 hover:bg-rose-700";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }} transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed inset-x-4 bottom-0 z-50 mx-auto max-w-lg rounded-t-[28px] bg-white pb-safe sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px]"
          >
            <div className="max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className={`flex items-center justify-between rounded-t-[28px] ${bg} px-6 py-4`}>
                <h2 className={`font-bold ${color}`}>{title}</h2>
                <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-stone-500 hover:bg-white cursor-pointer">
                  <XCircle size={16} />
                </button>
              </div>

              {done ? (
                <div className="flex flex-col items-center px-8 py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle size={32} className="text-emerald-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-[#1A1A1A]">Request Submitted!</h3>
                  <p className="text-sm text-stone-500">
                    Your {type} request has been received. Our team will contact you within 24–48 hours.
                  </p>
                  <button type="button" onClick={onClose} className="mt-6 rounded-full bg-emerald-700 px-8 py-3 text-sm font-bold text-white hover:bg-emerald-600 cursor-pointer">
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
                  {/* Select items */}
                  <div>
                    <p className="mb-2 text-sm font-semibold text-[#1A1A1A]">Select Items *</p>
                    <div className="space-y-2">
                      {(order?.items || []).map(item => (
                        <label key={item._id} className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all ${selectedItems.includes(item._id) ? "border-emerald-600 bg-emerald-50/40" : "border-stone-200"}`}>
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item._id)}
                            onChange={() => toggleItem(item._id)}
                            className="accent-emerald-700"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 text-sm font-medium text-[#1A1A1A]">{item.productName}</p>
                            <p className="text-xs text-stone-500">Qty: {item.quantity} · {formatCurrency(item.price)}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    {!selectedItems.length && <p className="mt-1.5 text-xs text-rose-500">Please select at least one item.</p>}
                  </div>

                  {/* Reason */}
                  <div>
                    <p className="mb-2 text-sm font-semibold text-[#1A1A1A]">Reason *</p>
                    <div className="grid grid-cols-2 gap-2">
                      {RETURN_REASONS.map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setReason(r)}
                          className={`rounded-xl border-2 px-3 py-2.5 text-left text-xs font-medium transition-all ${reason === r ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-stone-200 text-stone-600 hover:border-stone-300"} cursor-pointer`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    {!reason && <p className="mt-1.5 text-xs text-rose-500">Please select a reason.</p>}
                  </div>

                  {/* Notes */}
                  <div>
                    <p className="mb-2 text-sm font-semibold text-[#1A1A1A]">Additional Notes</p>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Any additional details..."
                      className="w-full resize-none rounded-xl border border-stone-200 px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-emerald-500 placeholder:text-stone-400"
                    />
                  </div>

                  {/* Pickup note */}
                  <div className="rounded-xl bg-stone-50 px-4 py-3 text-xs text-stone-500">
                    <span className="font-semibold">Pickup Address:</span> We will arrange pickup from your delivery address. Our team will confirm details via SMS/email.
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !selectedItems.length || !reason}
                    className={`w-full rounded-full py-3.5 text-sm font-bold text-white transition-all disabled:opacity-50 ${btn} cursor-not-allowed`}
                  >
                    {submitting ? "Submitting…" : `Submit ${type === "exchange" ? "Exchange" : "Return"} Request`}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [returnModal, setReturnModal] = useState(null); // null | "return" | "exchange"
  const [dlLoading, setDlLoading] = useState(false);

  const fetchOrder = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const r = await getOrder(params.id);
      const orderData = r?.order || r?.data || null;
      setOrder(orderData);
    } catch (e) {
      if (!silent) setError(e.message || "Could not load order");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("userToken")) {
      router.push(`/login?redirect=/orders/orders-details/${params.id}`);
      return;
    }
    
    if (params.id) {
      fetchOrder();
      
      // Auto-refresh order status every 60s (fallback)
      const pollInterval = setInterval(() => {
        fetchOrder(true);
      }, 60000);
      
      // Setup Real-time WebSockets tracking
      const socket = getSocket();
      if (socket) {
        socket.emit("order:join", params.id);
        
        socket.on("order:updated", (updatedOrder) => {
          setOrder(updatedOrder);
          playNotification();
          toast.success("Order status updated!");
        });
      }
      
      return () => {
        clearInterval(pollInterval);
        if (socket) {
          socket.emit("order:leave", params.id);
          socket.off("order:updated");
        }
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, router]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelOrder(params.id);
      await fetchOrder();
      playWarning();
      toast.success("Order cancelled successfully");
    } catch (e) {
      toast.error(e.message || "Could not cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (dlLoading) return;
    setDlLoading(true);
    try {
      const invoiceUrl = await downloadInvoicePdf(params.id);
      window.open(invoiceUrl, "_blank");
      toast.success("Invoice opened!");
    } catch {
      toast.error("Could not download invoice. Please try again.");
    } finally {
      setDlLoading(false);
    }
  };

  /* ── Loading ──────────────────────────────────────────────── */
  if (loading) return (
    <div className="min-h-screen bg-stone-50 px-4 py-24">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-full bg-stone-200"/>
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">{[1,2,3].map(i=><div key={i} className="h-52 animate-pulse rounded-[22px] bg-white"/>)}</div>
          <div className="space-y-6">{[1,2].map(i=><div key={i} className="h-44 animate-pulse rounded-[22px] bg-white"/>)}</div>
        </div>
      </div>
    </div>
  );

  /* ── Error ────────────────────────────────────────────────── */
  if (error || !order) return (
    <div className="min-h-screen bg-stone-50 px-4 py-24">
      <div className="mx-auto max-w-2xl rounded-[22px] bg-white p-12 text-center shadow-sm">
        <XCircle size={56} className="mx-auto mb-4 text-rose-400"/>
        <h1 className="mb-2 text-xl font-bold text-[#1A1A1A]">Order Not Found</h1>
        <p className="mb-6 text-sm text-stone-500">{error || "This order doesn't exist or you don't have access."}</p>
        <Link href="/orders" className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 cursor-pointer">
          <ChevronLeft size={15}/> Back to Orders
        </Link>
      </div>
    </div>
  );

  /* ── Derived ──────────────────────────────────────────────── */
  const cfg = STATUS[order.orderStatus] || STATUS.Pending;
  const StatusIcon = cfg.icon;
  const canCancel = ["Pending","Confirmed"].includes(order.orderStatus);
  const isDelivered = order.orderStatus === "Delivered";
  const isCancelled = order.orderStatus === "Cancelled";

  const currentStep = TIMELINE_STEPS.findIndex(s => s.key === order.orderStatus);

  /* ── Correct calculation chain ──────────────────────────── */
  const subtotalAmt  = order.subtotal    || 0;
  const discountAmt  = order.discount    || 0;
  const shippingAmt  = order.shippingCost || 0;
  const grandTotal   = order.totalAmount || (subtotalAmt - discountAmt + shippingAmt);
  const gst          = Math.round(grandTotal - (grandTotal / 1.05));
  const taxableAmt   = grandTotal - gst;

  return (
    <div className="min-h-screen bg-stone-50 pb-20 pt-0">
      {/* ── Desktop Hero Header ───────────────────────────────── */}
      <div className="relative bg-white/90 backdrop-blur-sm shadow-sm">
        {/* Subtle gradient accent bar at top */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-600/30 via-emerald-600 to-emerald-600/30" />
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-10 md:py-8">
          <Link href="/orders" className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-emerald-700 transition-colors cursor-pointer">
            <ChevronLeft size={14}/> Back to Orders
          </Link>
          {/* Header content: stacked on mobile, side-by-side on desktop */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Left: order info */}
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Order Details</p>
              <h1 className="mt-1 text-xl font-black tracking-tight text-[#1A1A1A] md:text-3xl break-all">
                {order.orderNumber || `ORD-${order._id?.slice(-8).toUpperCase()}`}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                <span className="flex items-center gap-1.5">
                  <Calendar size={12}/>
                  {new Date(order.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}
                  {" · "}
                  {new Date(order.createdAt).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
                </span>
                <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                  <StatusIcon size={12}/>{order.orderStatus}
                </span>
              </div>
            </div>
          {/* Right: action buttons — horizontal scroll on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-0.5 md:flex-wrap md:overflow-visible">
              <Link href={`/orders/orders-details/${order._id}/invoice`} target="_blank"
                className="flex shrink-0 items-center gap-2 rounded-full border-2 border-emerald-600 bg-white px-4 py-2 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-600 hover:text-white cursor-pointer md:px-5 md:py-2.5">
                <FileText size={13}/> <span className="hidden sm:inline">View </span>Invoice
              </Link>
              <button
                id="download-invoice-btn"
                onClick={handleDownloadInvoice}
                disabled={dlLoading}
                className="flex shrink-0 items-center gap-2 rounded-full bg-[#1A1A1A] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed md:px-5 md:py-2.5"
              >
                {dlLoading
                  ? <><Loader2 size={13} className="animate-spin" /> <span className="hidden sm:inline">Generating…</span><span className="sm:hidden">PDF…</span></>
                  : <><Download size={13}/> <span className="hidden sm:inline">Download </span>PDF</>}
              </button>
              {canCancel && (
                <button onClick={() => setConfirmCancel(true)} disabled={cancelling}
                  className="flex shrink-0 items-center gap-2 rounded-full border-2 border-rose-400 bg-white px-4 py-2 text-xs font-semibold text-rose-600 transition-all hover:bg-rose-500 hover:text-white disabled:opacity-50 cursor-not-allowed md:px-5 md:py-2.5">
                  <XCircle size={13}/>{cancelling ? "Cancelling…" : <><span className="hidden sm:inline">Cancel Order</span><span className="sm:hidden">Cancel</span></>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* ── Content ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-3 py-5 md:px-10 md:py-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px]">

          {/* ── Left ─────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Timeline */}
            <Section title="Order Progress" icon={Truck} delay={0}>
              {isCancelled ? (
                <div className="flex items-start gap-4 rounded-xl border-2 border-rose-200 bg-rose-50 p-5">
                  <XCircle size={28} className="mt-0.5 shrink-0 text-rose-500"/>
                  <div>
                    <p className="font-bold text-rose-800">Order Cancelled</p>
                    {order.cancelReason && <p className="mt-1 text-sm text-rose-600">{order.cancelReason}</p>}
                    {order.cancelledAt && <p className="mt-1 text-xs text-rose-500">on {new Date(order.cancelledAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</p>}
                  </div>
                </div>
              ) : (
                <>
                  {/* Mobile: horizontal compact steps */}
                  <div className="flex items-start justify-between gap-1 md:hidden">
                    {TIMELINE_STEPS.map((step, i) => {
                      const done = i <= currentStep;
                      const active = i === currentStep;
                      const StepIcon = step.icon;
                      return (
                        <div key={step.key} className="flex flex-1 flex-col items-center gap-1">
                          <div className="relative flex w-full items-center">
                            <div className={`h-0.5 flex-1 ${i === 0 ? "invisible" : done ? "bg-emerald-600" : "bg-stone-200"}`}/>
                            <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                              done ? "border-emerald-600 bg-emerald-600 text-white" : "border-stone-200 bg-white text-stone-300"
                            } ${active ? "shadow-md shadow-emerald-600/20" : ""}`}>
                              <StepIcon size={13} strokeWidth={2.5}/>
                            </div>
                            <div className={`h-0.5 flex-1 ${i === TIMELINE_STEPS.length - 1 ? "invisible" : done && i < currentStep ? "bg-emerald-600" : "bg-stone-200"}`}/>
                          </div>
                          <p className={`text-center text-[9px] font-semibold leading-tight ${done ? "text-[#1A1A1A]" : "text-stone-400"}`}>
                            {step.label}
                          </p>
                          {active && <span className="text-[8px] font-bold text-emerald-700">● Now</span>}
                        </div>
                      );
                    })}
                  </div>
                  {/* Desktop: large horizontal stepper with labels below */}
                  <div className="hidden md:flex items-start justify-between gap-2">
                    {TIMELINE_STEPS.map((step, i) => {
                      const done = i <= currentStep;
                      const active = i === currentStep;
                      const StepIcon = step.icon;
                      return (
                        <div key={step.key} className="flex flex-1 flex-col items-center gap-2">
                          <div className="relative flex w-full items-center">
                            <div className={`h-0.5 flex-1 transition-colors duration-500 ${i === 0 ? "invisible" : done ? "bg-emerald-600" : "bg-stone-200"}`}/>
                            <div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                              done ? "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "border-stone-200 bg-white text-stone-300"
                            } ${active ? "scale-110 shadow-xl shadow-emerald-600/20" : ""}`}>
                              <StepIcon size={18} strokeWidth={2}/>
                            </div>
                            <div className={`h-0.5 flex-1 transition-colors duration-500 ${i === TIMELINE_STEPS.length - 1 ? "invisible" : done && i < currentStep ? "bg-emerald-600" : "bg-stone-200"}`}/>
                          </div>
                          <div className="text-center">
                            <p className={`text-xs font-bold ${done ? "text-[#1A1A1A]" : "text-stone-400"}`}>
                              {step.label}
                            </p>
                            {active && <span className="mt-0.5 block text-[10px] font-bold text-emerald-700">● Current</span>}
                            {done && !active && <span className="mt-0.5 block text-[10px] text-stone-400">Done</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </Section>

            {/* Products table */}
            <Section title={`Products (${order.items?.length || order.totalItems || 0})`} icon={Package} delay={0.1}>
              <div className="overflow-hidden rounded-xl border border-stone-100">
                {/* Table head */}
                <div className="hidden grid-cols-[1fr_60px_80px_80px] gap-4 border-b border-stone-100 bg-stone-50 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-stone-400 sm:grid">
                  <span>Product</span><span className="text-center">Qty</span><span className="text-right">Price</span><span className="text-right">Subtotal</span>
                </div>
                {order.items.map((item, i) => {
                  // productImage field is empty — real image is in product.productDetail.images[] or variants
                  const rawImg =
                    getProductImagePath(item.product) ||
                    item.product?.productDetail?.images?.[0] ||
                    item.product?.images?.[0] ||
                    item.productImage ||
                    item.image ||
                    item.thumbnail ||
                    null;
                  const img = resolveMediaSrc(rawImg);
                  return (
                    <div key={item._id}
                      className={`flex items-center gap-3 px-3 py-3 sm:px-4 sm:py-3.5 ${i < order.items.length - 1 ? "border-b border-stone-100" : ""}`}>
                      <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-stone-50">
                        {img ? <Image src={img} alt={item.productName} fill sizes="80px" className="object-cover"/> : <Package size={14} className="absolute inset-0 m-auto text-stone-300"/>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold text-[#1A1A1A]">{item.productName}</p>
                        <p className="mt-0.5 text-xs text-stone-400">{formatCurrency(item.price)} each</p>
                        {/* Qty badge visible on mobile below name */}
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-bold text-stone-600 sm:hidden">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <div className="hidden sm:block w-[60px] text-center">
                        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-700">{item.quantity}</span>
                      </div>
                      <div className="hidden sm:block w-[80px] text-right text-xs font-medium text-stone-600">{formatCurrency(item.price)}</div>
                      <div className="shrink-0 text-right text-sm font-bold text-[#1A1A1A]">{formatCurrency(item.subtotal)}</div>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* Quick actions for delivered */}
            {isDelivered && (
              <Section title="Post-Delivery Actions" icon={Star} delay={0.2}>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <Link href={`/shop`} className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50 py-4 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
                    <Star size={18}/> Write Review
                  </Link>
                  <button
                    type="button"
                    onClick={() => setReturnModal("return")}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-rose-200 bg-rose-50 py-4 text-xs font-semibold text-rose-600 transition-all hover:bg-rose-100 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                  >
                    <ArrowLeft size={18}/> Return
                  </button>
                  <button
                    type="button"
                    onClick={() => setReturnModal("exchange")}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 bg-indigo-50 py-4 text-xs font-semibold text-indigo-600 transition-all hover:bg-indigo-100 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                  >
                    <RefreshCw size={18}/> Exchange
                  </button>
                </div>
              </Section>
            )}
          </div>

          {/* ── Right: sticky sidebar ────────────────────────── */}
          <div className="space-y-4 lg:sticky lg:top-[72px] lg:self-start lg:max-h-[calc(100vh-88px)] lg:overflow-y-auto lg:pb-4 [&::-webkit-scrollbar]:hidden">

            {/* Price breakdown */}
            <Section title="Price Summary" icon={CreditCard} delay={0.15}>
              <div className="divide-y divide-stone-100">
                <Row label="Subtotal" value={formatCurrency(subtotalAmt)}/>
                {discountAmt > 0 && <Row label="Discount" value={`−${formatCurrency(discountAmt)}`} green/>}
                <Row label="Shipping" value={shippingAmt === 0 ? "FREE 🎉" : formatCurrency(shippingAmt)}/>
                <div className="flex items-center justify-between py-2 border-t border-dashed border-stone-300">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Taxable</span>
                  <span className="text-sm font-semibold text-[#1A1A1A]">{formatCurrency(taxableAmt)}</span>
                </div>
                <Row label="GST (5%)" value={formatCurrency(gst)}/>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-sm font-bold text-[#1A1A1A]">Total (Incl. GST)</span>
                  <span className="total-amount-text">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Payment info */}
              <div className="mt-4 space-y-2 rounded-xl border border-stone-100 bg-stone-50 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Payment Method</span>
                  <span className="flex items-center gap-1.5 font-semibold text-[#1A1A1A]"><CreditCard size={11}/>{order.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Payment Status</span>
                  <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    order.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current"/>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </Section>

            {/* Shipping address */}
            <Section title="Shipping Address" icon={MapPin} delay={0.2}>
              <div className="space-y-1 text-sm">
                <p className="font-bold text-[#1A1A1A]">{order.shippingAddress?.fullName}</p>
                {order.shippingAddress?.phone && (
                  <p className="flex items-center gap-2 text-stone-600"><Phone size={13} className="text-stone-400"/>{order.shippingAddress.phone}</p>
                )}
                <p className="text-stone-600">{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && <p className="text-stone-600">{order.shippingAddress.addressLine2}</p>}
                <p className="text-stone-600">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} – {order.shippingAddress?.pincode}
                </p>
                <p className="text-stone-500">{order.shippingAddress?.country || "India"}</p>
              </div>
            </Section>

            {/* Customer Support */}
            <Section title="Need Help?" icon={AlertCircle} delay={0.25}>
              <p className="mb-4 text-xs text-stone-500">Our support team is available Mon–Sat, 10am–7pm IST</p>
              <div className="space-y-2">
                <a href="tel:+919999999999" className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50 px-4 py-3 text-sm font-semibold text-[#1A1A1A] transition-all hover:border-emerald-500/40 hover:bg-emerald-50/20 cursor-pointer">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100"><Phone size={15} className="text-green-700"/></div>
                  Call Support
                </a>
                <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50 px-4 py-3 text-sm font-semibold text-[#1A1A1A] transition-all hover:border-green-300 hover:bg-green-50 cursor-pointer">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100"><MessageCircle size={15} className="text-green-700"/></div>
                  WhatsApp Support
                </a>
                <a href="mailto:support@srecommerce.com" className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50 px-4 py-3 text-sm font-semibold text-[#1A1A1A] transition-all hover:border-blue-200 hover:bg-blue-50 cursor-pointer">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100"><Mail size={15} className="text-blue-700"/></div>
                  Email Support
                </a>
              </div>
            </Section>

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs text-stone-500 shadow-sm ring-1 ring-stone-900/5">
              <Shield size={14} className="text-emerald-600"/>
              <span>100% Secure &amp; Encrypted Orders</span>
            </div>
          </div>
        </div>
      </div>
      {/* Cancel Order Confirm Modal */}
      <ConfirmModal
        isOpen={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={() => { handleCancel(); setConfirmCancel(false); }}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Yes, Cancel Order"
        cancelText="Keep Order"
        variant="danger"
      />
      {/* Return / Exchange Modal */}
      <ReturnExchangeModal
        open={!!returnModal}
        onClose={() => setReturnModal(null)}
        order={order}
        type={returnModal}
      />
    </div>
  );
}
