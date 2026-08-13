"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { addGuestRecentlyViewed } from "@/lib/guestRecentlyViewed";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/Button";
import ProductCard from "@/components/ProductCard";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import SectionHeading from "@/components/SectionHeading";
import SizeGuideModal from "@/components/product/SizeGuideModal";
import RelatedProducts from "@/components/product/RelatedProducts";
import NotifyMe from "@/components/product/NotifyMe";
import QASection from "@/components/product/QASection";
import { getProduct, getProducts, getReviews, addReview, getOrders, getRecentlyViewed, addRecentlyViewed, addToCart, addToWishlist, upvoteReview } from "@/Api/AllApi";
import { toast } from "@/utils/toast";
import {
  formatCurrency,
  getProductCategory,
  getProductDescription,
  getProductImagePath,
  getProductMetrics,
  getProductMrp,
  getProductName,
  getProductPrice,
  normalizeProductList,

  resolveMediaSrc,
} from "@/lib/storefront";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Star,
  Share2,
  Truck,
  ShieldCheck,
  RotateCcw,
  Gem,
  Check,
  ZoomIn,
  X,
  Maximize2,
  AlertCircle,
  Image as ImageIcon,
  CheckCircle2,
  ThumbsUp,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  return <ProductDetailContent key={params.id} productId={params.id} />;
}

