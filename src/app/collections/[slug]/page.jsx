"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronDown, X, LayoutGrid, Search } from "lucide-react";

import PageHero from "@/components/common/PageHero";
import ProductCard from "@/components/ProductCard";
import ProductGridSkeleton from "@/components/common/ProductGridSkeleton";
import { FilterSidebarDesktop, FilterDrawerMobile } from "@/components/shop/FilterSidebar";
import { getCategories, getProducts } from "@/Api/AllApi";
import {
  normalizeCategoryList,
  normalizeProductList,
  slugify,
  titleFromSlug,
} from "@/lib/storefront";

const LIMIT = 12;

const DEFAULT_FILTERS = {
  sort:       "newest",
  priceRange: [0, 0],
  fabrics:    [],
  occasions:  [],
};

function sortProducts(list, sort) {
  const copy = [...list];
  if (sort === "price_asc")  return copy.sort((a, b) => (a.variants?.[0]?.salePrice || 0) - (b.variants?.[0]?.salePrice || 0));
  if (sort === "price_desc") return copy.sort((a, b) => (b.variants?.[0]?.salePrice || 0) - (a.variants?.[0]?.salePrice || 0));
  return copy;
}

function countActive(filters) {
  let n = 0;
  if (filters.sort !== "newest") n++;
  if (filters.fabrics.length) n += filters.fabrics.length;
  if (filters.occasions.length) n += filters.occasions.length;
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 99999) n++;
  return n;
}

function ActiveFilterPills({ filters, onChange }) {
  const pills = [];
  const labels = { price_asc: "Price ↑", price_desc: "Price ↓", popular: "Popular" };
  if (filters.sort !== "newest") pills.push({ key: "sort", label: labels[filters.sort] || filters.sort, onRemove: () => onChange(p => ({ ...p, sort: "newest" })) });
  filters.fabrics.forEach(f => pills.push({ key: `fab-${f}`, label: f, onRemove: () => onChange(p => ({ ...p, fabrics: p.fabrics.filter(x => x !== f) })) }));
  filters.occasions.forEach(o => pills.push({ key: `occ-${o}`, label: o, onRemove: () => onChange(p => ({ ...p, occasions: p.occasions.filter(x => x !== o) })) }));
  if (!pills.length) return null;
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {pills.map(pill => (
        <span key={pill.key} className="flex items-center gap-1.5 rounded-full border border-(--gold)/40 bg-(--gold-soft) px-3 py-1 text-xs font-medium text-(--text)">
          {pill.label}
          <button type="button" onClick={pill.onRemove} className="text-(--muted) hover:text-(--text) cursor-pointer"><X size={11} /></button>
        </span>
      ))}
    </div>
  );
}

export default function CollectionDetailPage() {
  const params = useParams();
  return <CollectionDetailContent key={params.slug} slug={params.slug} />;
}

