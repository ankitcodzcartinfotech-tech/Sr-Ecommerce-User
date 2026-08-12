"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  MapPin,
  CreditCard,
  Check,
  ChevronRight,
  Truck,
  Lock,
  Tag,
  X,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import {
  getCart,
  getAddresses,
  addAddress,
  updateCartItem,
  removeFromCart,
  placeOrder,
} from "@/Api/AllApi";
import {
  formatCurrency,
  getProductName,
  getProductImagePath,
  getProductPrice,
  resolveMediaSrc,
} from "@/lib/storefront";

/* ─── Constants ───────────────────────────────────────────── */
const FREE_SHIPPING_THRESHOLD = 2500;
const SHIPPING_COST = 100;
const GST_RATE = 0.05;

const PAYMENT_METHODS = [
  {
    id: "cod",
    name: "Cash on Delivery",
    desc: "Pay when you receive",
    icon: "💵",
    available: true,
  },
  {
    id: "upi",
    name: "UPI",
    desc: "PhonePe, GPay, Paytm",
    icon: "📱",
    available: true,
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    desc: "Visa, Mastercard, Rupay",
    icon: "💳",
    available: true,
  },
  {
    id: "netbanking",
    name: "Net Banking",
    desc: "All major banks",
    icon: "🏦",
    available: true,
  },
  {
    id: "wallet",
    name: "Wallets",
    desc: "Paytm, PhonePe, Amazon Pay",
    icon: "👛",
    available: true,
  },
];

