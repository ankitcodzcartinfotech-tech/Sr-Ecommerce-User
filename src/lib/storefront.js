import { getImageSrc } from "@/Api/AllApi";

export function slugify(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function titleFromSlug(slug = "") {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatCurrency(value) {
  const amount = Number(value || 0);
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

function getSeed(product = {}, index = 0) {
  const source =
    product._id ||
    product.slug ||
    product.productDetail?.name ||
    product.name ||
    `product-${index}`;

  return source.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

export function getProductName(product = {}) {
  return product.productDetail?.name || product.name || "Handcrafted Saree";
}

export function getProductCategory(product = {}) {
  return (
    product.productDetail?.category?.name ||
    product.category ||
    "Signature Collection"
  );
}

export function getProductDescription(product = {}) {
  return (
    product.productDetail?.description ||
    product.description ||
    "A drape designed for celebrations, heirloom moments, and effortless elegance."
  );
}

export function getProductImagePath(product = {}) {
  const primaryVariant = product.variants?.find(
    (variant) => Array.isArray(variant.images) && variant.images.length > 0,
  );

  const productDetailImage = 
    (Array.isArray(product.productDetail?.images) && product.productDetail.images.length > 0)
      ? product.productDetail.images[0]
      : product.productDetail?.image;

  return (
    primaryVariant?.images?.[0] ||
    productDetailImage ||
    product.image ||
    null
  );
}

export function getProductPrice(product = {}) {
  const primaryVariant = product.variants?.find(
    (variant) => variant.salePrice || variant.mrp,
  );

  return (
    primaryVariant?.salePrice ||
    primaryVariant?.mrp ||
    product.saleDetails?.salePrice ||
    product.price ||
    0
  );
}

export function getProductMrp(product = {}) {
  const primaryVariant = product.variants?.find(
    (variant) => variant.mrp || variant.salePrice,
  );

  if (primaryVariant?.mrp) {
    return primaryVariant.mrp;
  }

  if (product.mrp) {
    return product.mrp;
  }

  const price = getProductPrice(product);
  const discount = Number(product.saleDetails?.discount || 0);

  if (discount > 0 && discount < 100) {
    return Math.round(price / (1 - discount / 100));
  }

  return price ? Math.round(price * 1.18) : 0;
}

export function getProductMetrics(product = {}, index = 0) {
  const seed = getSeed(product, index);

  return {
    rating: product.rating || (seed % 4 === 0 ? 5 : 4),
    reviews: product.reviews || 28 + (seed % 137),
  };
}

export function getProductBadge(product = {}) {
  if (product.tag) {
    return product.tag;
  }

  if (product.isNew) {
    return "New";
  }

  const price = getProductPrice(product);
  const mrp = getProductMrp(product);

  if (mrp > price && price > 0) {
    return `${Math.round(((mrp - price) / mrp) * 100)}% Off`;
  }

  return "";
}

export function getProductHref(product = {}) {
  const identifier = product.slug || slugify(getProductName(product)) || product._id;
  return `/products/${identifier}`;
}

export function getCategoryHref(category = {}) {
  return `/collections/${slugify(category.slug || category.name || "featured")}`;
}

export function normalizeBannerList(payload) {
  const list = payload?.data || payload?.banners || payload || [];
  return Array.isArray(list) 
    ? list.filter(Boolean).map(banner => ({
        ...banner,
        // Backward compatibility: ensure image (legacy) is available as desktopImage and vice versa
        desktopImage: banner.desktopImage || banner.image,
        mobileImage: banner.mobileImage || null,
        image: banner.desktopImage || banner.image, // keep legacy image field
        // Map subtitle to description for HeroSection compatibility
        description: banner.description || banner.subtitle
      }))
    : [];
}

export function normalizeProductList(payload) {
  if (Array.isArray(payload)) {
    // Remove duplicates from array
    const seen = new Set();
    return payload.filter(item => {
      const id = item._id || item.id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }

  const list = payload?.products || payload?.data?.products || payload?.data || [];
  // Remove duplicates
  const seen = new Set();
  return list.filter(item => {
    const id = item._id || item.id;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function normalizeCategoryList(payload) {
  if (Array.isArray(payload)) {
    return payload.filter(Boolean);
  }

  const list = payload?.categories || payload?.data?.categories || payload?.data || [];
  return Array.isArray(list) ? list.filter(Boolean) : [];
}

export function normalizeFeaturedReviews(payload) {
  if (Array.isArray(payload)) {
    return payload.filter(Boolean);
  }

  const list = payload?.reviews || payload?.data?.reviews || payload?.data || [];
  return Array.isArray(list) ? list.filter(Boolean) : [];
}

export function mapFeaturedReviewToTestimonial(review = {}) {
  const productName =
    review.product?.productDetail?.name ||
    review.productName ||
    "Keshrag Saree";

  return {
    id: review._id,
    name: review.user?.name || "Keshrag Customer",
    location: review.location || "India",
    rating: review.rating || 5,
    product: productName,
    text: review.comment || review.title || "",
    profileImage: review.user?.profileImage || null,
    productId: review.product?._id || review.product,
    productSlug: review.product?.slug,
  };
}

export function resolveMediaSrc(src) {
  if (!src) {
    return null;
  }

  // If it's already a full URL, return it
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  // Local static paths are proxied via next.config rewrites when needed.
  if (src.startsWith("/images/")) {
    return src;
  }

  return getImageSrc(src);
}