function CollectionDetailContent({ slug }) {
  const [collectionName, setCollectionName] = useState(titleFromSlug(slug));
  const [categoryId, setCategoryId]         = useState(null);
  const [products, setProducts]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [loadingMore, setLoadingMore]       = useState(false);
  const [error, setError]                   = useState(null);
  const [page, setPage]                     = useState(1);
  const [hasMore, setHasMore]               = useState(true);
  const [totalCount, setTotalCount]         = useState(0);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [workingFilters, setWorkingFilters] = useState(DEFAULT_FILTERS);
  const [drawerOpen, setDrawerOpen]         = useState(false);
  const ignoreRef                           = useRef(false);

  useEffect(() => {
    getCategories()
      .then(data => {
        const cats = normalizeCategoryList(data);
        const match = cats.find(c => slugify(c.name) === slug);
        setCollectionName(match?.name || titleFromSlug(slug));
        setCategoryId(match?._id || null);
      })
      .catch(() => {});
  }, [slug]);

  const buildParams = useCallback((pageNum, f) => {
    const params = { page: pageNum, limit: LIMIT };
    if (categoryId)             params.category   = categoryId;
    else                        params.search     = titleFromSlug(slug);
    if (f.fabrics.length === 1) params.fabric     = f.fabrics[0];
    if (f.occasions.length === 1) params.design   = f.occasions[0];
    if (f.priceRange[0] > 0)    params.minPrice   = f.priceRange[0];
    if (f.priceRange[1] < 99999) params.maxPrice  = f.priceRange[1];
    return params;
  }, [categoryId, slug]);

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
        const sorted = sortProducts(list, appliedFilters.sort);
        setProducts(sorted);
        const total = data?.pagination?.total ?? data?.total ?? list.length;
        setTotalCount(total);
        setHasMore(list.length === LIMIT && sorted.length < total);
      })
      .catch(() => { if (!ignoreRef.current) setError("Could not load this collection."); })
      .finally(() => { if (!ignoreRef.current) setLoading(false); });

    return () => { ignoreRef.current = true; };
  }, [categoryId, appliedFilters]); // eslint-disable-line

  async function handleLoadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const data = await getProducts(buildParams(nextPage, appliedFilters));
      const list = normalizeProductList(data);
      const sorted = sortProducts(list, appliedFilters.sort);
      setProducts(prev => [...prev, ...sorted]);
      setPage(nextPage);
      setHasMore(sorted.length === LIMIT);
    } catch { /* silent */ }
    finally { setLoadingMore(false); }
  }

  function applyFilters() { setAppliedFilters({ ...workingFilters }); }
  function resetFilters()  { setWorkingFilters(DEFAULT_FILTERS); setAppliedFilters(DEFAULT_FILTERS); }
  function handlePillRemove(updater) {
    const newFilters = updater(workingFilters);
    setWorkingFilters(newFilters);
    setAppliedFilters(newFilters);
  }

  const activeAppliedCount = countActive(appliedFilters);
  const activeWorkingCount = countActive(workingFilters);

  return (
    <div className="page-shell bg-[#FAF9F6] pb-16 lg:pb-24">
      <PageHero
        eyebrow="Collection"
        title={collectionName}
        description="A focused edit from the Keshrag catalogue, chosen around one mood, one texture family, or one occasion story."
        primaryAction={{ href: "/shop", label: "Shop All Products" }}
        secondaryAction={{ href: "/collections", label: "All Collections", variant: "outline" }}
      />

      <div className="mx-auto w-full max-w-[1600px] px-3 pt-5 sm:px-6 md:px-10 lg:px-12 xl:px-16">

        {/* ── Mobile toolbar ── */}
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <LayoutGrid size={14} className="text-[#e88436]" />
            {!loading && (
              <span className="font-semibold text-stone-800">
                {totalCount} <span className="font-normal text-stone-500">product{totalCount !== 1 ? "s" : ""}</span>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => { setWorkingFilters({ ...appliedFilters }); setDrawerOpen(true); }}
            className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm transition-all hover:border-[#e88436] hover:text-[#e88436] cursor-pointer"
          >
            <SlidersHorizontal size={13} className="text-[#e88436]" />
            Filters
            {activeAppliedCount > 0 && (
              <span className="flex h-4.5 w-4.5 min-w-[18px] items-center justify-center rounded-full bg-[#e88436] text-[9px] font-bold text-white px-1">
                {activeAppliedCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Main layout ── */}
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8 xl:gap-10">

          {/* Desktop filter sidebar */}
          <FilterSidebarDesktop
            filters={workingFilters}
            onChange={setWorkingFilters}
            onReset={resetFilters}
            onApply={applyFilters}
            categoryId={categoryId}
            appliedFilters={appliedFilters}
          />

          {/* Product area */}
          <div className="min-w-0 flex-1">

            {/* Desktop top bar */}
            <div className="mb-5 hidden items-center justify-between lg:flex">
              <div className="flex items-center gap-2">
                <LayoutGrid size={15} className="text-[#e88436]" />
                <p className="text-sm text-stone-500">
                  {!loading && (
                    <><b className="text-stone-900">{totalCount}</b> product{totalCount !== 1 ? "s" : ""} found</>
                  )}
                </p>
              </div>
            </div>

            <ActiveFilterPills filters={appliedFilters} onChange={handlePillRemove} />

            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : error ? (
              <div className="rounded-2xl border border-stone-100 bg-white px-6 py-12 text-center text-stone-400 shadow-sm">
                <Search size={32} className="mx-auto mb-3 text-stone-300" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            ) : products.length > 0 ? (
              <>
                <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 xl:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {products.map((product, index) => (
                      <motion.div
                        key={product._id || index}
                        layout
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

                {hasMore && (
                  <div className="mt-10 flex justify-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="flex items-center gap-2 rounded-full border-2 border-[#e88436] px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#e88436] transition-all hover:bg-[#e88436] hover:text-white disabled:opacity-50 cursor-pointer"
                    >
                      {loadingMore
                        ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#e88436] border-t-transparent" /> Loading…</>
                        : <><ChevronDown size={14} /> Load More</>}
                    </button>
                  </div>
                )}
                {loadingMore && <div className="mt-5"><ProductGridSkeleton count={4} /></div>}
                {!hasMore && products.length > LIMIT && (
                  <p className="mt-10 text-center text-xs text-stone-400 tracking-wide">
                    You've seen all {totalCount} products in this collection
                  </p>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-stone-100 bg-white px-6 py-14 text-center shadow-sm">
                <Search size={36} className="mx-auto mb-4 text-stone-200" />
                <p className="text-sm font-semibold text-stone-600">No products found</p>
                <p className="mt-1.5 text-xs text-stone-400">Try adjusting or clearing your filters</p>
                {activeAppliedCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 rounded-full bg-[#e88436] px-6 py-2 text-xs font-bold text-white transition-all hover:bg-[#d4722a] cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <FilterDrawerMobile
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={workingFilters}
        onChange={setWorkingFilters}
        onReset={() => setWorkingFilters(DEFAULT_FILTERS)}
        onApply={() => { applyFilters(); setDrawerOpen(false); }}
        categoryId={categoryId}
        activeCount={activeWorkingCount}
      />
    </div>
  );
}
