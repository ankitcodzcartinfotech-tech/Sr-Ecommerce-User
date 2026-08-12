"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ArrowRight, Truck, Minus, Plus } from "lucide-react";
import { useCartWishlist } from "@/contexts/CartWishlistContext";
import { removeFromCart, updateCartItem } from "@/Api/AllApi";
import {
  formatCurrency,
  getProductHref,
  getProductImagePath,
  getProductName,
  resolveMediaSrc,
} from "@/lib/storefront";

const FREE_SHIPPING_THRESHOLD = 2500;

function CartItemRow({ item, onRemove, onQtyChange, updating }) {
  const product = item.product || item;
  const name = getProductName(product);
  const image = resolveMediaSrc(getProductImagePath(product));
  const href = getProductHref(product);
  const price = item.price || item.variant?.salePrice || item.variant?.mrp || product?.variants?.[0]?.salePrice || 0;
  const qty = item.quantity || 1;
  const subtotal = item.subtotal ?? price * qty;
  // Cart subdocument _id is always on `item._id` (the cart item row ID, not the product ID)
  const cartItemId = item._id?.toString() || item.id?.toString();
  const busy = updating === cartItemId;

  return (
    <div className="flex gap-4 border-b border-stone-200/60 py-5">
      <Link href={href} className="relative h-24 w-20 shrink-0 overflow-hidden bg-stone-100 cursor-pointer">
        {image ? (
          <Image src={image} alt={name} fill sizes="80px" className="object-cover object-top" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-stone-300">
            No Image
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <Link href={href} className="line-clamp-2 text-sm font-medium leading-snug text-stone-900 hover:text-(--gold) cursor-pointer">
            {name}
          </Link>
          <button
            onClick={() => onRemove(cartItemId)}
            className="text-stone-400 hover:text-rose-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={busy}
            aria-label="Remove item"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex items-end justify-between mt-2">
          {/* Quantity stepper */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onQtyChange(cartItemId, qty - 1)}
              disabled={busy || qty <= 1}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-600 transition-colors hover:border-(--gold) hover:text-(--gold) disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Minus size={12} />
            </button>
            <span className="w-4 text-center text-xs font-semibold text-stone-900">
              {busy ? "…" : qty}
            </span>
            <button
              onClick={() => onQtyChange(cartItemId, qty + 1)}
              disabled={busy || qty >= 10}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-600 transition-colors hover:border-(--gold) hover:text-(--gold) disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Plus size={12} />
            </button>
          </div>
          <div className="text-sm font-semibold text-stone-900">{formatCurrency(subtotal)}</div>
        </div>
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, cartSubtotal, cartCount, refreshCounts } = useCartWishlist();
  const router = useRouter();
  const [updating, setUpdating] = useState(null);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      // Refresh cart data when drawer opens to ensure IDs are current
      refreshCounts();
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isCartOpen]); // eslint-disable-line

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
      // Refresh to get updated cart from server
      refreshCounts();
    } catch (error) {
      // If item was already removed or not found, just refresh
      // to sync the UI with actual server state
      refreshCounts();
      if (!error.message?.includes("not found")) {
        console.error("Failed to remove item", error);
      }
    }
  };

  const handleQtyChange = async (itemId, newQty) => {
    if (newQty < 1 || newQty > 10) return;
    setUpdating(itemId);
    try {
      await updateCartItem(itemId, { quantity: newQty });
      refreshCounts();
    } catch (error) {
      console.error("Failed to update quantity", error);
    } finally {
      setUpdating(null);
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push("/checkout");
  };

  const remaining = FREE_SHIPPING_THRESHOLD - cartSubtotal;
  const pct = Math.min(100, Math.max(0, (cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const isFreeShipping = cartSubtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-100 bg-black/40 backdrop-blur-sm cursor-pointer"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 z-110 flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200/60 px-6 py-5">
              <h2 className="font-serif text-2xl font-medium text-stone-900">
                Your Bag ({cartCount})
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-full bg-stone-100 p-2 text-stone-600 transition-colors hover:bg-stone-200 hover:text-stone-900 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Free Shipping Progress */}
            {cartItems.length > 0 && (
              <div className="bg-(--surface-strong) px-6 py-4">
                <div className="mb-2 flex items-center justify-center gap-2 text-sm text-stone-700">
                  <Truck size={16} className="text-(--gold)" />
                  {isFreeShipping ? (
                    <span className="font-medium">You have unlocked free shipping!</span>
                  ) : (
                    <span>Add <span className="font-semibold">{formatCurrency(remaining)}</span> for free shipping</span>
                  )}
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                  <motion.div
                    className="h-full bg-(--gold)"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6">
              {cartItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-stone-50">
                    <ShoppingBag size={32} className="text-stone-300" />
                  </div>
                  <p className="font-serif text-xl font-medium text-stone-900">Your bag is empty.</p>
                  <p className="mt-2 text-sm text-stone-500">Discover our luxury collection to start shopping.</p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      router.push("/shop");
                    }}
                    className="mt-8 rounded-full bg-stone-900 px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-(--gold) cursor-pointer"
                  >
                    Explore Shop
                  </button>
                </div>
              ) : (
                <div className="py-2">
                  <AnimatePresence mode="popLayout">
                    {cartItems.map((item) => (
                      <motion.div
                        key={item._id || item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CartItemRow item={item} onRemove={handleRemove} onQtyChange={handleQtyChange} updating={updating} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-stone-200/60 bg-white px-6 py-6">
                <div className="mb-4 flex items-center justify-between text-lg font-medium text-stone-900">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartSubtotal)}</span>
                </div>
                <p className="mb-6 text-xs text-stone-500">Shipping & taxes calculated at checkout.</p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleCheckout}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-(--gold) cursor-pointer"
                  >
                    Proceed to Checkout <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      router.push("/cart");
                    }}
                    className="w-full rounded-full border border-stone-300 py-4 text-xs font-bold uppercase tracking-[0.2em] text-stone-700 transition-all hover:border-stone-900 hover:text-stone-900 cursor-pointer"
                  >
                    View Bag
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
