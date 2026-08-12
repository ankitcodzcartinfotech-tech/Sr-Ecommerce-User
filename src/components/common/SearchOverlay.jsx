"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, TrendingUp, History, ArrowRight } from "lucide-react";
import {
  searchProducts,
  saveSearchHistory,
  getSearchHistory,
  getTrendingSearches,
  getSearchSuggestions,
  deleteSearchItem,
  getUserProfile,
} from "@/Api/AllApi";
import {
  formatCurrency,
  getProductHref,
  getProductImagePath,
  getProductName,
  normalizeProductList,
  resolveMediaSrc,
} from "@/lib/storefront";

const searchPlaceholders = [
  "Search for Pure Banarasi Silk...",
  "Search for The Bridal...",
  "Search for Organza Sarees...",
  "Search for Luxury Handlooms...",
];

const popularCollections = [
  { label: "The Bridal Edit", href: "/collections/wedding-atelier", image: "/images/saree1.jpg" },
  { label: "Pure Silk Heritage", href: "/collections/silk-sarees", image: "/images/saree2.jpg" },
  { label: "Organza Elegance", href: "/collections/organza", image: "/images/saree3.jpg" },
];

function resolveSearchImage(product) {
  return resolveMediaSrc(getProductImagePath(product));
}

function SearchProductPreview({ product, onSelect }) {
  const image = resolveSearchImage(product);
  const firstVariant = product.variants?.[0] || {};
  const price = firstVariant.salePrice || firstVariant.mrp || product.saleDetails?.salePrice || 0;

  return (
    <Link
      href={getProductHref(product)}
      onClick={onSelect}
      className="group flex items-center gap-4 rounded-xl p-3 md:p-4 transition-colors hover:bg-stone-50 cursor-pointer"
    >
      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
        {image ? (
          <Image src={image} alt={getProductName(product)} fill sizes="64px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-stone-200" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-stone-900 group-hover:text-(--gold)">
          {getProductName(product)}
        </p>
        {product.productDetail?.category?.name && (
          <p className="mt-1 text-xs text-stone-500">{product.productDetail.category.name}</p>
        )}
        <p className="mt-2 text-sm font-semibold text-stone-900">{formatCurrency(price)}</p>
      </div>
    </Link>
  );
}

export default function SearchOverlay({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const suggestionTimeoutRef = useRef(null);
  const requestIdRef = useRef(0);

  // Authentication check
  useEffect(() => {
    const token = typeof window !== "undefined" && localStorage.getItem("userToken");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoggedIn(!!token);
  }, []);

  // Lock body scroll and focus input
  useEffect(() => {
    let timer;
    if (isOpen) {
      document.body.style.overflow = "hidden";
      timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300); // Increased timeout to ensure framer-motion animation completes
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      if (timer) clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Load history and trending on open
  useEffect(() => {
    if (!isOpen) return;
    async function loadSearchData() {
      setIsLoadingHistory(true);
      if (isLoggedIn) {
        try {
          const historyData = await getSearchHistory(5);
          setRecentSearches(historyData?.data || []);
        } catch (error) {
          console.error("Failed to load recent searches:", error);
        }
      }
      try {
        const trendingData = await getTrendingSearches(5);
        setTrendingSearches(trendingData?.data || []);
      } catch (error) {
        console.error("Failed to load trending searches:", error);
      }
      setIsLoadingHistory(false);
    }
    loadSearchData();
  }, [isOpen, isLoggedIn]);

  // Placeholder animation
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Keyboard accessibility
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function handleClose() {
    setQuery("");
    setResults([]);
    setSuggestions([]);
    onClose();
  }

  function fetchSuggestions(searchQuery) {
    if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    suggestionTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await getSearchSuggestions(searchQuery);
        setSuggestions(data?.data || []);
      } catch (error) {
        console.error("Failed to get suggestions:", error);
      }
    }, 300);
  }

  function runSearch(value, { immediate = false } = {}) {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    const trimmed = value.trim();
    setQuery(value);

    if (!trimmed) {
      requestIdRef.current += 1;
      setResults([]);
      setSearchError(null);
      setIsSearching(false);
      setSuggestions([]);
      return;
    }

    fetchSuggestions(trimmed);

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsSearching(true);
    setSearchError(null);

    const executeSearch = async () => {
      try {
        const data = await searchProducts(trimmed, 6);
        if (requestIdRef.current !== requestId) return;
        setResults(normalizeProductList(data));
      } catch {
        if (requestIdRef.current !== requestId) return;
        setSearchError("Could not load results.");
        setResults([]);
      } finally {
        if (requestIdRef.current === requestId) setIsSearching(false);
      }
    };

    if (immediate) {
      executeSearch();
      return;
    }
    searchTimeoutRef.current = setTimeout(executeSearch, 300);
  }

  function handleSearchChange(event) {
    runSearch(event.target.value);
  }

  function handleInputKeyDown(event) {
    if (event.key === "Enter") {
      const trimmed = query.trim();
      if (trimmed) {
        handleProductSelect();
        router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
      }
    }
  }

  async function handleProductSelect() {
    const trimmed = query.trim();
    if (trimmed && isLoggedIn) {
      try {
        await saveSearchHistory(trimmed);
      } catch (error) {
        console.error("Failed to save search history:", error);
      }
    }
    handleClose();
  }

  function handleSearchTermClick(term) {
    runSearch(term, { immediate: true });
    if (isLoggedIn) {
      saveSearchHistory(term).catch(() => {});
    }
  }

  async function handleDeleteSearchItem(itemId, event) {
    event.stopPropagation();
    try {
      await deleteSearchItem(itemId);
      setRecentSearches((prev) => prev.filter((item) => item._id !== itemId));
    } catch (error) {
      console.error("Failed to delete search item:", error);
    }
  }

  const isZeroState = !query.trim();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9998] flex flex-col md:items-center md:pt-24 bg-black/40 backdrop-blur-md">
          {/* Background click listener for desktop */}
          <div className="absolute inset-0 hidden md:block cursor-pointer" onClick={handleClose} />

          <motion.div
            initial={{ opacity: 0, y: "100%", scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: "100%", scale: 0.95 }}
            transition={{ type: "spring", damping: 28, stiffness: 250 }}
            className="relative z-[9999] flex h-full w-full flex-col bg-white shadow-2xl md:h-auto md:max-h-[80vh] md:max-w-4xl md:rounded-[32px] pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-stone-200/60 px-6 py-6 md:px-10 md:py-8">
              <Search size={24} className="text-stone-400" />
              <div className="relative flex-1">
                {!query && (
                  <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={placeholderIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="font-serif text-xl text-stone-400 md:text-2xl"
                      >
                        {searchPlaceholders[placeholderIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={handleSearchChange}
                  onKeyDown={handleInputKeyDown}
                  autoComplete="off"
                  className="relative z-[10] w-full bg-transparent font-serif text-xl text-stone-900 caret-[var(--gold)] focus:outline-none md:text-2xl"
                />
              </div>
              <button
                onClick={handleClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-900 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
              <AnimatePresence mode="wait">
                {isZeroState ? (
                  <motion.div
                    key="zero-state"
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
                    className="grid gap-12 md:grid-cols-12"
                  >
                    <div className="md:col-span-5 space-y-10">
                      {isLoggedIn && recentSearches.length > 0 && (
                        <div>
                          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
                            Recent Searches
                          </h3>
                          <ul className="space-y-3">
                            {recentSearches.map((item) => (
                              <li key={item._id} className="group flex items-center justify-between">
                                <button
                                  onClick={() => handleSearchTermClick(item.query)}
                                  className="flex flex-1 items-center gap-3 py-2 text-sm text-stone-700 transition-colors hover:text-(--gold) cursor-pointer"
                                >
                                  <History size={16} className="text-stone-400 shrink-0" />
                                  <span className="truncate">{item.query}</span>
                                </button>
                                <button
                                  onClick={(e) => handleDeleteSearchItem(item._id, e)}
                                  className="p-2 text-stone-300 transition-all hover:text-rose-500 md:opacity-0 md:group-hover:opacity-100 cursor-pointer"
                                >
                                  <X size={14} />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div>
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
                          Trending Now
                        </h3>
                        {isLoadingHistory ? (
                          <Loader2 size={20} className="animate-spin text-stone-300" />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {(trendingSearches.length > 0 ? trendingSearches : ["Bridal Silk", "Organza", "Banarasi", "Party Wear"]).map((item, idx) => {
                              const term = item.query || item;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => handleSearchTermClick(term)}
                                  className="flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-5 py-2.5 text-sm text-stone-700 transition-colors hover:border-(--gold) hover:text-(--gold) cursor-pointer shadow-sm"
                                >
                                  <TrendingUp size={14} className="text-stone-400" />
                                  {term}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="md:col-span-7">
                      <h3 className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
                        Discover Collections
                      </h3>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        {popularCollections.map((col, idx) => (
                          <Link
                            key={idx}
                            href={col.href}
                            onClick={handleClose}
                            className="group relative aspect-3/4 overflow-hidden rounded-2xl cursor-pointer"
                          >
                            <Image
                              src={col.image}
                              alt={col.label}
                              fill
                              sizes="(max-width: 768px) 50vw, 33vw"
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                              <p className="font-serif text-sm font-medium leading-tight">
                                {col.label}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="active-state"
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
                    className="grid gap-12 md:grid-cols-12"
                  >
                    <div className="md:col-span-4 space-y-8">
                      {suggestions.length > 0 && (
                        <div>
                          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
                            Suggestions
                          </h3>
                          <ul className="space-y-3">
                            {suggestions.map((suggestion, idx) => (
                              <li key={idx}>
                                <button
                                  onClick={() => handleSearchTermClick(suggestion)}
                                  className="flex w-full items-center gap-3 py-2 text-left text-sm text-stone-700 transition-colors hover:text-(--gold) cursor-pointer"
                                >
                                  <Search size={16} className="text-stone-400 shrink-0" />
                                  <span className="truncate" dangerouslySetInnerHTML={{ __html: suggestion.replace(new RegExp(`(${query})`, "gi"), "<span class='font-bold'>$1</span>") }} />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-8">
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">
                          Products
                        </h3>
                        {results.length > 0 && (
                          <Link
                            href={`/shop?search=${encodeURIComponent(query)}`}
                            onClick={handleProductSelect}
                            className="text-xs font-semibold text-(--gold) hover:underline cursor-pointer"
                          >
                            View all results
                          </Link>
                        )}
                      </div>

                      {isSearching ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-stone-300" />
                        </div>
                      ) : searchError ? (
                        <div className="py-8 text-sm text-rose-500">{searchError}</div>
                      ) : results.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {results.map((product) => (
                            <SearchProductPreview
                              key={product._id || product.id}
                              product={product}
                              onSelect={handleProductSelect}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center text-stone-500">
                          <p>No products found for &ldquo;{query}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Mobile sticky view all button */}
            {!isZeroState && results.length > 0 && (
              <div className="border-t border-stone-200/60 p-4 md:hidden">
                <Link
                  href={`/shop?search=${encodeURIComponent(query)}`}
                  onClick={handleProductSelect}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-(--gold) cursor-pointer"
                >
                  View All Results <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
