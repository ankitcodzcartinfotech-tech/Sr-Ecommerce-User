"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package, CheckCircle, Truck, Home, ChevronLeft,
  XCircle, Clock, MapPin, Calendar, Hash,
} from "lucide-react";
import { trackOrder } from "@/Api/AllApi";

const STEPS = [
  { key: "Pending",    label: "Order Placed",        icon: Package      },
  { key: "Confirmed",  label: "Order Confirmed",      icon: CheckCircle  },
  { key: "Processing", label: "Packed & Ready",       icon: Package      },
  { key: "Shipped",    label: "Shipped",              icon: Truck        },
  { key: "Delivered",  label: "Delivered",            icon: Home         },
];

export default function TrackOrderPage() {
  const params = useParams();
  const router = useRouter();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("userToken")) {
      router.push(`/login?redirect=/orders/orders-details/${params.id}/track`);
      return;
    }
    if (!params.id) return;
    trackOrder(params.id)
      .then(d => setTracking(d?.tracking || null))
      .catch(e => setError(e.message || "Could not load tracking"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  if (loading) return (
    <div className="min-h-screen bg-stone-50 px-4 py-24">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-full bg-stone-200"/>
        <div className="h-96 animate-pulse rounded-3xl bg-white"/>
      </div>
    </div>
  );

  if (error || !tracking) return (
    <div className="min-h-screen bg-stone-50 px-4 py-24">
      <div className="mx-auto max-w-lg rounded-3xl bg-white p-12 text-center shadow-sm">
        <XCircle size={48} className="mx-auto mb-4 text-rose-400"/>
        <p className="text-lg font-bold text-[#1A1A1A]">Tracking Unavailable</p>
        <p className="mt-2 text-sm text-stone-500">{error || "Could not load tracking info."}</p>
        <Link href={`/orders/orders-details/${params.id}`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-600 cursor-pointer">
          <ChevronLeft size={14}/> Back to Order
        </Link>
      </div>
    </div>
  );

  const isCancelled = tracking.currentStatus === "Cancelled";
  const currentIdx  = STEPS.findIndex(s => s.key === tracking.currentStatus);

  // Estimated delivery = 5 days from order date
  const estDelivery = (() => {
    const d = new Date(tracking.createdAt);
    d.setDate(d.getDate() + 5);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  })();

  return (
    <div className="min-h-screen bg-stone-50 pb-24 pt-20">
      {/* Header */}
      <div className="bg-white/70 px-6 py-8 backdrop-blur-sm md:px-10">
        <div className="mx-auto max-w-2xl">
          <Link href={`/orders/orders-details/${params.id}`} className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-emerald-700 cursor-pointer">
            <ChevronLeft size={14}/> Back to Order
          </Link>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Order Tracking</p>
          <h1 className="mt-1 order-id-text">
                {tracking.orderNumber}
              </h1>
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-6 py-8 md:px-10">

        {/* Info cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { icon: Hash,     label: "Order ID",           value: tracking.orderNumber },
            { icon: Calendar, label: "Order Date",         value: new Date(tracking.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) },
            { icon: Truck,    label: "Est. Delivery",      value: estDelivery },
          ].map(item => (
            <div key={item.label} className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm">
              <item.icon size={16} className="mb-2 text-emerald-600"/>
              <p className="text-[10px] uppercase tracking-wider text-stone-400">{item.label}</p>
              <p className="mt-0.5 text-xs font-bold text-[#1A1A1A] leading-tight">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-900/5 md:p-8">
          <h2 className="mb-6 text-base font-bold text-[#1A1A1A]">Shipment Progress</h2>

          {isCancelled ? (
            <div className="flex items-start gap-4 rounded-xl border-2 border-rose-200 bg-rose-50 p-5">
              <XCircle size={28} className="mt-0.5 shrink-0 text-rose-500"/>
              <div>
                <p className="font-bold text-rose-800">Order Cancelled</p>
                {tracking.cancelReason && <p className="mt-1 text-sm text-rose-600">{tracking.cancelReason}</p>}
                {tracking.cancelledAt && <p className="mt-1 text-xs text-rose-500">on {new Date(tracking.cancelledAt).toLocaleDateString("en-IN")}</p>}
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {STEPS.map((step, i) => {
                const done   = i <= currentIdx;
                const active = i === currentIdx;
                const Icon   = step.icon;
                return (
                  <div key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
                    {/* Connector line */}
                    {i < STEPS.length - 1 && (
                      <div className={`absolute left-4.75 top-10 h-full w-0.5 transition-all duration-700 ${done ? "bg-emerald-600" : "bg-stone-100"}`}/>
                    )}
                    {/* Circle */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        done ? "border-emerald-600 bg-emerald-600 text-white" : "border-stone-200 bg-white text-stone-300"
                      } ${active ? "shadow-lg shadow-emerald-600/20" : ""}`}
                    >
                      {done && !active ? <CheckCircle size={18} strokeWidth={2.5}/> : <Icon size={16} strokeWidth={2}/>}
                    </motion.div>

                    {/* Label */}
                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 + 0.05 }}
                      className="pt-1.5"
                    >
                      <p className={`text-sm font-semibold ${done ? "text-[#1A1A1A]" : "text-stone-400"}`}>
                        {step.label}
                      </p>
                      {active && (
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600"/>
                          Current Status
                        </p>
                      )}
                      {done && !active && (
                        <p className="mt-0.5 text-[11px] text-stone-400">Completed</p>
                      )}
                    </motion.div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Shipping address */}
        {tracking.shippingAddress && (
          <div className="mt-5 rounded-[20px] border border-stone-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <MapPin size={15} className="text-emerald-600"/>
              <p className="text-sm font-bold text-[#1A1A1A]">Shipping To</p>
            </div>
            <p className="text-sm font-semibold text-[#1A1A1A]">{tracking.shippingAddress.fullName}</p>
            <p className="mt-0.5 text-sm text-stone-500">{tracking.shippingAddress.addressLine1}</p>
            <p className="text-sm text-stone-500">
              {tracking.shippingAddress.city}, {tracking.shippingAddress.state} – {tracking.shippingAddress.pincode}
            </p>
          </div>
        )}

        <div className="mt-5 text-center">
          <Link href={`/orders/orders-details/${params.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-8 py-3 text-sm font-bold text-white hover:bg-emerald-600 cursor-pointer">
            View Full Order Details
          </Link>
        </div>
      </div>
    </div>
  );
}
