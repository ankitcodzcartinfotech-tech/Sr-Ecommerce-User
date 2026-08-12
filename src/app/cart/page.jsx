"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/utils/toast";
import {
  ShoppingBag,
  Minus,
  Plus, 
  Trash2,
  Heart,
  ArrowRight,
  Tag,
  Truck,
  ChevronRight,
  X,
} from "lucide-react";
import {
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  addToWishlist,
  validateCoupon,
} from "@/Api/AllApi";
import {
  formatCurrency,
  getProductHref,
  getProductImagePath,
  getProductName,
  resolveMediaSrc,
} from "@/lib/storefront";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useCartWishlist } from "@/contexts/CartWishlistContext";

/* ─── constants ───────────────────────────────────────────── */
const FREE_SHIPPING_THRESHOLD = 2500;
const SHIPPING_COST            = 100;
const GST_RATE                 = 0.05; // 5%

/* ─── helpers ─────────────────────────────────────────────── */
function getItemId(item) {
  return item._id || item.id;
}
function getProduct(item) {
  return item.product || item;
}
function getItemPrice(item) {
  return item.price || item.salePrice || 0;
}
function getItemSubtotal(item) {
  return item.subtotal ?? getItemPrice(item) * (item.quantity || 1);
}
function getVariantLabel(item) {
  const v = item.variant || item.variantId;
  if (!v) return null;
  const parts = [];
  if (v.color) parts.push(v.color);
  if (v.size)  parts.push(v.size);
  if (v.label) parts.push(v.label);
  return parts.length ? parts.join(" · ") : null;
}

/* ─── Quantity stepper ─────────────────────────────────────── */
function QtyBtn({ icon: Icon, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-(--border) bg-white text-stone-600 transition-all hover:border-(--gold) hover:text-(--gold) disabled:opacity-30 cursor-not-allowed"
    >
      <Icon size={13} />
    </button>
  );
}

