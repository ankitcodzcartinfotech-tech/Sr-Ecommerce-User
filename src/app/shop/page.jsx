"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

import PageHero from "@/components/common/PageHero";
import ProductCard from "@/components/ProductCard";
import ProductGridSkeleton from "@/components/common/ProductGridSkeleton";
import { FilterSidebarDesktop, FilterDrawerMobile } from "@/components/shop/FilterSidebar";
import { getProducts, getVariantFilters } from "@/Api/AllApi";
import { normalizeProductList } from "@/lib/storefront";

const LIMIT = 12;

const DEFAULT_FILTERS = {
  sort: "newest",
  fabrics: [],
  occasions: [],
};

/* ── sort products client-side if backend doesn't support sort param ─ */
function sortProducts(list, sort) {
  const copy = [...list];
  if (sort === "price_asc") return copy.sort((a, b) => (a.variants?.[0]?.salePrice || 0) - (b.variants?.[0]?.salePrice || 0));
  if (sort === "price_desc") return copy.sort((a, b) => (b.variants?.[0]?.salePrice || 0) - (a.variants?.[0]?.salePrice || 0));
  return copy; // newest is default from backend
}

/* ── active filter count badge ─────────────────────────────── */
function countActive(filters) {
  let n = 0;
  if (filters.sort !== "newest") n++;
  n += filters.fabrics.length;
  n += filters.occasions.length;
  return n;
}

/* ── active filter pill strip ──────────────────────────────── */
function ActiveFilterPills({ filters, onChange }) {
  const pills = [];

  if (filters.sort !== "newest") {
    const labels = { price_asc: "Price ↑", price_desc: "Price ↓", popular: "Popular" };
    pills.push({ key: "sort", label: labels[filters.sort] || filters.sort, onRemove: () => onChange(p => ({ ...p, sort: "newest" })) });
  }
  filters.fabrics.forEach(f => pills.push({ key: `fab-${f}`, label: f, onRemove: () => onChange(p => ({ ...p, fabrics: p.fabrics.filter(x => x !== f) })) }));
  filters.occasions.forEach(o => pills.push({ key: `occ-${o}`, label: o, onRemove: () => onChange(p => ({ ...p, occasions: p.occasions.filter(x => x !== o) })) }));

  if (!pills.length) return null;

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {pills.map(pill => (
        <span key={pill.key} className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-(--text) shadow-sm hover:border-(--gold)/50 transition-colors">
          {pill.label}
          <button type="button" onClick={pill.onRemove} className="text-(--muted) hover:text-(--gold) transition-colors ml-1 cursor-pointer">
            <X size={12} strokeWidth={2.5} />
          </button>
        </span>
      ))}
    </div>
  );
}

