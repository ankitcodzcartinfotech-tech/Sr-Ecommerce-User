"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/utils/toast";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Search,
  SlidersHorizontal,
  X,
  PackageOpen,
} from "lucide-react";
import {
  getWishlist,
  removeFromWishlist,
  moveToCart,
  clearWishlist,
} from "@/Api/AllApi";
import {
  formatCurrency,
  getProductHref,
  getProductImagePath,
  getProductName,
  getProductPrice,
  getProductMrp,
  resolveMediaSrc,
} from "@/lib/storefront";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useCartWishlist } from "@/contexts/CartWishlistContext";

/* ─── helpers ─────────────────────────────────────────────── */
function getItemId(item) {
  return item._id || item.wishlistItemId || item.id;
}
function getProduct(item) {
  return item.product || item.productId || item;
}
function resolveImage(item) {
  return resolveMediaSrc(getProductImagePath(getProduct(item)));
}

/* ─── Sort ────────────────────────────────────────────────── */
const SORT_OPTIONS = [
  { value: "newest",     label: "Newest first" },
  { value: "price_asc",  label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc",   label: "Name: A–Z" },
];

function sortItems(list, sort) {
  const copy = [...list];
  if (sort === "price_asc")
    return copy.sort((a, b) => getProductPrice(getProduct(a)) - getProductPrice(getProduct(b)));
  if (sort === "price_desc")
    return copy.sort((a, b) => getProductPrice(getProduct(b)) - getProductPrice(getProduct(a)));
  if (sort === "name_asc")
    return copy.sort((a, b) =>
      getProductName(getProduct(a)).localeCompare(getProductName(getProduct(b)))
    );
  return copy;
}

/* ─── Empty state ─────────────────────────────────────────── */
function EmptyWishlist() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center px-6 py-28 text-center"
    >
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-(--gold-soft)">
        <Heart size={40} className="text-(--gold)" />
      </div>
      <h2 className="mb-2 font-serif text-2xl font-semibold text-(--text)">
        Your wishlist is empty
      </h2>
      <p className="mb-8 max-w-xs text-sm leading-relaxed text-(--muted)">
        Save the sarees you love and come back to them anytime.
      </p>
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 rounded-full bg-(--gold) px-7 py-3.5 text-xs font-bold uppercase tracking-[0.22em] text-white transition-all hover:bg-(--text) cursor-pointer"
      >
        Continue Shopping <ArrowRight size={14} />
      </Link>
    </motion.div>
  );
}

