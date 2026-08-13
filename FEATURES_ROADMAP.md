# Sr Software  User Frontend — Feature Roadmap
**Last updated:** June 2026  
**Stack:** Next.js 16, React 19, Tailwind v4, Framer Motion, Swiper, Axios  
**Backend:** Express + MongoDB (port 7410)

---

## ✅ Already Built (Current State)

### Core E-Commerce
- [x] Hero section with banner carousel (API-driven)
- [x] Product listing — shop page, collections, category pages
- [x] Product detail — gallery, variants, size selector, add to cart, wishlist
- [x] Cart page — qty update, remove, save for later, coupon, order summary
- [x] Checkout — shipping form, pincode auto-fill, delivery method, payment selection
- [x] Orders list — filter by status, progress track, stats
- [x] Order detail — timeline, price summary, cancel order
- [x] Wishlist — search, sort, move to cart
- [x] Compare — up to 3 products, attribute table

### Account
- [x] Login / Register — JWT, form validation
- [x] Profile — name, phone, avatar upload
- [x] Address management — add, edit, delete, set default
- [x] Order history tab
- [x] Recently viewed tab

### Home Sections
- [x] Trust strip (Free shipping, Handcrafted, etc.)
- [x] Shop by Occasion (category cards)
- [x] New Arrivals grid
- [x] Best Sellers Swiper carousel
- [x] Story banner
- [x] Why Sr Software  — skiper52 hover-expand strip + stats
- [x] Testimonial carousel (Swiper)
- [x] Instagram gallery section
- [x] Newsletter section

### UX / UI
- [x] Filter sidebar — sort, price range, fabric, occasion
- [x] Mobile filter bottom sheet
- [x] Product Q&A section (API wired)
- [x] Product reviews — submit with photos, upvote, stats
- [x] CartDrawer — slide-in mini cart
- [x] CompareBar — sticky bottom
- [x] Mobile sticky Add to Cart bar on product detail
- [x] Navbar — search with history, trending, suggestions, user dropdown
- [x] Recently viewed section (home + account)
- [x] Return/Exchange modal on delivered orders
- [x] Real coupon API (`POST /api/user/coupons/validate`)

---

## 🔴 Priority 1 — Missing, High Business Impact

### 1. Forgot Password / Reset Password
**Files to create:**
- `src/app/forgot-password/page.jsx`
- `src/app/reset-password/page.jsx`

**What:** Login page has a "Forgot password?" link pointing to `/forgot-password` — page doesn't exist yet. Breaks the auth flow for every returning customer who forgets their password.

**Backend needed:** `POST /api/user/forgot-password`, `POST /api/user/reset-password`

---

### 2. Google OAuth / Social Login
**Files to modify:**
- `src/app/login/page.jsx` — wire the existing Google/Apple buttons

**What:** Both social login buttons call `() => {}`. They look real but do nothing. Users who click them get no response.

**Backend needed:** `GET /api/user/auth/google` → redirect to Google, callback handler, return JWT

---

### 3. Real Pincode Delivery Checker
**File:** `src/components/product/DeliveryChecker.jsx`

**What:** Currently simulated with `setTimeout`. The backend already has `GET /api/user/addresses/validate-pincode/:pincode`. Wire it to show real city/state, estimated delivery date (createdAt + 5 days), and COD availability.

**Backend:** Already exists — no new endpoint needed.

---

### 4. Real Newsletter Subscription
**File:** `src/components/home/NewsletterSection.jsx`

**What:** The form simulates with `setTimeout(r, 1000)`. No email is ever saved.

**Backend needed:** `POST /api/user/newsletter/subscribe` — store email, return success

---

### 5. Notify Me (Out of Stock — Backend)
**File:** `src/components/product/NotifyMe.jsx`

**What:** Currently stores email in `localStorage` only. Loses data on device switch. No email is ever sent when stock is updated.

**Backend needed:** `POST /api/user/notify-me` — `{ productId, email }` → store in DB → trigger email when admin adds stock

---

### 6. Checkout Step Progression
**File:** `src/app/checkout/page.jsx`

**What:** `ProgressSteps` component shows steps 1–3 but `currentStep` is hardcoded at `1`. The stepper is purely decorative right now.

**Fix:** Advance `currentStep` to 2 when shipping form is valid, to 3 when payment method is selected.

**Backend:** None needed — pure frontend state.

---

### 7. Variant Image + Price Sync on Product Detail
**File:** `src/app/products/[id]/page.jsx`

**What:** Size is selectable but selecting a different size/color variant doesn't update the displayed image or price. The gallery and price stay at the first variant's data regardless of selection.

**Fix:** When user clicks a size/color button, find matching variant in `product.variants`, update `productImages` and displayed `price` state.

**Backend:** None needed.

---

## 🟡 Priority 2 — UX Gaps

### 8. Order Tracking Page
**File to create:** `src/app/orders/[id]/track/page.jsx`

**What:** Orders list has a "Track Order" button that links to `/orders/${id}` — it goes to the detail page, not a dedicated tracking page. A standalone animated tracking page with shipment milestones would be much cleaner.

**Backend:** `GET /api/user/orders/:orderId/track` already exists.

---

### 9. Recently Viewed — Guest Support
**Files:** `src/components/home/RecentlyViewedSection.jsx`, `src/app/account/page.jsx`