/* ── main shop content ─────────────────────────────────────── */
function ShopContent({ query, occasionParam }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Initialize filters with occasionParam if present
  const initialFilters = { ...DEFAULT_FILTERS };
  if (occasionParam) {
    initialFilters.occasions = [occasionParam];
  }
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [workingFilters, setWorkingFilters] = useState(initialFilters);
  const [filterMeta, setFilterMeta] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const ignoreRef = useRef(false);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [drawerOpen]);

  /* Fetch filter meta */
  useEffect(() => {
    getVariantFilters(categoryId ? { category: categoryId } : {})
      .then(d => {
        const data = d?.data || d;
        setFilterMeta({
          fabrics: data?.fabrics || [],
        });
      })
      .catch(() => setFilterMeta({ fabrics: [] }));
  }, [categoryId]);

  /* Build API params from filters */
  const buildParams = useCallback((pageNum, f) => {
    const params = { page: pageNum, limit: LIMIT };
    if (query) params.search = query;
    if (f.fabrics.length > 0) params.fabric = f.fabrics.join(',');
    if (f.occasions.length > 0) params.design = f.occasions.join(','); // maps to design field
    if (categoryId) params.category = categoryId;
    if (f.sort && f.sort !== "newest") params.sort = f.sort;
    return params;
  }, [query, categoryId]);

  /* Initial load / filter change → reset to page 1 */
  useEffect(() => {
    ignoreRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setPage(1);
    setProducts([]);

    getProducts(buildParams(1, appliedFilters))
      .then(data => {
        if (ignoreRef.current) return;
        const list = normalizeProductList(data);
        // No need to sort client-side now that backend handles it!
        setProducts(list);
        const total = data?.pagination?.total ?? data?.total ?? list.length;
        setTotalCount(total);
        setHasMore(list.length === LIMIT && list.length < total);
      })
      .catch(err => {
        if (!ignoreRef.current) {
          setError("Could not load products. Please check the server is running.");
        }
      })
      .finally(() => { if (!ignoreRef.current) setLoading(false); });

    return () => { ignoreRef.current = true; };
  }, [query, appliedFilters, categoryId, buildParams]);

  /* Load more */
  async function handleLoadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const data = await getProducts(buildParams(nextPage, appliedFilters));
      const list = normalizeProductList(data);
      setProducts(prev => [...prev, ...list]);
      setPage(nextPage);
      setHasMore(list.length === LIMIT);
    } catch {
      /* silent */
    } finally {
      setLoadingMore(false);
    }
  }

  function applyFilters() {
    setAppliedFilters({ ...workingFilters });
  }

  function resetFilters() {
    setWorkingFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  }

  function handlePillRemove(updater) {
    const newFilters = updater(workingFilters);
    setWorkingFilters(newFilters);
    setAppliedFilters(newFilters);
  }

  const activeAppliedCount = countActive(appliedFilters);
  const activeWorkingCount = countActive(workingFilters);

  return (
    <div className="page-shell pb-20">
      <PageHero
        eyebrow={query ? "Search Results" : occasionParam ? "Shop by Occasion" : "The Shop"}
        title={query ? `Results for "${query}"` : occasionParam ? `${occasionParam.charAt(0).toUpperCase() + occasionParam.slice(1)} Sarees` : "Explore the Keshrag Shop"}
        description={
          query
            ? "A curated set of matching products from our current saree collection."
            : occasionParam
              ? `Browse beautiful sarees perfect for ${occasionParam.charAt(0).toUpperCase() + occasionParam.slice(1)}.`
              : "Browse signature silks, modern occasion drapes, and versatile everyday sarees in one place."
        }
        primaryAction={{ href: "/collections", label: "Browse Collections" }}
      />
      <div className="mx-auto w-full max-w-[1600px] px-4 pt-6 sm:px-6 md:px-10 lg:px-12 xl:px-16">
        {/* Mobile toolbar */}
        <div className="mb-5 flex items-center justify-between lg:hidden">
          <p className="text-sm text-(--muted)">
            {!loading && <span>{totalCount} product{totalCount !== 1 ? "s" : ""}</span>}
          </p>
          <button
            type="button"
            onClick={() => { setWorkingFilters({ ...appliedFilters }); setDrawerOpen(true); }}
            className="flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-4 py-2.5 text-sm font-semibold text-(--text) transition-all hover:border-(--gold) cursor-pointer"
          >
            <SlidersHorizontal size={15} className="text-(--gold)" />
            Filters & Sort
            {activeAppliedCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-(--gold) text-[10px] font-bold text-white">
                {activeAppliedCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-0 pt-4 items-start">
          {/* Desktop sidebar */}
          <div
            data-lenis-prevent="true"
            className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out self-start sticky top-[90px] max-h-[calc(100vh-90px)] overflow-y-auto overflow-x-hidden overscroll-contain ${
              showFilters ? "w-[328px] opacity-100" : "w-0 opacity-0 pointer-events-none"
            }`}
          >
            <div className="w-[280px] mr-12">
              <FilterSidebarDesktop
                filters={workingFilters}
                onChange={setWorkingFilters}
                onReset={resetFilters}
                onApply={applyFilters}
                categoryId={categoryId}
                appliedFilters={appliedFilters}
              />
            </div>
          </div>

          {/* Product grid */}
          <div className="min-w-0 flex-1">
            {/* Desktop results header */}
            <div className="mb-5 hidden items-center justify-between lg:flex">
              <p className="text-sm text-(--muted)">
                {!loading && <span><b>{totalCount}</b> product{totalCount !== 1 ? "s" : ""} found</span>}
              </p>
              
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 text-sm font-semibold text-(--text) hover:text-(--gold) transition-colors cursor-pointer"
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                  <SlidersHorizontal size={15} />
                </button>

                {activeAppliedCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="flex items-center gap-2 rounded-full border border-(--gold) bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-(--gold) transition-all hover:bg-(--gold) hover:text-white cursor-pointer"
                  >
                    Show All Products
                  </button>
                )}
              </div>
            </div>

            {/* Mobile results header */}
            {activeAppliedCount > 0 && (
              <div className="mb-5 flex items-center justify-end lg:hidden">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-2 rounded-full border border-(--gold) bg-white px-3 py-1.5 text-xs font-bold text-(--gold) transition-all hover:bg-(--gold) hover:text-white cursor-pointer"
                >
                  Show All
                </button>
              </div>
            )}

            {/* Active filter pills */}
            <ActiveFilterPills filters={appliedFilters} onChange={handlePillRemove} />

            {/* Grid */}
            {loading ? (
              <ProductGridSkeleton count={8} className={`grid-cols-2 md:grid-cols-2 ${showFilters ? 'lg:grid-cols-3 xl:grid-cols-3' : 'lg:grid-cols-4 xl:grid-cols-4'}`} />
            ) : error ? (
              <div className="surface-card rounded-[28px] px-6 py-10 text-center text-(--muted)">
                {error}
              </div>
            ) : products.length > 0 ? (
              <>
                <motion.div
                  className={`grid grid-cols-2 md:grid-cols-2 ${
                    showFilters ? "lg:grid-cols-3 xl:grid-cols-3" : "lg:grid-cols-4 xl:grid-cols-4"
                  } gap-4 md:gap-6 transition-all duration-300`}
                >
                  <AnimatePresence mode="popLayout">
                    {products.map((product, index) => (
                      <motion.div
                        key={product._id || index}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index < 12 ? index * 0.03 : 0 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Load More */}
                {hasMore && (
                  <div className="mt-12 flex justify-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="flex items-center gap-2 rounded-full border-2 border-(--gold) px-10 py-3.5 text-xs font-bold uppercase tracking-[0.22em] text-(--gold) transition-all hover:bg-(--gold) hover:text-white disabled:opacity-50 cursor-not-allowed"
                    >
                      {loadingMore ? (
                        <><span className="h-4 w-4 animate-spin rounded-full border-2 border-(--gold) border-t-transparent" /> Loading…</>
                      ) : (
                        <><ChevronDown size={15} /> Load More</>
                      )}
                    </button>
                  </div>
                )}

                {/* Load more skeletons */}
                {loadingMore && (
                  <div className="mt-6">
                    <ProductGridSkeleton count={4} />
                  </div>
                )}

                {/* End of results */}
                {!hasMore && products.length > LIMIT && (
                  <p className="mt-10 text-center text-sm text-(--muted)">
                    You&apos;ve seen all {totalCount} products
                  </p>
                )}
              </>
            ) : (
              <div className="surface-card rounded-[28px] px-6 py-16 text-center text-(--muted)">
                <p className="mb-3 text-base font-semibold">No products found</p>
                <p className="text-sm">
                  {query
                    ? "Try a different search term."
                    : activeAppliedCount > 0
                      ? "Try removing some filters."
                      : "Add products from the admin panel to see them here."}
                </p>
                {activeAppliedCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 text-sm font-semibold text-(--gold) hover:underline cursor-pointer"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile drawer */}
      <FilterDrawerMobile
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={workingFilters}
        onChange={setWorkingFilters}
        onReset={() => { setWorkingFilters(DEFAULT_FILTERS); }}
        onApply={() => { applyFilters(); setDrawerOpen(false); }}
        categoryId={categoryId}
        activeCount={activeWorkingCount}
      />
    </div>
  );
}

function ShopPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("search")?.trim() || "";
  const occasionParam = searchParams.get("occasion")?.trim() || "";
  return <ShopContent key={query + occasionParam} query={query} occasionParam={occasionParam} />;
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="page-shell pb-20">
          <PageHero
            eyebrow="The Shop"
            title="Explore the Keshrag Shop"
            description="Browse signature silks, modern occasion drapes, and versatile everyday sarees in one place."
            primaryAction={{ href: "/collections", label: "Browse Collections" }}
          />
          <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 md:px-10 lg:px-12 xl:px-16">
            <ProductGridSkeleton count={8} />
          </div>
        </div>
      }
    >
      <ShopPageContent />
    </Suspense>
  );
}
