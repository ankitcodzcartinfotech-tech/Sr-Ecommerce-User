"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Printer, ArrowLeft, CheckCircle,
  Package, MapPin, CreditCard, Calendar, Shield,
  Loader2, FileText, XCircle,
} from "lucide-react";
import { getOrder, downloadInvoicePdf } from "@/Api/AllApi";
import { formatCurrency } from "@/lib/storefront";
import { toast } from "@/utils/toast";

/* ─── helpers ────────────────────────────────────────── */
function fmt(v) {
  return `Rs. ${Number(v || 0).toLocaleString("en-IN")}`;
}

function Row({ label, value, accent, highlight }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-stone-100 last:border-0">
      <span className="text-sm text-stone-500">{label}</span>
      <span className={`text-sm font-semibold ${accent ? "text-emerald-600" : highlight ? "text-lg text-emerald-700 font-bold" : "text-[#1A1A1A]"}`}>
        {value}
      </span>
    </div>
  );
}

export default function InvoicePage() {
  const params  = useParams();
  const router  = useRouter();
  const [order,    setOrder]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [dlLoading, setDlLoading] = useState(false);

  /* ── auth + fetch ────────────────────────────────────── */
  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("userToken")) {
      router.push("/login");
      return;
    }
    if (params.id) {
      getOrder(params.id)
        .then((r) => setOrder(r?.order || r?.data || null))
        .catch((e) => setError(e.message || "Order not found"))
        .finally(() => setLoading(false));
    }
  }, [params.id, router]);

  /* ── PDF download ────────────────────────────────────── */
  const handleDownload = useCallback(async () => {
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
  }, [dlLoading, params.id, order]);

  const subtotalAmt  = order ? (order.subtotal    || 0) : 0;
  const discountAmt  = order ? (order.discount    || 0) : 0;
  const shippingAmt  = order ? (order.shippingCost || 0) : 0;
  const grandTotal   = order ? (order.totalAmount || (subtotalAmt - discountAmt + shippingAmt)) : 0;
  const gst          = Math.round(grandTotal - (grandTotal / 1.05));
  const taxableAmt   = grandTotal - gst;

  const invoiceNumber = order
    ? (order.orderNumber ? `INV-${order.orderNumber}` : `INV-${order._id?.slice(-8).toUpperCase()}`)
    : "";

  const orderDate = order
    ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "";

  /* ── Loading ─────────────────────────────────────────── */
  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 text-center">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-600/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-emerald-600 animate-spin" />
          <FileText size={28} className="absolute inset-0 m-auto text-emerald-600" />
        </div>
        <p className="text-base font-semibold text-[#1A1A1A]">Preparing Invoice…</p>
        <p className="text-sm text-stone-400">Fetching your order details</p>
      </motion.div>
    </div>
  );

  /* ── Error ───────────────────────────────────────────── */
  if (error || !order) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-[24px] bg-white p-12 text-center shadow-sm max-w-md w-full">
        <XCircle size={56} className="mx-auto mb-4 text-rose-400" />
        <h1 className="text-xl font-bold text-[#1A1A1A] mb-2">Invoice Unavailable</h1>
        <p className="text-stone-500 text-sm mb-6">{error || "This order could not be found."}</p>
        <Link href="/orders" className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 cursor-pointer">
          <ArrowLeft size={14} /> Back to Orders
        </Link>
      </motion.div>
    </div>
  );

  /* ── Main Invoice Preview ────────────────────────────── */
  return (
    <div className="min-h-screen bg-stone-50 pt-8 pb-20 print:bg-white print:pt-0">
      {/* ── Action Bar (hidden on print) ──────────────────── */}
      <div className="print:hidden mx-auto mb-8 max-w-4xl px-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-white p-4 shadow-sm ring-1 ring-stone-900/5">
          <Link href={`/orders/orders-details/${params.id}`}
            className="flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-emerald-700 transition-colors cursor-pointer">
            <ArrowLeft size={16} /> Back to Order
          </Link>
          <div className="flex items-center gap-3">
            <button
              id="print-invoice-btn"
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-full border-2 border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 transition-all hover:border-stone-400 hover:bg-stone-50 cursor-pointer"
            >
              <Printer size={15} /> Print
            </button>
            <button
              id="download-invoice-btn"
              onClick={handleDownload}
              disabled={dlLoading}
              className="flex items-center gap-2 rounded-full bg-[#1A1A1A] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {dlLoading
                ? <><Loader2 size={15} className="animate-spin" /> Generating…</>
                : <><Download size={15} /> Download PDF</>}
            </button>
          </div>
        </motion.div>
      </div>
      {/* ── Invoice Document ──────────────────────────────── */}
      <motion.div
        id="printable-invoice"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="mx-auto max-w-4xl bg-white shadow-xl ring-1 ring-stone-200 print:shadow-none print:ring-0"
        style={{ minHeight: "297mm" }}
      >
        {/* Print CSS */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * { visibility: hidden; }
            #printable-invoice, #printable-invoice * { visibility: visible; }
            #printable-invoice {
              position: absolute; left: 0; top: 0;
              width: 100%; margin: 0; padding: 0;
              box-shadow: none !important;
            }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        `}} />

        {/* ── Header Band ──────────────────────────────────── */}
        <div className="bg-[#1A1A1A] px-5 py-6 sm:px-10 sm:py-8 flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="w-full sm:w-auto text-left">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-emerald-500 tracking-wide">SR ECOMMERCE</h1>
            <p className="mt-1 text-[10px] sm:text-xs text-white/60 font-medium tracking-widest uppercase">Premium Curated Storefront</p>
            <p className="mt-1.5 text-[9px] sm:text-[10px] text-white/40">www.srecommerce.com · support@srecommerce.com</p>
          </div>
          <div className="w-full sm:w-auto text-left sm:text-right border-t border-white/10 sm:border-0 pt-4 sm:pt-0">
            <p className="text-2xl sm:text-4xl font-bold uppercase tracking-widest text-white/20 sm:text-white/10">INVOICE</p>
            <p className="mt-1 text-xs sm:text-sm font-bold text-emerald-500">{invoiceNumber}</p>
            <div className="mt-2 flex items-center justify-start sm:justify-end gap-2 text-[10px] sm:text-xs text-white/50">
              <Calendar size={11} />
              <span>{orderDate}</span>
            </div>
          </div>
        </div>

        {/* ── Gold accent bar ───────────────────────────────── */}
        <div className="h-1 bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600" />

        {/* ── Info Grid ────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 px-5 py-6 sm:px-10 sm:py-8 sm:grid-cols-3">
          {/* Bill To */}
          <div className="rounded-2xl bg-stone-50 p-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
              Billed To
            </p>
            <p className="text-sm font-bold text-[#1A1A1A]">{order.shippingAddress?.fullName}</p>
            {order.shippingAddress?.phone && (
              <p className="mt-1 text-xs text-stone-500 flex items-center gap-1.5">
                <span>{order.shippingAddress.phone}</span>
              </p>
            )}
            <p className="mt-2 text-xs leading-relaxed text-stone-500">
              {order.shippingAddress?.addressLine1}
              {order.shippingAddress?.addressLine2 && <>, {order.shippingAddress.addressLine2}</>}<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} – {order.shippingAddress?.pincode}<br />
              {order.shippingAddress?.country || "India"}
            </p>
          </div>

          {/* Payment */}
          <div className="rounded-2xl bg-stone-50 p-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
              Payment
            </p>
            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider">Method</p>
                <p className="text-sm font-bold text-[#1A1A1A] flex items-center gap-1.5 mt-0.5">
                  <CreditCard size={13} className="text-emerald-600" /> {order.paymentMethod}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider mt-2">Status</p>
                <span className={`mt-0.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                  order.paymentStatus === "Paid"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="rounded-2xl bg-stone-50 p-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
              Order Info
            </p>
            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider">Order Number</p>
                <p className="text-sm font-bold text-[#1A1A1A] mt-0.5 font-mono">
                  {order.orderNumber || `ORD-${order._id?.slice(-8).toUpperCase()}`}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider mt-2">Status</p>
                <p className="text-sm font-semibold text-[#1A1A1A] mt-0.5">{order.orderStatus}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Items Table ───────────────────────────────────── */}
        <div className="px-5 sm:px-10 pb-6 sm:pb-8">
          <div className="overflow-hidden rounded-2xl border border-stone-100">
            {/* Table head */}
            <div className="hidden sm:grid grid-cols-[1fr_60px_100px_100px] gap-4 bg-[#1A1A1A] px-5 py-3.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">Item Description</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60 text-center">Qty</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60 text-right">Unit Price</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60 text-right">Subtotal</span>
            </div>
            {/* Rows */}
            {order.items.map((item, i) => (
              <div key={item._id || i}
                className={`flex flex-col sm:grid sm:grid-cols-[1fr_60px_100px_100px] gap-2 sm:gap-4 px-4 sm:px-5 py-4 border-b border-stone-100 last:border-0 ${i % 2 === 1 ? "bg-[#FAFAF8]" : "bg-white"}`}>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A] leading-snug">{item.productName}</p>
                  {item.variant?.size && (
                    <p className="mt-0.5 text-xs text-stone-400">Size: {item.variant.size}</p>
                  )}
                </div>
                
                {/* Mobile View: Inline Details */}
                <div className="flex sm:hidden items-center justify-between mt-2">
                   <div className="text-xs text-stone-500 flex items-center gap-2">
                     <span className="font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-full">{item.quantity}</span>
                     <span>× {fmt(item.price)}</span>
                   </div>
                   <div className="text-sm font-bold text-[#1A1A1A]">{fmt(item.subtotal)}</div>
                </div>

                {/* Desktop View: Grid Columns */}
                <div className="hidden sm:flex text-sm text-stone-700 justify-center items-center">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-700">
                    {item.quantity}
                  </span>
                </div>
                <div className="hidden sm:flex text-sm text-stone-600 justify-end items-center">{fmt(item.price)}</div>
                <div className="hidden sm:flex text-sm font-bold text-[#1A1A1A] justify-end items-center">{fmt(item.subtotal)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Totals ───────────────────────────────────────── */}
        <div className="px-5 sm:px-10 pb-6 sm:pb-8 flex justify-end">
          <div className="w-full sm:max-w-sm rounded-2xl border border-stone-100 overflow-hidden">
            {/* Breakdown rows */}
            <div className="bg-stone-50 px-5 pt-5 pb-2 space-y-0">
              <Row label="Subtotal" value={fmt(subtotalAmt)} />
              {discountAmt > 0 && (
                <Row label="Discount" value={`− ${fmt(discountAmt)}`} accent />
              )}
              <Row label="Shipping" value={shippingAmt > 0 ? fmt(shippingAmt) : "FREE 🎉"} />
              {/* Taxable divider */}
              <div className="flex items-center justify-between py-2.5 border-t-2 border-dashed border-stone-300 mt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Taxable Amount</span>
                <span className="text-sm font-bold text-[#1A1A1A]">{fmt(taxableAmt)}</span>
              </div>
              <Row label="GST @ 5%" value={fmt(gst)} />
            </div>
            {/* Grand Total band */}
            <div className="flex items-center justify-between bg-[#1A1A1A] px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/50">Grand Total</p>
                <p className="text-[10px] text-white/30 mt-0.5">Incl. GST</p>
              </div>
              <div className="text-right">
                 <p className="text-2xl font-bold text-emerald-400">{fmt(grandTotal)}</p>
                {grandTotal !== (order.totalAmount || 0) && (
                  <p className="text-[10px] text-white/40 mt-0.5">
                    Saved: {fmt(discountAmt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────── */}
        <div className="mx-5 sm:mx-10 mb-8 sm:mb-10 rounded-2xl bg-stone-50 px-5 sm:px-8 py-5 sm:py-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield size={14} className="text-emerald-600" />
            <span className="text-xs font-semibold text-[#1A1A1A]">Authentic & Certified Order</span>
          </div>
          <p className="text-xs text-stone-500">This is a computer-generated invoice and does not require a physical signature.</p>
          <p className="mt-1.5 text-xs font-semibold text-emerald-600">
            Thank you for shopping with SR Ecommerce.
          </p>
          <p className="mt-1 text-[10px] text-stone-400">
            SR Ecommerce · Raghuvir Scarlett, G-59, Saroli, Surat, Gujarat 395010
          </p>
        </div>

        {/* ── Print-only Download hint ──────────────────────── */}
        <div className="hidden print:block text-center pb-6 text-xs text-stone-400">
          SR Ecommerce · support@srecommerce.com · www.srecommerce.com
        </div>
      </motion.div>
      {/* ── Bottom action (mobile) ────────────────────────── */}
      <div className="print:hidden mx-auto mt-6 max-w-4xl px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 text-sm text-stone-400">
          <CheckCircle size={14} className="text-emerald-500" />
          <span>Invoice ready · {invoiceNumber}</span>
        </motion.div>
      </div>
    </div>
  );
}