**What:** Section silently hides for guests (no token = empty). Store last 10 product IDs in `localStorage` for guests; merge with API data on login.

**Backend:** None needed for guest localStorage fallback.

---

### 10. Checkout — Existing Address Picker
**File:** `src/app/checkout/page.jsx`

**What:** Checkout currently always shows a fresh shipping form. If the user has saved addresses, they should see a "Select saved address" option at the top, then optionally fill a new one. The `checkout/page_old.jsx` had this flow — it was replaced but the UX gap remains.

**Backend:** `GET /api/user/addresses` already exists.

---

### 11. Quick View Modal on Product Cards
**File:** `src/components/ProductCard.jsx`

**What:** Premium fashion brands (Aza, Kalki) show a quick view modal on card hover so users can see size/price/add-to-cart without leaving the listing page. Currently the card only navigates to the full product page.

**Backend:** `GET /api/user/products/:id` already exists.

---

### 12. Breadcrumb Navigation
**Files:** `src/app/products/[id]/page.jsx`, `src/app/collections/[slug]/page.jsx`

**What:** No breadcrumb trail. Users can't tell what collection a product belongs to or navigate back without using the browser back button.

**Backend:** None needed.

---

### 13. Product Page — Saree Specifications (Dynamic)
**File:** `src/components/product/SareeSpecifications.jsx`

**What:** Specifications table currently shows hardcoded static data (Weight: 2kg, Color: Cream, Material: Premium Silk). Should pull from `product.productDetail`, `product.variants[0]` and `product.productDetail.hsnCode`.

**Backend:** Data already comes in the product API response.

---

### 14. Share Button (Product Page)
**File:** `src/app/products/[id]/page.jsx`

**What:** Share button exists and has been wired to `navigator.share` + clipboard fallback — but the toast on clipboard copy says "Link copied to clipboard!" without showing the actual URL in it. Minor polish.

---

## 🟢 Priority 3 — Nice to Have

### 15. Infinite Scroll Option for Shop
**File:** `src/app/shop/page.jsx`

**What:** Currently "Load More" button. Could add an `IntersectionObserver` sentinel at the bottom so products load automatically as user scrolls — more modern UX.

---

### 16. Size Guide — Dynamic Measurements
**File:** `src/components/product/SizeGuideModal.jsx`

**What:** Size chart is hardcoded. Could be driven by a product-level `sizeChart` field if added to the product model.

---

### 17. Loyalty / Points System
**What:** Track purchase points, show balance in account dashboard, redeem at checkout. Needs new backend model + frontend account tab.

---

### 18. Gift Wrapping Option at Checkout
**File:** `src/app/checkout/page.jsx`

**What:** Add a toggle "Add gift wrapping (+₹99)" with a gift message textarea. Adds to order notes and total. Very common in luxury fashion.

**Backend:** Add `giftWrap: Boolean` and `giftMessage: String` to UserOrder model.

---

### 19. Refer a Friend
**What:** Referral code on account page. New user uses code → both get discount. Needs backend coupon + referral tracking.

---

### 20. Product Zoom on Hover (Desktop)
**File:** `src/app/products/[id]/page.jsx`

**What:** Product gallery has a fullscreen modal but no inline zoom on hover. Premium brands show a magnified lens effect on desktop hover.

---

## 📋 Summary Table

| # | Feature | Priority | Frontend Effort | Backend Needed |
|---|---------|----------|-----------------|----------------|
| 1 | Forgot/Reset Password | 🔴 High | Medium | Yes |
| 2 | Google OAuth | 🔴 High | Medium | Yes |
| 3 | Real Pincode Delivery | 🔴 High | Low | Already exists |
| 4 | Newsletter Backend | 🔴 High | Low | Yes (simple) |
| 5 | Notify Me Backend | 🔴 High | Low | Yes (simple) |
| 6 | Checkout Step Progression | 🔴 High | Low | No |
| 7 | Variant Image/Price Sync | 🔴 High | Low | No |
| 8 | Order Tracking Page | 🟡 Medium | Medium | Already exists |
| 9 | Guest Recently Viewed | 🟡 Medium | Low | No |
| 10 | Checkout Address Picker | 🟡 Medium | Medium | Already exists |
| 11 | Quick View Modal | 🟡 Medium | Medium | Already exists |
| 12 | Breadcrumbs | 🟡 Medium | Low | No |
| 13 | Dynamic Specifications | 🟡 Medium | Low | No (data exists) |
| 14 | Share Button Polish | 🟡 Medium | Low | No |
| 15 | Infinite Scroll | 🟢 Low | Low | No |
| 16 | Dynamic Size Guide | 🟢 Low | Low | Model change |
| 17 | Loyalty Points | 🟢 Low | High | Yes |
| 18 | Gift Wrapping | 🟢 Low | Low | Minor model change |
| 19 | Refer a Friend | 🟢 Low | High | Yes |
| 20 | Product Zoom | 🟢 Low | Medium | No |

---

## 🏗 Recommended Build Order

```
Week 1: Items 6, 7, 3, 9, 12, 13   ← Zero backend, pure frontend
Week 2: Items 4, 5, 10, 8          ← Minor backend + frontend
Week 3: Items 1, 2                  ← Auth flows
Week 4: Items 11, 14, 15, 18       ← UX polish
Future: Items 17, 19               ← Business features
```

---

*This document was generated by auditing the full `Sr Software -user-main` source code as of June 2026.*
