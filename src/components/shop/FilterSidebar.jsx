"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal, Check, ChevronDown, RotateCcw } from "lucide-react";
import { getVariantFilters } from "@/Api/AllApi";


/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const OCCASIONS = [
  "Bridal", "Wedding", "Festive", "Party Wear",
  "Casual", "Office", "Puja", "Anniversary",
];

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest First",       sub: "Latest additions" },
  { value: "price_asc",  label: "Price: Low → High",  sub: "Budget friendly first" },
  { value: "price_desc", label: "Price: High → Low",  sub: "Premium first" },
  { value: "popular",    label: "Most Popular",        sub: "Customer favourites" },
];



/* ─────────────────────────────────────────────
   SECTION WRAPPER
───────────────────────────────────────────── */
function Section({ title, count = 0, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-2xl border border-(--border) bg-white/50 backdrop-blur-sm transition-all hover:border-(--gold)/30 hover:shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-white cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-(--text)">{title}</span>
          {count > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-(--gold) px-1.5 text-[9px] font-bold text-white shadow-sm">
              {count}
            </span>
          )}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-(--muted)" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-black/5 bg-white px-5 py-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SORT OPTION ROW
───────────────────────────────────────────── */
function SortRow({ option, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
        active
          ? "bg-(--gold-soft) ring-1 ring-(--gold)/30"
          : "hover:bg-stone-50"
      } cursor-pointer`}
    >
      {/* Radio dot */}
      <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
        active ? "border-(--gold) bg-(--gold)" : "border-stone-300"
      }`}>
        {active && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
      </div>
      <div className="min-w-0">
        <p className={`text-sm ${active ? "font-semibold text-(--text)" : "text-(--muted)"}`}>
          {option.label}
        </p>
        <p className="text-[10px] text-stone-400">{option.sub}</p>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────
   CHIP (fabric / occasion)
───────────────────────────────────────────── */
function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? "border-(--gold) bg-(--gold) text-white shadow-sm"
          : "border-(--border) bg-white text-(--muted) hover:border-(--gold)/60 hover:text-(--text)"
      } cursor-pointer`}
    >
      {active && <Check size={10} strokeWidth={3} />}
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────
   SKELETON CHIPS
───────────────────────────────────────────── */
function ChipSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      {[60, 72, 52, 80, 64].map(w => (
        <div key={w} className="h-7 animate-pulse rounded-full bg-stone-100" style={{ width: w }} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SHARED FILTER CONTENT
───────────────────────────────────────────── */
function FilterContent({ filters, onChange, onReset, filterMeta, metaLoading, onApply, showApplyButton, appliedFilters }) {
  const activeSort    = filters.sort !== "newest";
  const activeFabrics = filters.fabrics.length;
  const activeOcc     = filters.occasions.length;
  const hasAny = activeSort || activeFabrics || activeOcc;
  
  // Check if working filters differ from applied filters
  const hasChanges = appliedFilters 
    ? JSON.stringify(filters) !== JSON.stringify(appliedFilters)
    : hasAny;

  function toggleArray(key, val) {
    onChange(prev => ({
      ...prev,
      [key]: prev[key].includes(val)
        ? prev[key].filter(v => v !== val)
        : [...prev[key], val],
    }));
  }

  return (
    <div className="space-y-2.5">
      {/* Sort */}
      <Section title="Sort By" count={activeSort ? 1 : 0}>
        <div className="space-y-1">
          {SORT_OPTIONS.map(opt => (
            <SortRow
              key={opt.value}
              option={opt}
              active={filters.sort === opt.value}
              onClick={() => onChange(prev => ({ ...prev, sort: opt.value }))}
              className="cursor-pointer" />
          ))}
        </div>
      </Section>
      {/* Fabric */}
      {(metaLoading || filterMeta?.fabrics?.length > 0) && (
        <Section title="Fabric" count={activeFabrics}>
          {metaLoading
            ? <ChipSkeleton />
            : <div className="flex flex-wrap gap-2">
                {filterMeta.fabrics.map(f => (
                  <Chip
                    key={f}
                    label={f}
                    active={filters.fabrics.includes(f)}
                    onClick={() => toggleArray("fabrics", f)}
                    className="cursor-pointer" />
                ))}
              </div>
          }
        </Section>
      )}
      {/* Occasion */}
      <Section title="Occasion" count={activeOcc} defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map(o => (
            <Chip
              key={o}
              label={o}
              active={filters.occasions.includes(o)}
              onClick={() => toggleArray("occasions", o)}
              className="cursor-pointer" />
          ))}
        </div>
      </Section>
      {/* Action Buttons */}
      <div className="space-y-2">
        <AnimatePresence>
          {(hasAny || hasChanges) && (
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              type="button"
              onClick={onReset}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-3 text-xs font-semibold text-rose-600 transition-all hover:bg-rose-100 cursor-pointer"
            >
              <RotateCcw size={12} /> Clear All Filters
            </motion.button>
          )}
        </AnimatePresence>

        {showApplyButton && (
          <AnimatePresence>
            {hasChanges && (
              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                type="button"
                onClick={onApply}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-(--gold) py-3 text-xs font-bold uppercase tracking-[0.22em] text-white transition-all hover:bg-(--text) cursor-pointer"
              >
                Apply Filters
              </motion.button>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FETCH META HOOK
───────────────────────────────────────────── */
function useFilterMeta(categoryId, onChange, enabled = true) {
  const [filterMeta, setFilterMeta] = useState(null);
  const [metaLoading, setMetaLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMetaLoading(true);
    getVariantFilters(categoryId ? { category: categoryId } : {})
      .then(d => {
        const data = d?.data || d;
        const meta = {
          fabrics:    data?.fabrics    || [],
        };
        setFilterMeta(meta);
      })
      .catch(() => setFilterMeta({ fabrics: [] }))
      .finally(() => setMetaLoading(false));
  }, [categoryId, enabled]); // eslint-disable-line

  return { filterMeta, metaLoading };
}

/* ─────────────────────────────────────────────
   DESKTOP SIDEBAR
───────────────────────────────────────────── */
export function FilterSidebarDesktop({ filters, onChange, onReset, onApply, categoryId, appliedFilters }) {
  const { filterMeta, metaLoading } = useFilterMeta(categoryId, onChange);

  const activeCount =
    (filters.sort !== "newest" ? 1 : 0) +
    filters.fabrics.length +
    filters.occasions.length;

  return (
    <aside className="hidden w-[280px] shrink-0 lg:block">
      <div className="surface-card p-0">
        {/* Sidebar header (Fixed at top) */}
        <div className="sticky top-0 z-10 bg-white flex shrink-0 items-center justify-between border-b border-black/5 p-6 pb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-(--gold)" />
            <h2 className="text-[11px] font-bold uppercase tracking-[0.24em] text-(--text)">
              Filters
            </h2>
            {activeCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-(--gold) px-1.5 text-[9px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable filter sections */}
        <div className="p-6 pt-5">
          <FilterContent
            filters={filters}
            onChange={onChange}
            onReset={onReset}
            onApply={onApply}
            showApplyButton={true}
            appliedFilters={appliedFilters}
            filterMeta={filterMeta}
            metaLoading={metaLoading}
          />
          {/* Spacer to ensure apply buttons aren't cut off at the very bottom */}
          <div className="h-4" />
        </div>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────
   MOBILE DRAWER
───────────────────────────────────────────── */
export function FilterDrawerMobile({ open, onClose, filters, onChange, onReset, onApply, categoryId, activeCount }) {
  const { filterMeta, metaLoading } = useFilterMeta(categoryId, onChange, open);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden cursor-pointer"
          />

          {/* Sheet — slides from bottom on mobile, right on tablet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col rounded-t-[28px] bg-(--background) shadow-2xl lg:hidden"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-stone-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 pt-1">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal size={16} className="text-(--gold)" />
                <h2 className="font-semibold text-(--text)">Filters & Sort</h2>
                {activeCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-(--gold) text-[10px] font-bold text-white">
                    {activeCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-(--border)" />

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <FilterContent
                filters={filters}
                onChange={onChange}
                onReset={onReset}
                filterMeta={filterMeta}
                metaLoading={metaLoading}
              />
            </div>

            {/* Footer actions */}
            <div className="border-t border-(--border) px-4 py-4 pb-safe">
              <div className="flex gap-3">
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={onReset}
                    className="flex-1 rounded-full border border-(--border) py-3.5 text-xs font-semibold text-(--muted) transition-all hover:border-rose-300 hover:text-rose-600 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={onApply}
                  className="flex-1 rounded-full bg-(--gold) py-3.5 text-xs font-bold uppercase tracking-[0.22em] text-white transition-all hover:bg-(--text) cursor-pointer"
                >
                  {activeCount > 0 ? `Apply (${activeCount})` : "Apply"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