function ProductDetailContent({ productId }) {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);
  const [productReviews, setProductReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewSort, setReviewSort] = useState("newest");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: "", comment: "", orderId: "", images: [] });
  const [reviewFormError, setReviewFormError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [reviewFilter, setReviewFilter] = useState(0); // 0 = all, 1-5 = star filter
  const [votingId, setVotingId] = useState(null);
  const router = useRouter();

  const isLoggedIn = () => {
    return typeof window !== "undefined" && !!localStorage.getItem("userToken");
  };

  useEffect(() => {
    let ignore = false;
    getProduct(productId)
      .then((data) => {
        if (ignore || !data?.product) {
          return null;
        }
        setProduct(data.product);
        const categoryId =
          data.product.productDetail?.category?._id ||
          data.product.productDetail?.category ||
          data.product.categoryId;
        if (!categoryId) {
          return getProducts({ limit: 6 });
        }
        return getProducts({ limit: 6, category: categoryId });
      })
      .then((relatedData) => {
        if (ignore || !relatedData) {
          return;
        }
        const items = normalizeProductList(relatedData).filter(
          (item) => item._id !== productId && item.slug !== productId,
        );
        setRelatedProducts(items.slice(0, 6));
      })
      .catch((err) => {
        console.error("Failed to load product:", err);
        if (!ignore) {
          setError("Could not load this product.");
          setProduct(null);
          setRelatedProducts([]);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [productId]);

  // Fetch reviews when product is loaded
  useEffect(() => {
    if (!product?._id) return;
    let ignore = false;
    // Small delay so reviews don't fire simultaneously with the product fetch
    const timer = setTimeout(() => {
      setReviewsLoading(true);
      getReviews(product._id, { sort: reviewSort })
        .then((data) => {
          if (ignore) return;
          setProductReviews(data?.reviews || []);
          setReviewStats(data?.stats || null);
        })
        .catch(() => {
          if (!ignore) {
            setProductReviews([]);
            setReviewStats(null);
          }
        })
        .finally(() => {
          if (!ignore) setReviewsLoading(false);
        });
    }, 300);
    return () => { ignore = true; clearTimeout(timer); };
  }, [product?._id, reviewSort]);

  // Fetch user orders for review form + track recently viewed + fetch recently viewed list
  // All consolidated into one effect to avoid hammering the API on mount
  useEffect(() => {
    if (!product?._id) return;

    // Track for guests via localStorage (always, regardless of login)
    addGuestRecentlyViewed(product._id);

    if (!isLoggedIn()) return;
    let ignore = false;

    // Track current product as recently viewed on backend (fire-and-forget)
    addRecentlyViewed({ productId: product._id }).catch(() => { });

    // Stagger the remaining two requests to avoid rate limit
    const ordersTimer = setTimeout(() => {
      if (ignore) return;
      getOrders()
        .then((data) => {
          if (ignore) return;
          const orders = data?.orders || data || [];
          const validOrders = (Array.isArray(orders) ? orders : []).filter(order =>
            order.items?.some(item => {
              const itemProductId = item.product?._id || item.product;
              const currentProductId = product._id || product.id;
              return String(itemProductId) === String(currentProductId);
            })
          );
          setUserOrders(validOrders);
        })
        .catch(() => { if (!ignore) setUserOrders([]); });
    }, 500);

    const recentTimer = setTimeout(() => {
      if (ignore) return;
      getRecentlyViewed()
        .then((data) => {
          if (ignore) return;
          const items = (data?.products || [])
            .map((item) => item.product)
            .filter(Boolean)
            .filter((p) => (p._id || p.id) !== product._id)
            .slice(0, 6);
          setRecentlyViewedProducts(items);
        })
        .catch(() => { if (!ignore) setRecentlyViewedProducts([]); });
    }, 800);

    return () => {
      ignore = true;
      clearTimeout(ordersTimer);
      clearTimeout(recentTimer);
    };
  }, [product?._id]);

  // Derive unique sizes from product variants
  const availableSizes = (() => {
    const sizes = product?.variants?.map((v) => v.size).filter(Boolean) || [];
    // deduplicate while preserving order
    return sizes.length ? [...new Set(sizes)] : [];
  })();

  // Auto-select first variant when product loads
  useEffect(() => {
    if (!product) return;
    const firstVariant = product?.variants?.[0] || null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedVariant(firstVariant);
    const firstSize = firstVariant?.size || availableSizes[0] || "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedSize(firstSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  /** Called when user clicks a size button */
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    // Find the first variant matching this size
    const match = product?.variants?.find((v) => v.size === size) || null;
    setSelectedVariant(match);
  };

  const handleWishlist = async (event) => {
    event?.stopPropagation?.();
    if (!isLoggedIn()) {
      toast.warning("Please login to add to wishlist");
      setTimeout(() => router.push("/login"), 1000);
      return;
    }
    try {
      if (wishlisted) {
        setWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist({ productId: product._id || product.id });
        setWishlisted(true);
        toast.success("Added to wishlist ❤️");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn()) {
      toast.warning("Please login to add to cart");
      setTimeout(() => router.push("/login"), 1000);
      return;
    }
    if (!selectedSize && availableSizes.length > 0) {
      toast.warning("Please select a size");
      return;
    }
    if (totalStock === 0) {
      toast.error("This product is currently out of stock.");
      return;
    }
    if (quantity > totalStock) {
      toast.warning(`Only ${totalStock} item(s) left in stock.`);
      return;
    }
    setAddingToCart(true);
    try {
      const variantToAdd = selectedVariant || product?.variants?.[0];
      await addToCart({
        productId: product._id || product.id,
        variantId: variantToAdd?._id || variantToAdd?.id,
        quantity: quantity,
      });
      toast.success("Added to cart! 🛍️");
    } catch (error) {
      toast.error(error.message || "Could not add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  /* Buy Now — add to cart then go straight to checkout */
  const handleBuyNow = async () => {
    if (!isLoggedIn()) {
      toast.warning("Please login to buy");
      setTimeout(() => router.push("/login"), 1000);
      return;
    }
    if (!selectedSize && availableSizes.length > 0) {
      toast.warning("Please select a size");
      return;
    }
    if (totalStock === 0) {
      toast.error("This product is currently out of stock.");
      return;
    }
    if (quantity > totalStock) {
      toast.warning(`Only ${totalStock} item(s) left in stock.`);
      return;
    }
    setAddingToCart(true);
    try {
      const variantToAdd = selectedVariant || product?.variants?.[0];
      await addToCart({
        productId: product._id || product.id,
        variantId: variantToAdd?._id || variantToAdd?.id,
        quantity: quantity,
      });
      router.push("/checkout");
    } catch (error) {
      toast.error(error.message || "Could not process. Please try again.");
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewFormError("");
    if (reviewForm.rating === 0) {
      setReviewFormError("Please select a star rating.");
      return;
    }
    if (!reviewForm.orderId) {
      setReviewFormError("Please select the order this review is for.");
      return;
    }
    setSubmittingReview(true);
    try {
      const formData = new FormData();
      formData.append("productId", product._id || product.id);
      formData.append("orderId", reviewForm.orderId);
      formData.append("rating", reviewForm.rating);
      formData.append("title", reviewForm.title);
      formData.append("comment", reviewForm.comment);
      reviewForm.images.forEach((file) => formData.append("images", file));

      const submitResult = await addReview(formData);

      // ── Optimistically prepend the new review immediately ──────────────
      // Build a local review object so it shows instantly without waiting
      // for a second API call.
      const localImageUrls = reviewForm.images.map((file) =>
        URL.createObjectURL(file)
      );
      const optimisticReview = {
        _id: submitResult?.review?._id || `local-${Date.now()}`,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
        images: localImageUrls,
        isVerifiedPurchase: true,
        helpfulVotes: [],
        createdAt: new Date().toISOString(),
        user: {
          name: typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("userProfile") || "null")?.name || "You"
            : "You",
        },
      };
      setProductReviews((prev) => [optimisticReview, ...prev]);

      // Update stats optimistically
      setReviewStats((prev) => {
        if (!prev) return prev;
        const newTotal = (prev.totalReviews || 0) + 1;
        const newAvg = ((prev.avgRating || 0) * (prev.totalReviews || 0) + reviewForm.rating) / newTotal;
        const starKey = ["oneStar", "twoStar", "threeStar", "fourStar", "fiveStar"][reviewForm.rating - 1];
        return {
          ...prev,
          totalReviews: newTotal,
          avgRating: parseFloat(newAvg.toFixed(1)),
          [starKey]: (prev[starKey] || 0) + 1,
        };
      });

      // Reset form and close it
      setReviewForm({ rating: 0, title: "", comment: "", orderId: "", images: [] });
      setShowReviewForm(false);
      toast.success("Review submitted! Thank you 🎉");

      // Background refresh — replaces the optimistic entry with server data
      // (server-saved image URLs instead of local blob URLs)
      getReviews(product._id || product.id)
        .then((data) => {
          setProductReviews(data?.reviews || []);
          setReviewStats(data?.stats || null);
          // Revoke blob URLs to free memory
          localImageUrls.forEach((url) => URL.revokeObjectURL(url));
        })
        .catch(() => {/* keep optimistic data on background failure */ });

    } catch (err) {
      setReviewFormError(err.message || "Could not submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleVote = async (reviewId) => {
    if (!isLoggedIn()) { toast.warning("Please login to vote"); return; }
    setVotingId(reviewId);
    try {
      await upvoteReview(reviewId);
      setProductReviews(prev => prev.map(r =>
        r._id === reviewId
          ? { ...r, helpfulVotes: [...(r.helpfulVotes || []), "voted"] }
          : r
      ));
    } catch (err) { toast.error(err.message || "Could not vote"); }
    finally { setVotingId(null); }
  };

  if (loading) {
    return (
      <div className="page-shell pb-20">
        <section className="px-4 pb-10 pt-24 sm:px-6 md:px-10 lg:px-14">
          <div className="mx-auto max-w-[1440px]">
            <div className="grid gap-12 md:grid-cols-[1fr_1fr]">
              <div className="space-y-4">
                <div className="surface-card aspect-(3/4) animate-pulse rounded-[34px]" />
                <div className="flex gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="surface-card aspect-square w-16 animate-pulse rounded-2xl sm:w-20 md:w-24" />
                  ))}
                </div>
              </div>
              <div className="surface-card rounded-[34px] p-8 md:p-10">
                <div className="h-4 w-28 animate-pulse rounded-full bg-stone-200" />
                <div className="mt-6 h-12 w-5/6 animate-pulse rounded-lg bg-stone-200" />
                <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-stone-200" />
                <div className="mt-6 space-y-3">
                  <div className="h-4 w-full animate-pulse rounded bg-stone-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-stone-100" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-stone-100" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-shell pb-20">
        <section className="px-4 pb-10 pt-24 sm:px-6 md:px-10 lg:px-14">
          <div className="mx-auto max-w-[1440px] rounded-[34px] border border-stone-900/8 bg-[rgba(255,255,255,0.58)] px-6 py-16 text-center backdrop-blur-sm md:px-10 md:py-20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-(--gold)">
              Product Not Found
            </p>
            <h1 className="mt-5 text-3xl text-stone-900 sm:text-4xl md:text-5xl">
              {error || "This product is not available right now."}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-(--muted)">
              Try browsing the wider collection or contact support if you are looking for a
              specific style.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button href="/shop" size="lg">
                Browse the Shop
              </Button>
              <Button href="/contact" variant="outline" size="lg">
                Contact Support
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const name = getProductName(product);
  const category = getProductCategory(product);
  const description = getProductDescription(product);
  const { rating, reviews } = getProductMetrics(product);

  // ─── Variant-aware price & image ───────────────────────────────────────────
  // Use selectedVariant for price/mrp if available, fallback to product-level helpers
  const price = selectedVariant?.salePrice || selectedVariant?.mrp || getProductPrice(product);
  const mrp = selectedVariant?.mrp || getProductMrp(product);
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const savings = mrp > price ? mrp - price : 0;

  // Calculate stock from the selected variant (or total across all variants)
  const totalStock = selectedVariant
    ? (selectedVariant.stock || 0)
    : (product?.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || product?.stockDetails?.openingQuantity || product?.stock || 0);

  // Build image list:
  // Priority: selected variant images → other variant images → product-level images
  const allImages = (() => {
    const seen = new Set();
    const result = [];
    const push = (img) => { if (img && !seen.has(img)) { seen.add(img); result.push(img); } };

    // 1. Selected variant images first
    if (selectedVariant && Array.isArray(selectedVariant.images)) {
      selectedVariant.images.forEach(push);
    }

    // 2. Other variants' images
    if (product?.variants) {
      product.variants.forEach((v) => {
        if (v === selectedVariant) return;
        if (Array.isArray(v.images)) v.images.forEach(push);
      });
    }

    // 3. Product-level fallbacks
    if (product?.productDetail?.images && Array.isArray(product.productDetail.images)) {
      product.productDetail.images.forEach(push);
    }
    push(product?.productDetail?.image);
    push(product?.image);

    return result;
  })();

  const productImages = allImages.map((img) => resolveMediaSrc(img)).filter(Boolean);

  // Mock sizes and colors removed as selectors are deleted

  const features = [
    { icon: Gem, title: "Premium Quality", desc: "Handpicked luxury fabric" },
    { icon: Truck, title: "Free Shipping", desc: "On orders above ₹2500" },
    { icon: RotateCcw, title: "Easy Returns", desc: "7-day hassle-free returns" },
    { icon: ShieldCheck, title: "Secure Payment", desc: "100% safe transactions" },
  ];

  return (
    <div className="page-shell pb-24">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-4 pb-16 pt-24 sm:px-6 md:px-10 lg:px-14"
      >
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-12">
            {/* Left: Product Gallery */}
            <div className="md:sticky md:top-24 md:self-start">
              <ProductImageGallery images={productImages} productName={name} />
            </div>

            {/* Right: Product Information */}
            <div className="space-y-8">
              {/* Header */}
              <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-(--gold)">
                      {category}
                    </p>
                    <h1 className="text-[clamp(1.75rem,5vw,2.75rem)] font-semibold leading-tight text-(--text)">
                      {name}
                    </h1>
                    <p className="text-sm text-(--muted)">SKU: KESH-{product._id?.slice(-6) || "000000"}</p>
                  </div>

                  <div className="flex gap-2 self-start sm:self-auto">
                    <button
                      onClick={handleWishlist}
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${wishlisted
                          ? "border-rose-500 bg-rose-50 text-rose-600"
                          : "border-stone-200 bg-white hover:border-(--gold) hover:text-(--gold)"
                        } cursor-pointer`}
                      aria-label="Toggle wishlist"
                    >
                      <Heart size={20} fill={wishlisted ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={async () => {
                        const url = typeof window !== "undefined" ? window.location.href : "";
                        if (navigator?.share) {
                          try {
                            await navigator.share({ title: name, text: `Check out ${name} on Sr Software `, url });
                          } catch { /* user cancelled */ }
                        } else {
                          try {
                            await navigator.clipboard.writeText(url);
                            showToast(`Link copied: ${url}`);
                          } catch {
                            showToast("Could not copy link");
                          }
                        }
                      }}
                      className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-stone-200 bg-white text-stone-600 hover:border-(--gold) hover:text-(--gold) transition-all cursor-pointer"
                      aria-label="Share product"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={
                          star <= Math.round(rating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-stone-200 text-stone-200"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-(--text)">{rating.toFixed(1)}</span>
                  <span className="text-sm text-(--muted)">({reviews} reviews)</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-3xl font-bold text-(--text) sm:text-4xl">
                    {formatCurrency(price)}
                  </span>
                  {mrp > price && (
                    <>
                      <span className="text-xl text-stone-400 line-through">
                        {formatCurrency(mrp)}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                        {discount}% OFF
                      </span>
                    </>
                  )}
                </div>
                {mrp > price && (
                  <p className="text-sm font-medium text-emerald-700">
                    You save {formatCurrency(savings)}
                  </p>
                )}
                <p className="text-xs text-(--muted)">Inclusive of all taxes</p>
              </div>

              {/* Stock Indicator */}
              {totalStock > 0 && totalStock <= 5 ? (
                <div className="flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2.5 w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
                  </span>
                  <span className="text-sm font-semibold text-rose-700">Low stock</span>
                </div>
              ) : totalStock === 0 ? (
                <div className="flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2.5 w-fit">
                  <span className="text-sm font-semibold text-rose-700">Out of stock</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2.5 w-fit">
                  <Check size={16} className="text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">In stock</span>
                </div>
              )}

              {/* Size Selection */}
              {availableSizes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-(--text)">Select Size</p>
                    <SizeGuideModal />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => {
                      // Check if any variant with this size has stock
                      const variantForSize = product?.variants?.find((v) => v.size === size);
                      const outOfStock = variantForSize && variantForSize.stock === 0;
                      return (
                        <button
                          key={size}
                          onClick={() => !outOfStock && handleSizeSelect(size)}
                          disabled={outOfStock}
                          title={outOfStock ? "Out of stock" : ""}
                          className={`relative min-w-14 rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-all ${selectedSize === size
                              ? "border-(--gold) bg-(--gold) text-white shadow-md scale-105"
                              : outOfStock
                                ? "border-stone-200 bg-stone-50 text-stone-300 cursor-not-allowed line-through"
                                : "border-stone-200 bg-white text-(--text) hover:border-(--gold) hover:scale-105"
                            } cursor-not-allowed`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Standard Size Indication for Saree / No Variants */}
              {availableSizes.length === 0 && (product?.productDetail?.category?.name?.toLowerCase().includes("saree") || product?.category?.toLowerCase().includes("saree") || product?.productDetail?.name?.toLowerCase().includes("saree")) && (
                <div className="flex items-center justify-between border-y border-stone-100 py-4">
                  <div>
                    <p className="text-sm font-semibold text-(--text)">Size</p>
                    <p className="text-[13px] text-stone-500 mt-0.5">Standard Free Size</p>
                  </div>
                  <SizeGuideModal />
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-(--text)">Quantity</p>
                <div className="inline-flex items-center gap-0 rounded-full border-2 border-stone-200 bg-white overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-12 w-12 items-center justify-center text-stone-600 hover:bg-stone-50 transition-all cursor-pointer"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-14 text-center text-lg font-bold text-(--text)">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-12 w-12 items-center justify-center text-stone-600 hover:bg-stone-50 transition-all cursor-pointer"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="w-full !min-h-[52px] cursor-not-allowed"
                  disabled={addingToCart}
                >
                  {addingToCart ? "Adding..." : "Add to Bag"}
                </Button>
                <Button
                  variant="dark"
                  size="lg"
                  className="w-full !min-h-[52px] cursor-not-allowed"
                  onClick={handleBuyNow}
                  disabled={addingToCart}
                >
                  {addingToCart ? "Processing..." : "Buy Now"}
                </Button>
              </div>

              {/* Trust Features */}
              <div className="grid gap-3 pt-4 sm:grid-cols-2">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-2xl border border-stone-900/8 bg-white/70 px-4 py-3.5">
                    <feature.icon size={20} className="mt-0.5 shrink-0 text-(--gold)" />
                    <div>
                      <p className="text-sm font-semibold text-(--text)">{feature.title}</p>
                      <p className="text-xs text-(--muted)">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className="border-t border-stone-200 pt-6">
                <div className="flex gap-1 overflow-x-auto border-b border-stone-200 no-scrollbar">
                  {[
                    { id: "description", label: "Description" },
                    { id: "details", label: "Product Details" },
                    { id: "reviews", label: `Reviews${reviewStats?.totalReviews ? ` (${reviewStats.totalReviews})` : ""}` },
                    { id: "qa", label: "Questions & Answers" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative shrink-0 px-4 py-3 text-sm font-semibold transition-colors sm:px-5 ${activeTab === tab.id
                          ? "text-(--gold)"
                          : "text-(--muted) hover:text-(--text)"
                        } cursor-pointer`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--gold)"
                        />
                      )}
                    </button>
                  ))}
                </div>
                <div className="pt-6">
                  <AnimatePresence mode="wait">
                    {activeTab === "description" && (
                      <motion.div
                        key="description"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-base leading-relaxed text-(--muted)"
                      >
                        {description || "This exquisite piece is crafted with the finest materials, ensuring exceptional quality and timeless elegance. Perfect for festive occasions, weddings, and special events."}
                      </motion.div>
                    )}
                    {activeTab === "details" && (
                      <motion.div
                        key="details"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-3"
                      >
                        {[
                          { label: "Color", value: selectedVariant?.color || product?.variants?.[0]?.color || "Multicolor" },
                          { label: "Fabric", value: selectedVariant?.fabric || product?.variants?.[0]?.fabric || "Premium Silk" },
                          { label: "Design", value: selectedVariant?.design || product?.variants?.[0]?.design || "Traditional" },
                          { label: "Occasion", value: product?.productDetail?.category?.name || "Wedding, Engagement, Party" },
                        ].filter(item => item.value).map((item, idx) => (
                          <div key={idx} className="flex flex-col gap-1 border-b border-stone-100 pb-2.5 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-sm text-(--muted)">{item.label}</span>
                            <span className="text-sm font-medium text-(--text)">{item.value}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                    {activeTab === "reviews" && (
                      <motion.div
                        key="reviews"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-5"
                      >
                        {/* Section Header with Sorting */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <p className="text-lg font-semibold text-(--text)">Customer Reviews</p>
                            {reviewStats?.totalReviews > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} size={16} className={s <= Math.round(reviewStats.avgRating) ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"} />
                                  ))}
                                </div>
                                <span className="text-sm text-(--muted)">{reviewStats.avgRating.toFixed(1)} • {reviewStats.totalReviews} reviews</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Sort Dropdown */}
                            {reviewStats?.totalReviews > 0 && (
                              <select
                                value={reviewSort}
                                onChange={(e) => setReviewSort(e.target.value)}
                                className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-(--text) outline-none focus:border-(--gold) cursor-pointer"
                              >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="highest">Highest Rated</option>
                                <option value="lowest">Lowest Rated</option>
                                <option value="helpful">Most Helpful</option>
                              </select>
                            )}

                            {/* Review Button */}
                            {isLoggedIn() ? (
                              <button
                                onClick={() => setShowReviewForm((v) => !v)}
                                className="rounded-full bg-(--gold) px-4 py-1.5 text-xs font-bold text-white transition-all hover:opacity-90 cursor-pointer"
                              >
                                {showReviewForm ? "Cancel" : "Write a Review"}
                              </button>
                            ) : (
                              <button
                                onClick={() => router.push("/login")}
                                className="rounded-full border border-stone-200 px-4 py-1.5 text-xs font-semibold text-stone-500 transition-all hover:border-(--gold) hover:text-(--gold) cursor-pointer"
                              >
                                Login to Review
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Review Form */}
                        <AnimatePresence>
                          {showReviewForm && (
                            <motion.form
                              key="review-form"
                              initial={{ opacity: 0, y: -10, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: "auto" }}
                              exit={{ opacity: 0, y: -10, height: 0 }}
                              onSubmit={handleSubmitReview}
                              className="rounded-[28px] border border-stone-200 bg-white p-5 sm:p-6 space-y-4 overflow-hidden"
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-(--gold)/10 flex items-center justify-center">
                                  <Star size={16} className="text-(--gold)" />
                                </div>
                                <p className="text-base font-semibold text-(--text)">Share Your Experience</p>
                              </div>

                              {/* Star Rating */}
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-(--text)">Rating *</label>
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-1.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <button
                                        key={s}
                                        type="button"
                                        onClick={() => setReviewForm((f) => ({ ...f, rating: s }))}
                                        className="transition-all hover:scale-110 active:scale-95 cursor-pointer"
                                      >
                                        <Star
                                          size={32}
                                          className={s <= reviewForm.rating ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"}
                                        />
                                      </button>
                                    ))}
                                  </div>
                                  {reviewForm.rating > 0 && (
                                    <span className="ml-2 text-sm font-medium text-(--muted)">
                                      {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][reviewForm.rating]}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Order Selection */}
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-(--text)">Select Order *</label>
                                {userOrders.length === 0 ? (
                                  <div className="rounded-2xl bg-amber-50 px-4 py-3 flex items-start gap-2">
                                    <AlertCircle size={16} className="text-amber-600 mt-0.5" />
                                    <p className="text-xs text-amber-700 leading-relaxed">
                                      You need to have purchased this product to leave a review.
                                    </p>
                                  </div>
                                ) : (
                                  <select
                                    value={reviewForm.orderId}
                                    onChange={(e) => setReviewForm((f) => ({ ...f, orderId: e.target.value }))}
                                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-(--text) outline-none focus:border-(--gold) focus:bg-white transition-all"
                                  >
                                    <option value="">-- Select an order --</option>
                                    {userOrders.map((order) => (
                                      <option key={order._id} value={order._id}>
                                        Order #{order._id?.slice(-8).toUpperCase()} — {new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </div>

                              {/* Title */}
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-(--text)">Review Title</label>
                                <input
                                  type="text"
                                  placeholder="Summarize your experience in a few words"
                                  value={reviewForm.title}
                                  onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-(--text) outline-none focus:border-(--gold) focus:bg-white transition-all placeholder:text-stone-400"
                                />
                              </div>

                              {/* Comment */}
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-(--text)">Your Comments</label>
                                <textarea
                                  rows={4}
                                  placeholder="Tell others what you love about this product..."
                                  value={reviewForm.comment}
                                  onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                                  className="w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-(--text) outline-none focus:border-(--gold) focus:bg-white transition-all placeholder:text-stone-400"
                                />
                              </div>

                              {/* Image Upload */}
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-(--text)">Show off your drape! (Add up to 5 photos)</label>
                                <label className="flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-dashed border-stone-200 px-4 py-3.5 text-sm text-stone-500 transition-all hover:border-(--gold) hover:text-(--gold) hover:bg-(--gold)/5">
                                  <ImageIcon size={18} />
                                  <span>Click to upload your beautiful saree look</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                      const files = Array.from(e.target.files || []).slice(0, 5);
                                      setReviewForm((f) => ({ ...f, images: files }));
                                    }}
                                  />
                                </label>
                                {reviewForm.images.length > 0 && (
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {reviewForm.images.map((file, idx) => (
                                      <div key={idx} className="relative h-20 w-20 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
                                        <Image
                                          src={URL.createObjectURL(file)}
                                          alt={`Preview ${idx + 1}`}
                                          fill
                                          className="object-cover"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => setReviewForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))}
                                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white text-xs hover:bg-black/80 transition-all cursor-pointer"
                                        >
                                          <X size={12} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Error */}
                              {reviewFormError && (
                                <div className="flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3">
                                  <AlertCircle size={16} className="text-red-600 mt-0.5" />
                                  <p className="text-xs font-medium text-red-600">{reviewFormError}</p>
                                </div>
                              )}

                              {/* Submit */}
                              <button
                                type="submit"
                                disabled={submittingReview}
                                className="w-full rounded-full bg-(--gold) py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 cursor-not-allowed"
                              >
                                {submittingReview ? (
                                  <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Submitting...</span>
                                  </>
                                ) : (
                                  "Submit Review"
                                )}
                              </button>
                            </motion.form>
                          )}
                        </AnimatePresence>

                        {/* Rating Summary */}
                        {reviewStats && reviewStats.totalReviews > 0 && (
                          <div className="grid gap-5 rounded-[28px] border border-stone-200 bg-white p-5 sm:p-6 sm:grid-cols-[auto_1fr] sm:items-center">
                            <div className="flex flex-col items-center justify-center text-center sm:min-w-32">
                              <p className="text-6xl font-bold text-(--text)">{reviewStats.avgRating?.toFixed(1)}</p>
                              <div className="mt-2 flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} size={18} className={s <= Math.round(reviewStats.avgRating) ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"} />
                                ))}
                              </div>
                              <p className="mt-1 text-sm text-(--muted)">{reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? "review" : "reviews"}</p>
                            </div>
                            <div className="flex-1 space-y-2.5">
                              {[
                                { label: "5 stars", count: reviewStats.fiveStar, star: 5 },
                                { label: "4 stars", count: reviewStats.fourStar, star: 4 },
                                { label: "3 stars", count: reviewStats.threeStar, star: 3 },
                                { label: "2 stars", count: reviewStats.twoStar, star: 2 },
                                { label: "1 star", count: reviewStats.oneStar, star: 1 },
                              ].map((row) => (
                                <div key={row.label} className="flex items-center gap-3 text-xs">
                                  <span className="w-12 shrink-0 text-right text-(--muted) font-medium">{row.label}</span>
                                  <div className="flex-1 h-2.5 rounded-full bg-stone-100 overflow-hidden">
                                    <motion.div
                                      className="h-full rounded-full bg-amber-400"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${reviewStats.totalReviews > 0 ? (row.count / reviewStats.totalReviews) * 100 : 0}%` }}
                                      transition={{ duration: 0.5 }}
                                    />
                                  </div>
                                  <span className="w-8 shrink-0 text-right text-(--muted) font-semibold">{row.count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Customer Photos Gallery */}
                        {productReviews.some(r => r.images?.length > 0) && (
                          <div className="space-y-3 pt-4">
                            <p className="text-base font-semibold text-(--text)">Customer Gallery</p>
                            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                              {productReviews.flatMap(r => r.images || []).map((img, idx) => {
                                const src = img?.startsWith("blob:") ? img : resolveMediaSrc(img);
                                return (
                                  <div key={idx} className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
                                    <Image src={src} alt="Customer saree look" fill className="object-cover hover:scale-105 transition-transform duration-300" />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Review List */}
                        {reviewsLoading ? (
                          <div className="space-y-4">
                            {[1, 2].map((i) => (
                              <div key={i} className="animate-pulse rounded-[28px] border border-stone-200 bg-white p-5 sm:p-6">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-stone-200" />
                                  <div className="flex-1">
                                    <div className="h-4 w-24 rounded bg-stone-200" />
                                    <div className="mt-1 h-3 w-20 rounded bg-stone-100" />
                                  </div>
                                </div>
                                <div className="mt-4 h-3 w-full rounded bg-stone-100" />
                                <div className="mt-2 h-3 w-3/4 rounded bg-stone-100" />
                              </div>
                            ))}
                          </div>
                        ) : productReviews.length === 0 ? (
                          <div className="rounded-[28px] border border-stone-200 bg-white px-5 py-10 text-center sm:px-6 sm:py-14">
                            <div className="mx-auto h-16 w-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                              <Star size={28} className="text-stone-400" />
                            </div>
                            <p className="text-base font-semibold text-(--text) mb-1">No reviews yet</p>
                            <p className="text-sm text-(--muted)">Be the first to review this product!</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {productReviews.map((review) => (
                              <div key={review._id} className="rounded-[28px] border border-stone-200 bg-white p-5 sm:p-6 transition-all hover:border-stone-300">
                                {/* Header */}
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-center gap-3">
                                    {review.user?.profileImage ? (
                                      <div className="relative h-10 w-10 rounded-full overflow-hidden border border-stone-200">
                                        <Image
                                          src={resolveMediaSrc(review.user.profileImage)}
                                          alt={review.user.name}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-sm font-bold text-stone-500 border border-stone-200">
                                        {review.user?.name?.charAt(0)?.toUpperCase() || "U"}
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-sm font-semibold text-(--text)">{review.user?.name || "Customer"}</p>
                                      <p className="text-xs text-(--muted)">
                                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric"
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex shrink-0 items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <Star key={s} size={14} className={s <= review.rating ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"} />
                                    ))}
                                  </div>
                                </div>

                                {/* Verified badge */}
                                {review.isVerifiedPurchase && (
                                  <div className="mt-3 flex items-center gap-1.5">
                                    <CheckCircle2 size={14} className="text-emerald-600" />
                                    <span className="text-xs font-semibold text-emerald-600">Verified Purchase</span>
                                  </div>
                                )}

                                {/* Title & Comment */}
                                {review.title && (
                                  <p className="mt-3 text-sm font-semibold text-(--text) leading-relaxed">{review.title}</p>
                                )}
                                {review.comment && (
                                  <p className="mt-1.5 text-sm leading-relaxed text-(--muted)">{review.comment}</p>
                                )}

                                {/* Review Images */}
                                {review.images?.length > 0 && (
                                  <div className="mt-4 flex flex-wrap gap-2">
                                    {review.images.map((img, idx) => {
                                      // blob: URLs (optimistic local previews) can't go through next/image
                                      const src = img?.startsWith("blob:") ? img : resolveMediaSrc(img);
                                      const isBlob = img?.startsWith("blob:");
                                      return (
                                        <div key={idx} className="relative h-24 w-24 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
                                          {isBlob ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            (<img
                                              src={src}
                                              alt={`Review image ${idx + 1}`}
                                              className="h-full w-full object-cover"
                                            />)
                                          ) : (
                                            <Image
                                              src={src}
                                              alt={`Review image ${idx + 1}`}
                                              fill
                                              className="object-cover"
                                            />
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Helpful votes button */}
                                <div className="mt-4 flex items-center justify-between">
                                  <button
                                    onClick={() => handleVote(review._id)}
                                    disabled={votingId === review._id || !isLoggedIn()}
                                    className="flex items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-500 transition-all hover:border-(--gold) hover:text-(--gold) disabled:opacity-50 cursor-not-allowed"
                                  >
                                    <ThumbsUp size={14} />
                                    <span>Helpful</span>
                                    {review.helpfulVotes?.length > 0 && (
                                      <span className="ml-1 text-xs font-semibold text-(--gold)">
                                        ({review.helpfulVotes.length})
                                      </span>
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                    {activeTab === "qa" && (
                      <motion.div
                        key="qa"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <QASection productId={product._id} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="px-4 pb-16 sm:px-6 md:px-10 lg:px-14"
        >
          <div className="mx-auto max-w-[1440px]">
            <SectionHeading
              title="You May Also Like"
              subtitle="Curated pieces that complement your style"
              eyebrow="Recommended"
              className="mb-12"
            />
            <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((item, index) => (
                <ProductCard key={item._id || index} product={item} />
              ))}
            </div>
          </div>
        </motion.section>
      )}
      {/* Recently Viewed */}
      {recentlyViewedProducts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="px-4 pb-16 sm:px-6 md:px-10 lg:px-14"
        >
          <div className="mx-auto max-w-[1440px]">
            <SectionHeading
              title="Recently Viewed"
              subtitle="Products you browsed recently"
              eyebrow="Your History"
              className="mb-12"
            />
            <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {recentlyViewedProducts.map((item, index) => (
                <ProductCard key={item._id || index} product={item} />
              ))}
            </div>
          </div>
        </motion.section>
      )}
      {/* Mobile Sticky Bottom Bar */}
      <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-xl gap-2">
          <button
            onClick={handleWishlist}
            className={`flex h-14 flex-1 items-center justify-center rounded-full border-2 transition-all ${wishlisted
                ? "border-rose-500 bg-rose-50 text-rose-600"
                : "border-stone-200 hover:border-(--gold) hover:text-(--gold)"
              } cursor-pointer`}
          >
            <Heart size={20} fill={wishlisted ? "currentColor" : "none"} className="mr-1.5" />
            <span className="text-xs font-bold uppercase tracking-wide">Wishlist</span>
          </button>
          <Button
            onClick={handleAddToCart}
            className="min-w-0 flex-(2) cursor-not-allowed"
            disabled={addingToCart}
          >
            {addingToCart ? "Adding..." : "Add to Bag"}
          </Button>
        </div>
      </div>
    </div>
  );
}