/* ─── Wishlist Card ───────────────────────────────────────── */
function WishlistCard({ item, onRemove, onMoveToCart, moving, removing }) {
  const product  = getProduct(item);
  const itemId   = getItemId(item);
  const name     = getProductName(product);
  const price    = getProductPrice(product);
  const mrp      = getProductMrp(product);
  const image    = resolveImage(item);
  const href     = getProductHref(product);
  const discount = mrp > price && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col overflow-hidden rounded-xl md:rounded-[24px] border border-(--border) bg-(--surface) transition-shadow hover:shadow-(--shadow-soft)"
    >
      {/* Remove Button Absolute Top Right */}
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); onRemove(itemId); }}
        disabled={removing === itemId || moving === itemId}
        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-stone-400 shadow-sm backdrop-blur-sm transition-all hover:text-rose-500 disabled:opacity-50 cursor-pointer"
        aria-label="Remove"
      >
        {removing === itemId ? (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-stone-300 border-t-stone-600" />
        ) : (
          <Trash2 size={13} />
        )}
      </button>

      {/* Image */}
      <Link href={href} className="relative block aspect-[4/5] md:aspect-3/4 overflow-hidden bg-stone-100 cursor-pointer">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-stone-300">
            No Image
          </div>
        )}
        {discount > 0 && (
          <span className="absolute left-2 top-2 md:left-3 md:top-3 rounded-full bg-(--gold) px-2 py-1 md:px-2.5 md:py-1 text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-white shadow-sm">
            {discount}% off
          </span>
        )}
      </Link>
      {/* Info */}
      <div className="flex flex-1 flex-col p-3 md:p-4">
        <Link href={href} className="cursor-pointer">
          <h3 className="line-clamp-2 text-xs md:text-sm font-semibold leading-snug text-(--text) hover:text-(--gold)">
            {name}
          </h3>
        </Link>

        <div className="mt-1 flex flex-wrap items-center gap-1.5 md:mt-2 md:gap-2">
          <span className="text-xs md:text-sm font-bold text-(--text)">{formatCurrency(price)}</span>
          {mrp > price && (
            <span className="text-[10px] md:text-xs text-stone-400 line-through">{formatCurrency(mrp)}</span>
          )}
        </div>

        <div className="mt-auto pt-3">
          <button
            type="button"
            onClick={() => onMoveToCart(itemId, product)}
            disabled={moving === itemId || removing === itemId}
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-(--gold) py-2 text-[9px] md:py-2.5 md:text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-(--text) disabled:opacity-50 cursor-pointer"
          >
            {moving === itemId ? (
              <span className="animate-pulse">Moving…</span>
            ) : (
              <><ShoppingBag size={11} className="w-[11px] h-[11px] md:w-[13px] md:h-[13px]" /> <span className="hidden sm:inline">Add to Cart</span><span className="sm:hidden">To Cart</span></>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function WishlistPage() {
  const { refreshCounts } = useCartWishlist();
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState("");
  const [sort,     setSort]     = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [moving,   setMoving]   = useState(null);
  const [removing, setRemoving] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  /* fetch */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getWishlist()
      .then((data) => {
        const list = data?.wishlist?.items || data?.items || data?.wishlist || data || [];
        setItems(Array.isArray(list) ? list : []);
      })
      .catch(() => setError("Could not load wishlist. Please log in and try again."))
      .finally(() => setLoading(false));
  }, []);

  /* filtered + sorted */
  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? items.filter((item) => getProductName(getProduct(item)).toLowerCase().includes(q))
      : items;
    return sortItems(filtered, sort);
  }, [items, search, sort]);

  /* handlers */
  async function handleRemove(itemId) {
    setRemoving(itemId);
    try {
      await removeFromWishlist(itemId);
      setItems((prev) => prev.filter((i) => getItemId(i) !== itemId));
      refreshCounts();
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Could not remove item");
    } finally {
      setRemoving(null);
    }
  }

  async function handleMoveToCart(itemId, product) {
    setMoving(itemId);
    const firstVariant = product?.variants?.[0];
    try {
      await moveToCart(itemId, { variantId: firstVariant?._id, quantity: 1 });
      setItems((prev) => prev.filter((i) => getItemId(i) !== itemId));
      refreshCounts();
      toast.success("Added to cart! 🛍️");
    } catch {
      toast.error("Could not add to cart");
    } finally {
      setMoving(null);
    }
  }

  async function handleClearAll() {
    try {
      await clearWishlist();
      setItems([]);
      refreshCounts();
      toast.success("Wishlist cleared");
    } catch {
      toast.error("Could not clear wishlist");
    }
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="border-b border-(--border) bg-(--surface) px-4 py-6 md:px-10 lg:px-14">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-(--gold) md:text-[10px] md:tracking-[0.3em]">
                Saved Items
              </p>
              <h1 className="font-serif text-2xl font-semibold text-(--text) sm:text-4xl md:text-5xl">
                My Wishlist
                {!loading && items.length > 0 && (
                  <span className="ml-2 inline-block text-lg text-(--muted) sm:ml-3 sm:text-2xl">({items.length})</span>
                )}
              </h1>
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-(--border) px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-(--muted) transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 md:px-5 md:py-2.5 md:text-xs md:tracking-[0.2em] cursor-pointer"
              >
                <Trash2 size={12} /> <span className="hidden sm:inline">Clear all</span>
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Body */}
      <div className="mx-auto max-w-[1440px] px-4 pt-6 md:px-10 lg:px-14">

        {/* Search + Sort — only when items exist */}
        {!loading && items.length > 0 && (
          <div className="mb-6 flex gap-2 sm:gap-3 sm:items-center sm:justify-between">

            {/* Search */}
            <div className="relative w-full max-w-sm flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 md:left-4"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your wishlist…"
                className="w-full rounded-full border border-(--border) bg-(--surface) py-2 pl-8 pr-8 text-xs text-(--text) placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-(--gold)/30 md:py-2.5 md:pl-10 md:pr-10 md:text-sm"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative shrink-0 sm:self-auto">
              <button
                type="button"
                onClick={() => setSortOpen((o) => !o)}
                className="flex min-h-[34px] w-full items-center gap-1.5 rounded-full border border-(--border) bg-(--surface) px-3 py-2 text-left text-xs font-medium text-(--text) transition-all hover:border-(--gold) sm:w-auto md:min-h-[44px] md:gap-2 md:px-5 md:py-2.5 md:text-sm cursor-pointer"
              >
                <SlidersHorizontal size={13} className="text-(--gold) md:w-[15px] md:h-[15px]" />
                <span className="truncate">{SORT_OPTIONS.find((o) => o.value === sort)?.label}</span>
              </button>

              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full z-20 mt-2 w-full min-w-52 overflow-hidden rounded-[20px] border border-(--border) bg-white shadow-(--shadow-strong)"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => { setSort(option.value); setSortOpen(false); }}
                        className={`block w-full px-5 py-3 text-left text-sm transition-colors hover:bg-stone-50 ${
                          sort === option.value
                            ? "font-semibold text-(--gold)"
                            : "text-(--text)"
                        } cursor-pointer`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 gap-3 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl md:rounded-[24px] border border-(--border)">
                <div className="aspect-[4/5] md:aspect-3/4 animate-pulse bg-stone-100" />
                <div className="space-y-2 p-3 md:p-4">
                  <div className="h-2.5 md:h-3 animate-pulse rounded-full bg-stone-100" />
                  <div className="h-2.5 md:h-3 w-2/3 animate-pulse rounded-full bg-stone-100" />
                  <div className="mt-3 md:mt-4 h-7 md:h-9 animate-pulse rounded-full bg-stone-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-[24px] border border-rose-100 bg-rose-50 px-6 py-12 text-center">
            <p className="text-sm font-medium text-rose-700">{error}</p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-rose-700 cursor-pointer"
            >
              Log In
            </Link>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && items.length === 0 && <EmptyWishlist />}

        {/* No search results */}
        {!loading && !error && items.length > 0 && displayed.length === 0 && (
          <div className="py-20 text-center">
            <PackageOpen size={40} className="mx-auto mb-4 text-stone-300" />
            <p className="text-sm text-(--muted)">No items match &ldquo;{search}&rdquo;</p>
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-3 text-xs font-semibold text-(--gold) hover:underline cursor-pointer"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && displayed.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-2 gap-3 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7"
          >
            <AnimatePresence mode="popLayout">
              {displayed.map((item) => (
                <WishlistCard
                  key={getItemId(item)}
                  item={item}
                  onRemove={handleRemove}
                  onMoveToCart={handleMoveToCart}
                  moving={moving}
                  removing={removing}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      {/* Confirm clear modal */}
      <ConfirmModal
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => { handleClearAll(); setConfirmClear(false); }}
        title="Clear Wishlist"
        description="Remove all items from your wishlist? This cannot be undone."
        confirmText="Clear Wishlist"
        cancelText="Keep Items"
        variant="danger"
      />
    </div>
  );
}