/* ─── Toast Component ─────────────────────────────────────── */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-6 py-3 text-sm font-semibold shadow-xl ${
        type === "error" ? "bg-rose-600 text-white" : "bg-stone-900 text-white"
      }`}
    >
      {message}
    </motion.div>
  );
}

/* ─── Section Header ──────────────────────────────────────── */
function SectionHeader({ number, title, subtitle, completed }) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-bold transition-all ${
          completed
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-(--gold) bg-(--gold) text-white"
        }`}
      >
        {completed ? <Check size={20} /> : number}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-xl font-semibold text-(--text) md:text-2xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-(--muted)">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState(null);

  // Address form state
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    pincode: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    type: "home", // home, work, other
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  /* ─── Fetch Data ─────────────────────────────────────────── */
  useEffect(() => {
    Promise.all([getCart(), getAddresses()])
      .then(([cartData, addressData]) => {
        const items = cartData?.items || cartData?.cart?.items || [];
        setCartItems(Array.isArray(items) ? items : []);

        const addrList = addressData?.addresses || addressData || [];
        setAddresses(Array.isArray(addrList) ? addrList : []);

        // Auto-select default address
        const defaultAddr = addrList.find((a) => a.isDefault);
        if (defaultAddr) setSelectedAddress(defaultAddr._id || defaultAddr.id);
      })
      .catch(() => {
        showToast("Could not load checkout data", "error");
      })
      .finally(() => setLoading(false));
  }, []);

  /* ─── Calculations ───────────────────────────────────────── */
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.subtotal || item.price * item.quantity),
    0
  );
  const discount = appliedCoupon?.discount || 0;
  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const taxBase = subtotal - discount + shipping;
  const gst = Math.round(taxBase * GST_RATE);
  const total = subtotal - discount + shipping + gst;

  /* ─── Handle Coupon ──────────────────────────────────────── */
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    
    // Mock coupon validation
    if (couponCode.toUpperCase() === "KESHRAG10") {
      const discountAmt = Math.round(subtotal * 0.1);
      setAppliedCoupon({ code: couponCode.toUpperCase(), discount: discountAmt });
      showToast("Coupon applied! 10% off");
    } else {
      showToast("Invalid coupon code", "error");
    }
  };

  /* ─── Handle Address Submit ──────────────────────────────── */
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const newAddr = await addAddress(addressForm);
      setAddresses((prev) => [...prev, newAddr.address || newAddr]);
      setSelectedAddress(newAddr.address?._id || newAddr._id || newAddr.id);
      setShowAddressForm(false);
      setAddressForm({
        fullName: "",
        phone: "",
        pincode: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        type: "home",
      });
      showToast("Address added successfully");
    } catch (error) {
      showToast(error.message || "Could not add address", "error");
    }
  };

  /* ─── Handle Place Order ─────────────────────────────────── */
  const handlePlaceOrder = async () => {
    // Validation
    if (!selectedAddress) {
      showToast("Please select a delivery address", "error");
      return;
    }
    if (!paymentMethod) {
      showToast("Please select a payment method", "error");
      return;
    }

    setPlacing(true);
    try {
      const orderData = {
        addressId: selectedAddress,
        paymentMethod,
        couponCode: appliedCoupon?.code,
      };

      const result = await placeOrder(orderData);
      showToast("Order placed successfully!");
      
      // Redirect to order confirmation
      setTimeout(() => {
        router.push(`/orders/orders-details/${result.order?._id || result.orderId}`);
      }, 1500);
    } catch (error) {
      showToast(error.message || "Could not place order", "error");
    } finally {
      setPlacing(false);
    }
  };

  /* ─── Loading State ──────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-(--background) px-4 py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8 h-8 w-48 animate-pulse rounded-full bg-stone-200" />
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-[24px] bg-stone-100" />
              ))}
            </div>
            <div className="h-96 animate-pulse rounded-[24px] bg-stone-100" />
          </div>
        </div>
      </div>
    );
  }

  /* ─── Empty Cart ─────────────────────────────────────────── */
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-(--background) px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-(--gold-soft)">
              <ShoppingBag size={40} className="text-(--gold)" />
            </div>
          </div>
          <h1 className="mb-4 font-serif text-3xl font-semibold text-(--text)">
            Your cart is empty
          </h1>
          <p className="mb-8 text-base text-(--muted)">
            Add some beautiful sarees to your cart before checking out
          </p>
          <button
            onClick={() => router.push("/shop")}
            className="inline-flex items-center gap-2 rounded-full bg-(--gold) px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-(--text) cursor-pointer"
          >
            Continue Shopping <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--background) pb-24 pt-20">
      {/* Header */}
      <div className="border-b border-(--border) bg-(--surface) px-6 py-8 md:px-10">
        <div className="mx-auto max-w-[1440px]">
          <h1 className="font-serif text-3xl font-semibold text-(--text) md:text-4xl">
            Secure Checkout
          </h1>
          <p className="mt-2 text-sm text-(--muted)">
            Complete your purchase in just a few steps
          </p>
        </div>
      </div>
      {/* Main Content */}
      <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column: Steps */}
          <div className="space-y-8">
            
            {/* STEP 1: Order Review */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="surface-card rounded-[24px] p-6 md:p-8"
            >
              <SectionHeader
                number="1"
                title="Order Review"
                subtitle={`${cartItems.length} item${cartItems.length !== 1 ? "s" : ""} in your cart`}
              />

              <div className="mt-6 space-y-4">
                {cartItems.map((item) => {
                  const product = item.product || item;
                  const name = getProductName(product);
                  const image = resolveMediaSrc(getProductImagePath(product));
                  const price = item.price || getProductPrice(product);
                  const subtotal = item.subtotal || price * item.quantity;

                  return (
                    <div
                      key={item._id || item.id}
                      className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4"
                    >
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                        {image && (
                          <Image
                            src={image}
                            alt={name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-(--text) line-clamp-2">
                          {name}
                        </h3>
                        {item.variant && (
                          <p className="mt-1 text-xs text-(--muted)">
                            {item.variant.color} · {item.variant.size}
                          </p>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-(--muted)">
                            Qty: {item.quantity}
                          </span>
                          <span className="text-sm font-bold text-(--text)">
                            {formatCurrency(subtotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>

            {/* STEP 2: Shipping Address */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="surface-card rounded-[24px] p-6 md:p-8"
            >
              <SectionHeader
                number="2"
                title="Delivery Address"
                subtitle="Where should we deliver your order?"
                completed={!!selectedAddress}
              />

              <div className="mt-6 space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr._id || addr.id}
                    className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${
                      selectedAddress === (addr._id || addr.id)
                        ? "border-(--gold) bg-(--gold-soft)"
                        : "border-stone-200 bg-white hover:border-stone-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress === (addr._id || addr.id)}
                      onChange={() => setSelectedAddress(addr._id || addr.id)}
                      className="mt-1 h-4 w-4 accent-(--gold)"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-(--text)">
                            {addr.fullName || addr.name}
                          </p>
                          <p className="text-sm text-(--muted)">
                            {addr.phone || addr.mobile}
                          </p>
                        </div>
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                          {addr.type || "Home"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-(--muted)">
                        {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  </label>
                ))}

                {/* Add New Address Button */}
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm font-semibold text-stone-600 transition-all hover:border-(--gold) hover:text-(--gold) cursor-pointer"
                  >
                    <Plus size={18} />
                    Add New Address
                  </button>
                )}

                {/* Address Form */}
                <AnimatePresence>
                  {showAddressForm && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleAddressSubmit}
                      className="overflow-hidden rounded-xl border-2 border-(--gold)/30 bg-white p-6"
                    >
                      <h3 className="mb-4 font-semibold text-(--text)">
                        Add New Address
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Full Name *"
                          value={addressForm.fullName}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, fullName: e.target.value })
                          }
                          required
                          className="rounded-lg border border-stone-200 px-4 py-3 text-sm focus:border-(--gold) focus:outline-none"
                        />
                        <input
                          type="tel"
                          placeholder="Phone Number *"
                          value={addressForm.phone}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, phone: e.target.value })
                          }
                          required
                          className="rounded-lg border border-stone-200 px-4 py-3 text-sm focus:border-(--gold) focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Pincode *"
                          value={addressForm.pincode}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, pincode: e.target.value })
                          }
                          required
                          maxLength={6}
                          className="rounded-lg border border-stone-200 px-4 py-3 text-sm focus:border-(--gold) focus:outline-none sm:col-span-2"
                        />
                        <input
                          type="text"
                          placeholder="Address Line 1 *"
                          value={addressForm.addressLine1}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, addressLine1: e.target.value })
                          }
                          required
                          className="rounded-lg border border-stone-200 px-4 py-3 text-sm focus:border-(--gold) focus:outline-none sm:col-span-2"
                        />
                        <input
                          type="text"
                          placeholder="Address Line 2 (Optional)"
                          value={addressForm.addressLine2}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, addressLine2: e.target.value })
                          }
                          className="rounded-lg border border-stone-200 px-4 py-3 text-sm focus:border-(--gold) focus:outline-none sm:col-span-2"
                        />
                        <input
                          type="text"
                          placeholder="City *"
                          value={addressForm.city}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, city: e.target.value })
                          }
                          required
                          className="rounded-lg border border-stone-200 px-4 py-3 text-sm focus:border-(--gold) focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="State *"
                          value={addressForm.state}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, state: e.target.value })
                          }
                          required
                          className="rounded-lg border border-stone-200 px-4 py-3 text-sm focus:border-(--gold) focus:outline-none"
                        />
                        <select
                          value={addressForm.type}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, type: e.target.value })
                          }
                          className="rounded-lg border border-stone-200 px-4 py-3 text-sm focus:border-(--gold) focus:outline-none sm:col-span-2"
                        >
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 rounded-full bg-(--gold) py-3 text-sm font-bold text-white hover:bg-(--text) cursor-pointer"
                        >
                          Save Address
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="rounded-full border-2 border-stone-200 px-6 py-3 text-sm font-bold text-stone-600 hover:border-stone-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>

            {/* STEP 3: Payment Method */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="surface-card rounded-[24px] p-6 md:p-8"
            >
              <SectionHeader
                number="3"
                title="Payment Method"
                subtitle="Choose how you'd like to pay"
                completed={!!paymentMethod}
              />

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${
                      paymentMethod === method.id
                        ? "border-(--gold) bg-(--gold-soft)"
                        : "border-stone-200 bg-white hover:border-stone-300"
                    } ${!method.available ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      disabled={!method.available}
                      className="mt-1 h-4 w-4 accent-(--gold)"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <p className="font-semibold text-(--text)">
                            {method.name}
                          </p>
                          <p className="text-xs text-(--muted)">{method.desc}</p>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Payment Security Message */}
              <div className="mt-6 flex items-start gap-3 rounded-xl bg-emerald-50 p-4">
                <Lock size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    100% Secure Payment
                  </p>
                  <p className="text-xs text-emerald-700">
                    Your payment information is encrypted and secure
                  </p>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="surface-card rounded-[24px] p-6"
            >
              <h2 className="mb-6 font-serif text-xl font-semibold text-(--text)">
                Order Summary
              </h2>

              {/* Coupon Code */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={16} className="text-(--gold)" />
                  <span className="text-sm font-semibold text-(--text)">
                    Have a coupon?
                  </span>
                </div>

                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 rounded-full border-2 border-stone-200 px-4 py-2.5 text-sm focus:border-(--gold) focus:outline-none"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim()}
                      className="rounded-full bg-(--gold) px-5 py-2.5 text-sm font-bold text-white hover:bg-(--text) disabled:opacity-50 cursor-not-allowed"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-full bg-emerald-50 px-4 py-2.5">
                    <span className="text-sm font-semibold text-emerald-700">
                      {appliedCoupon.code} applied · {formatCurrency(appliedCoupon.discount)} off
                    </span>
                    <button
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode("");
                      }}
                      className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-b border-stone-200 pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-(--muted)">Subtotal</span>
                  <span className="font-medium text-(--text)">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-(--muted)">Discount</span>
                    <span className="font-semibold text-emerald-600">
                      −{formatCurrency(discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-(--muted)">Shipping</span>
                  <span className="font-medium text-(--text)">
                    {shipping === 0 ? "FREE" : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-(--muted)">GST (5%)</span>
                  <span className="font-medium text-(--text)">
                    {formatCurrency(gst)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="mt-4 flex items-center justify-between">
                <span className="font-semibold text-(--text)">Total</span>
                <span className="font-serif text-2xl font-bold text-(--text)">
                  {formatCurrency(total)}
                </span>
              </div>

              {/* Free Shipping Progress */}
              {subtotal < FREE_SHIPPING_THRESHOLD && (
                <div className="mt-4 rounded-xl bg-amber-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck size={14} className="text-amber-600" />
                    <p className="text-xs font-semibold text-amber-900">
                      Add {formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} more for FREE shipping
                    </p>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-amber-200">
                    <motion.div
                      className="h-full bg-amber-600"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || !paymentMethod || placing}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-(--gold) py-4 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-(--text) disabled:cursor-not-allowed disabled:opacity-50"
              >
                {placing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Place Order Securely
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                    <Check size={18} className="text-emerald-600" />
                  </div>
                  <span className="text-[10px] font-medium text-stone-600">
                    Secure
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                    <Truck size={18} className="text-amber-600" />
                  </div>
                  <span className="text-[10px] font-medium text-stone-600">
                    Fast Delivery
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50">
                    <AlertCircle size={18} className="text-rose-600" />
                  </div>
                  <span className="text-[10px] font-medium text-stone-600">
                    Easy Returns
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