/* ─── Cart item row ───────────────────────────────────────── */
function CartItem({ item, onQtyChange, onRemove, onSaveForLater, updating, removing }) {
  const product  = getProduct(item);
  const itemId   = getItemId(item);
  const name     = getProductName(product);
  const image    = resolveMediaSrc(getProductImagePath(product));
  const href     = getProductHref(product);
  const price    = getItemPrice(item);
  const subtotal = getItemSubtotal(item);
  const qty      = item.quantity || 1;
  const variant  = getVariantLabel(item);
  const busy     = updating === itemId || removing === itemId;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: busy ? 0.6 : 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="flex gap-3 border-b border-(--border) py-5 last:border-b-0 sm:gap-4 md:gap-6"
    >
      {/* Image */}
      <Link href={href} className="relative h-24 w-22 shrink-0 overflow-hidden rounded-[18px] bg-stone-100 sm:h-28 md:h-32 md:w-26 cursor-pointer">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="104px"
            className="object-cover object-top"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-stone-300">
            No Image
          </div>
        )}
      </Link>
      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link href={href} className="min-w-0 cursor-pointer">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-(--text) hover:text-(--gold)">
              {name}
            </h3>
          </Link>
          <button
            type="button"
            onClick={() => onRemove(itemId)}
            disabled={busy}
            className="shrink-0 rounded-full p-1.5 text-stone-400 transition-all hover:bg-rose-50 hover:text-rose-500 disabled:opacity-40 cursor-not-allowed"
            aria-label="Remove item"
          >
            <X size={15} />
          </button>
        </div>

        {variant && (
          <p className="mt-1 text-xs text-(--muted)">{variant}</p>
        )}

        <p className="mt-1 text-sm font-semibold text-(--gold)">{formatCurrency(price)}</p>

        {/* Bottom row: qty + subtotal + actions */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          {/* Quantity stepper */}
          <div className="flex items-center gap-2">
            <QtyBtn
              icon={Minus}
              onClick={() => onQtyChange(itemId, qty - 1)}
              disabled={busy || qty <= 1}
              className="cursor-not-allowed" />
            <span className="w-6 text-center text-sm font-bold text-(--text)">
              {updating === itemId ? "…" : qty}
            </span>
            <QtyBtn
              icon={Plus}
              onClick={() => onQtyChange(itemId, qty + 1)}
              disabled={busy || qty >= 10}
              className="cursor-not-allowed" />
          </div>

          {/* Subtotal */}
          <span className="w-full text-sm font-bold text-(--text) sm:w-auto">{formatCurrency(subtotal)}</span>
        </div>

        {/* Save for later */}
        <button
          type="button"
          onClick={() => onSaveForLater(item)}
          disabled={busy}
          className="mt-2 flex w-fit items-center gap-1 text-xs font-medium text-stone-400 transition-colors hover:text-(--gold) disabled:opacity-40 cursor-not-allowed"
        >
          <Heart size={12} /> Save for later
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Free shipping progress bar ─────────────────────────── */
function ShippingProgress({ subtotal }) {
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const free = subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <div className="rounded-[18px] bg-(--gold-soft) px-4 py-3.5">
      <div className="mb-2 flex items-center gap-2">
        <Truck size={15} className="shrink-0 text-(--gold)" />
        <p className="text-xs font-semibold text-(--text)">
          {free
            ? "🎉 You've unlocked FREE shipping!"
            : `Add ${formatCurrency(remaining)} more for FREE shipping`}
        </p>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/70">
        <motion.div
          className="h-full rounded-full bg-(--gold)"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* ─── Order summary sidebar ───────────────────────────────── */
function OrderSummary({ items, coupon, onCheckout }) {
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + getItemSubtotal(i), 0),
    [items]
  );
  const discount  = coupon?.discount || 0;
  const shipping  = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const taxBase   = subtotal - discount + shipping;
  const gst       = Math.round(taxBase * GST_RATE);
  const total     = subtotal - discount + shipping + gst;

  const rows = [
    { label: "Subtotal",  value: formatCurrency(subtotal),  highlight: false },
    ...(discount > 0
      ? [{ label: `Discount${coupon?.code ? ` (${coupon.code})` : ""}`, value: `−${formatCurrency(discount)}`, highlight: true }]
      : []),
    { label: "Shipping",  value: shipping === 0 ? "FREE" : formatCurrency(shipping), highlight: false },
    { label: "GST (5%)",  value: formatCurrency(gst),       highlight: false },
  ];

  return (
    <div className="rounded-[24px] border border-(--border) bg-(--surface) p-6">
      <h2 className="mb-5 font-serif text-xl font-semibold text-(--text)">Order Summary</h2>
      <div className="space-y-3 border-b border-(--border) pb-4">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between text-sm">
            <span className="text-(--muted)">{r.label}</span>
            <span className={r.highlight ? "font-semibold text-emerald-600" : "font-medium text-(--text)"}>
              {r.value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-semibold text-(--text)">Total</span>
        <span className="font-serif text-2xl font-bold text-(--text)">{formatCurrency(total)}</span>
      </div>
      <button
        type="button"
        onClick={onCheckout}
        disabled={items.length === 0}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-(--gold) py-4 text-xs font-bold uppercase tracking-[0.22em] text-white transition-all hover:bg-(--text) disabled:opacity-40 cursor-not-allowed"
      >
        Proceed to Checkout <ArrowRight size={14} />
      </button>
      <Link
        href="/shop"
        className="mt-3 flex w-full items-center justify-center gap-1 py-2 text-xs font-medium text-(--muted) transition-colors hover:text-(--gold) cursor-pointer"
      >
        Continue Shopping <ChevronRight size={13} />
      </Link>
    </div>
  );
}

/* ─── Coupon section ──────────────────────────────────────── */
function CouponSection({ onApply, coupon, applying }) {
  const [code, setCode] = useState("");

  function handleApply() {
    if (code.trim()) onApply(code.trim().toUpperCase());
  }

  return (
    <div className="rounded-[24px] border border-(--border) bg-(--surface) p-5">
      <div className="mb-3 flex items-center gap-2">
        <Tag size={15} className="text-(--gold)" />
        <span className="text-sm font-semibold text-(--text)">Promo Code</span>
      </div>
      {coupon ? (
        <div className="flex items-center justify-between gap-3 rounded-[22px] bg-emerald-50 px-4 py-3 sm:rounded-full sm:py-2.5">
          <span className="min-w-0 text-sm font-semibold text-emerald-700">
            {coupon.code} — {formatCurrency(coupon.discount)} off
          </span>
          <button
            type="button"
            onClick={() => onApply(null)}
            className="text-emerald-500 hover:text-emerald-700 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="Enter coupon code"
            className="flex-1 rounded-full border border-(--border) bg-white px-4 py-2.5 text-sm text-(--text) placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-(--gold)/30"
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={!code.trim() || applying}
            className="rounded-full bg-(--gold) px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-(--text) disabled:opacity-50 sm:min-w-28 cursor-not-allowed"
          >
            {applying ? "…" : "Apply"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Empty cart ──────────────────────────────────────────── */
function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-28 text-center"
    >
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-(--gold-soft)">
        <ShoppingBag size={40} className="text-(--gold)" />
      </div>
      <h2 className="mb-2 font-serif text-2xl font-semibold text-(--text)">Your cart is empty</h2>
      <p className="mb-8 max-w-xs text-sm leading-relaxed text-(--muted)">
        Looks like you haven&apos;t added anything yet. Start exploring our collection.
      </p>
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 rounded-full bg-(--gold) px-7 py-3.5 text-xs font-bold uppercase tracking-[0.22em] text-white transition-all hover:bg-(--text) cursor-pointer"
      >
        Start Shopping <ArrowRight size={14} />
      </Link>
    </motion.div>
  );
}

/* ─── Skeleton ────────────────────────────────────────────── */
function CartSkeleton() {
  return (
    <div className="space-y-5">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-4 border-b border-(--border) pb-5">
          <div className="h-28 w-22 shrink-0 animate-pulse rounded-[18px] bg-stone-100" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 w-3/4 animate-pulse rounded-full bg-stone-100" />
            <div className="h-3 w-1/3 animate-pulse rounded-full bg-stone-100" />
            <div className="mt-4 h-8 w-24 animate-pulse rounded-full bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function CartPage() {
  const router = useRouter();
  const { refreshCounts } = useCartWishlist();
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [updating, setUpdating] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [coupon,   setCoupon]   = useState(null);
  const [applying, setApplying] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const sidebarRef = useRef(null);

  /* fetch cart */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getCart()
      .then((data) => {
        const list = data?.items || data?.cart?.items || data || [];
        setItems(Array.isArray(list) ? list : []);
      })
      .catch(() => setError("Could not load cart. Please log in and try again."))
      .finally(() => setLoading(false));
  }, []);

  const totalItems = items.reduce((s, i) => s + (i.quantity || 1), 0);

  /* update quantity */
  const handleQtyChange = useCallback(async (itemId, newQty) => {
    if (newQty < 1 || newQty > 10) return;
    setUpdating(itemId);
    const prev = items;
    setItems((cur) =>
      cur.map((i) =>
        getItemId(i) === itemId
          ? { ...i, quantity: newQty, subtotal: getItemPrice(i) * newQty }
          : i
      )
    );
    try {
      await updateCartItem(itemId, { quantity: newQty });
    } catch {
      setItems(prev);
      toast.error("Could not update quantity");
    } finally {
      setUpdating(null);
    }
  }, [items]);

  /* remove item */
  async function handleRemove(itemId) {
    try {
      await removeFromCart(itemId);
      setItems((cur) => cur.filter((i) => getItemId(i) !== itemId));
      refreshCounts();
      toast.info("Item removed");
    } catch {
      toast.error("Could not remove item");
    }
  }

  /* save for later → wishlist */
  async function handleSaveForLater(item) {
    const product = getProduct(item);
    try {
      await addToWishlist({ productId: product._id || product.id });
      await removeFromCart(getItemId(item));
      setItems((cur) => cur.filter((i) => getItemId(i) !== getItemId(item)));
      refreshCounts();
      toast.success("Saved to wishlist ❤️");
    } catch {
      toast.error("Could not save for later");
    }
  }

  /* coupon */
  async function handleCoupon(code) {
    if (!code) { setCoupon(null); return; }
    setApplying(true);
    try {
      const subtotal = items.reduce((s, i) => s + getItemSubtotal(i), 0);
      const data = await validateCoupon({ code, orderAmount: subtotal });
      if (data?.coupon) {
        setCoupon({ code: data.coupon.code, discount: data.coupon.discountAmount });
        toast.success(`Coupon applied! ${data.coupon.type === "percentage" ? `${data.coupon.value}%` : formatCurrency(data.coupon.value)} off`);
      }
    } catch (err) {
      toast.error(err?.message || "Invalid coupon code");
    } finally {
      setApplying(false);
    }
  }

  /* checkout */
  function handleCheckout() {
    if (typeof window !== "undefined" && !localStorage.getItem("userToken")) {
      toast.warning("Please login to checkout");
      setTimeout(() => router.push("/login"), 1000);
      return;
    }
    if (items.length === 0) {
      toast.warning("Your cart is empty");
      return;
    }
    router.push("/checkout");
  }

  return (
    <div className="min-h-screen pb-24">
      {/* ── Header ── */}
      <div className="border-b border-(--border) bg-(--surface) px-6 py-10 md:px-10 lg:px-14">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-(--gold)">
                Your Bag
              </p>
              <h1 className="font-serif text-3xl font-semibold text-(--text) sm:text-4xl md:text-5xl">
                Shopping Cart
                {!loading && totalItems > 0 && (
                  <span className="mt-2 block text-lg text-(--muted) sm:ml-3 sm:mt-0 sm:inline sm:text-2xl">({totalItems} {totalItems === 1 ? "item" : "items"})</span>
                )}
              </h1>
            </div>
            <Link
              href="/shop"
              className="self-start text-xs font-semibold uppercase tracking-[0.2em] text-(--muted) transition-colors hover:text-(--gold) md:self-auto cursor-pointer"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
      {/* ── Body ── */}
      <div className="mx-auto max-w-[1440px] px-6 pt-10 md:px-10 lg:px-14">

        {loading && (
          <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[minmax(0,1fr)_360px]">
            <CartSkeleton />
            <div className="h-80 animate-pulse rounded-3xl bg-stone-100" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border border-rose-100 bg-rose-50 px-6 py-12 text-center">
            <p className="text-sm font-medium text-rose-700">{error}</p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-rose-700 cursor-pointer"
            >
              Log In
            </Link>
          </div>
        )}

        {!loading && !error && items.length === 0 && <EmptyCart />}

        {!loading && !error && items.length > 0 && (
          <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[minmax(0,1fr)_360px]">

            {/* ── Left: items ── */}
            <div>
              {/* Shipping progress */}
              <ShippingProgress
                subtotal={items.reduce((s, i) => s + getItemSubtotal(i), 0)}
              />

              {/* Item list */}
              <div className="mt-6 rounded-3xl border border-(--border) bg-(--surface) px-4 md:px-6">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <CartItem
                      key={getItemId(item)}
                      item={item}
                      onQtyChange={handleQtyChange}
                      onRemove={handleRemove}
                      onSaveForLater={handleSaveForLater}
                      updating={updating}
                      removing={removing}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Clear cart */}
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="mt-4 flex items-center gap-1.5 text-xs font-medium text-stone-400 transition-colors hover:text-rose-500 cursor-pointer"
              >
                <Trash2 size={13} /> Clear cart
              </button>

              <ConfirmModal
                isOpen={confirmClear}
                onClose={() => setConfirmClear(false)}
                onConfirm={async () => {
                  try {
                    await clearCart();
                    setItems([]);
                    toast.success("Cart cleared");
                  } catch {
                    toast.error("Could not clear cart");
                  }
                  setConfirmClear(false);
                }}
                title="Clear Cart"
                description="Remove all items from your cart? This cannot be undone."
                confirmText="Clear Cart"
                cancelText="Keep Items"
                variant="danger"
              />
            </div>

            {/* ── Right: sidebar ── */}
            <div ref={sidebarRef} className="space-y-4 lg:sticky lg:top-28 lg:self-start">
              <CouponSection
                onApply={handleCoupon}
                coupon={coupon}
                applying={applying}
              />
              <OrderSummary
                items={items}
                coupon={coupon}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        )}

        {/* Mobile sticky checkout */}
        {!loading && !error && items.length > 0 && (
          <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-(--border) bg-white/95 px-4 py-4 backdrop-blur-sm sm:px-6 lg:hidden">
            <button
              type="button"
              onClick={handleCheckout}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-(--gold) py-4 text-xs font-bold uppercase tracking-[0.22em] text-white transition-all hover:bg-(--text) cursor-pointer"
            >
              Proceed to Checkout <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
