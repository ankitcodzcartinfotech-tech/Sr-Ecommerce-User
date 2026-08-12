import axios from "axios";

const isDev = process.env.NODE_ENV === 'development';
const SERVER_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || (isDev ? "http://localhost:7410" : "https://sr-ecommerce-backend.onrender.com");

export const API_BASE_URL = SERVER_API_BASE;

// ——— Image Helper ———
export const getImageSrc = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return path;
};

const publicApi = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json"
  },
});

const api = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  },
});

// Resolve base URL at request time, not at module-load time.
// Browser → relative (goes through Next.js proxy, zero CORS)
// Server  → full backend URL (no proxy available server-side)
function resolveBase(config) {
  if (!config.baseURL) {
    config.baseURL = typeof window !== "undefined" ? "" : SERVER_API_BASE;
  }
  return config;
}

publicApi.interceptors.request.use(resolveBase);

api.interceptors.request.use((config) => {
  resolveBase(config);
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("userToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const errHandler = (error) => {
  const status  = error.response?.status;
  const data    = error.response?.data;
  const message =
    data?.errors?.length
      ? data.errors.join(", ")
      : data?.message || error.message || "Request failed";

  if (status === 401 && typeof window !== "undefined") {
    const msg = (message || "").toLowerCase();
    const isTokenInvalid =
      msg.includes("token expired") ||
      msg.includes("token is not valid") ||
      (msg.includes("authorization denied") && msg.includes("user not found"));

    if (isTokenInvalid) {
      localStorage.removeItem("userToken");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
  }

  return Promise.reject(new Error(message));
};

publicApi.interceptors.response.use((r) => r.data, errHandler);
api.interceptors.response.use((r) => r.data, errHandler);

// ═══════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════

export const registerUser = (body) => publicApi.post("/api/user/register", body);
export const loginUser = (body) => publicApi.post("/api/user/login", body);
export const verifyOTP = (body) => publicApi.post("/api/user/verify-otp", body);
export const resendOTP = (body) => publicApi.post("/api/user/resend-otp", body);
export const logoutUser = () => api.post("/api/user/logout");
export const forgotPassword = (body) => publicApi.post("/api/user/forgot-password", body);
export const resetPassword = (body) => publicApi.post("/api/user/reset-password", body);
export const getUserProfile = () => api.get("/api/user/profile");
export const updateUserProfile = (formData) =>
  api.put("/api/user/profile", formData, { headers: { "Content-Type": "multipart/form-data" } });

// ═══════════════════════════════════════════════════════════
//  PRODUCTS
// ═══════════════════════════════════════════════════════════

export const getProducts = (params = {}) =>
  publicApi.get("/api/user/products", { params });

export const getProduct = (id) =>
  publicApi.get(`/api/user/products/${id}`);

export const getVariantFilters = (params = {}) =>
  publicApi.get("/api/user/products/filters", { params });

export const compareProducts = (ids = []) =>
  publicApi.get("/api/user/products/compare", { params: { ids: ids.join(",") } });

// ═══════════════════════════════════════════════════════════
//  SEARCH
// ═══════════════════════════════════════════════════════════

export const searchProducts = (query, limit = 8) =>
  publicApi.get("/api/user/products", { params: { search: query, limit } });

// ═══════════════════════════════════════════════════════════
//  SEARCH HISTORY
// ═══════════════════════════════════════════════════════════

// 🔒 Private APIs (require authentication)
export const saveSearchHistory = (query) => 
  api.post("/api/user/search-history", { query });
export const getSearchHistory = (limit = 10) => 
  api.get("/api/user/search-history", { params: { limit } });
export const clearSearchHistory = () => 
  api.delete("/api/user/search-history");
export const deleteSearchItem = (id) => 
  api.delete(`/api/user/search-history/${id}`);

// 🌍 Public APIs (no authentication required)
export const getTrendingSearches = (limit = 10) => 
  publicApi.get("/api/user/search-history/trending", { params: { limit } });
export const getSearchSuggestions = (query) => 
  publicApi.get("/api/user/search-history/suggestions", { params: { q: query } });

// ═══════════════════════════════════════════════════════════
//  CART
// ═══════════════════════════════════════════════════════════

export const getCart = () => api.get("/api/user/cart");
export const addToCart = (body) => api.post("/api/user/cart", body);
export const updateCartItem = (itemId, body) => api.put(`/api/user/cart/${itemId}`, body);
export const removeFromCart = (itemId) => api.delete(`/api/user/cart/${itemId}`);
export const clearCart = () => api.delete("/api/user/cart");

// ═══════════════════════════════════════════════════════════
//  WISHLIST
// ═══════════════════════════════════════════════════════════

export const getWishlist = () => api.get("/api/user/wishlist");
export const addToWishlist = (body) => api.post("/api/user/wishlist", body);
export const removeFromWishlist = (itemId) => api.delete(`/api/user/wishlist/${itemId}`);
export const moveToCart = (itemId, body) => api.post(`/api/user/wishlist/${itemId}/move-to-cart`, body);
export const clearWishlist = () => api.delete("/api/user/wishlist");

// ═══════════════════════════════════════════════════════════
//  ORDERS
// ═══════════════════════════════════════════════════════════

export const getOrders = () => api.get("/api/user/orders");
export const getOrder = (id) => api.get(`/api/user/orders/${id}`);
export const placeOrder = (body) => api.post("/api/user/orders", body);
export const cancelOrder = (id) => api.patch(`/api/user/orders/${id}/cancel`);
export const trackOrder = (id) => api.get(`/api/user/orders/${id}/track`);

/** Downloads invoice PDF as a file — returns a Blob. */
export const downloadInvoicePdf = async (id) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("userToken") : null;
  // Use relative URL in browser (Next.js proxy), full URL on server
  const base = typeof window !== "undefined" ? "" : SERVER_API_BASE;
  const res = await fetch(`${base}/api/user/orders/${id}/invoice`, {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  if (!res.ok) throw new Error("Could not generate invoice");
  return res.blob();
};

// ═══════════════════════════════════════════════════════════
//  ADDRESSES
// ═══════════════════════════════════════════════════════════

export const getAddresses = () => api.get("/api/user/addresses");
export const addAddress = (body) => api.post("/api/user/addresses", body);
export const updateAddress = (id, body) => api.put(`/api/user/addresses/${id}`, body);
export const deleteAddress = (id) => api.delete(`/api/user/addresses/${id}`);
export const setDefaultAddress = (id) => api.patch(`/api/user/addresses/${id}/default`);
export const validatePincode = (pincode) =>
  api.get(`/api/user/addresses/validate-pincode/${pincode}`);

// ═══════════════════════════════════════════════════════════
//  REVIEWS
// ═══════════════════════════════════════════════════════════

export const getReviews = (productId, params) =>
  publicApi.get(`/api/user/reviews/product/${productId}`, { params });
export const addReview = (body) =>
  api.post(`/api/user/reviews/add`, body, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const upvoteReview = (reviewId) =>
  api.post(`/api/user/reviews/${reviewId}/vote`, { vote: "helpful" });
export const getUserReviews = () => 
  api.get("/api/user/reviews/my-reviews");
export const updateReview = (reviewId, formData) => 
  api.put(`/api/user/reviews/${reviewId}`, formData);
export const deleteReview = (reviewId) => 
  api.delete(`/api/user/reviews/${reviewId}`);
export const getFeaturedReviews = (limit = 10) =>
  publicApi.get("/api/user/reviews/featured", { params: { limit } });

// ═══════════════════════════════════════════════════════════
//  Q&A
// ═══════════════════════════════════════════════════════════

export const getQuestions = (productId, params = {}) =>
  publicApi.get(`/api/user/products/${productId}/questions`, { params });
export const askQuestion = (productId, body) =>
  api.post(`/api/user/products/${productId}/questions`, body);
export const answerQuestion = (questionId, body) =>
  api.post(`/api/user/questions/${questionId}/answers`, body);
export const upvoteAnswer = (answerId) =>
  api.post(`/api/user/answers/${answerId}/upvote`);

// ═══════════════════════════════════════════════════════════
//  BANNERS
// ═══════════════════════════════════════════════════════════

export const getBanners = () => publicApi.get("/api/user/banners");

// ═══════════════════════════════════════════════════════════
//  CATEGORIES
// ═══════════════════════════════════════════════════════════

export const getCategories = () => publicApi.get("/api/user/categories");
export const getCategory = (id) => publicApi.get(`/api/user/categories/${id}`);

// ═══════════════════════════════════════════════════════════
//  COUPONS
// ═══════════════════════════════════════════════════════════

export const validateCoupon = (body) => publicApi.post("/api/user/coupons/validate", body);

// ═══════════════════════════════════════════════════════════
//  RECENTLY VIEWED
// ═══════════════════════════════════════════════════════════

export const getRecentlyViewed = () => api.get("/api/user/recently-viewed");
export const addRecentlyViewed = (body) => api.post("/api/user/recently-viewed", body);

// ═══════════════════════════════════════════════════════════
//  CONTACT
// ═══════════════════════════════════════════════════════════

export const submitContactForm = (body) => publicApi.post('/api/user/contact/submit', body);

// Notifications
export const getNotifications = (params) => api.get('/api/user/notifications', { params });
export const markNotificationRead = (id) => api.patch(`/api/user/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/api/user/notifications/read-all');
export const deleteNotification = (id) => api.delete(`/api/user/notifications/${id}`);
export const deleteBulkNotifications = (ids) => api.delete('/api/user/notifications/bulk', { data: { ids } });
export const registerFCMToken = (token) => api.post('/api/user/notifications/fcm/register', { token });
export const removeFCMToken = (token) => api.post('/api/user/notifications/fcm/remove', { token });
