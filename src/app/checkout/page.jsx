"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Truck,
  CreditCard,
  Check,
  Lock,
  Tag,
  X,
  ChevronRight,
  Shield,
  RotateCcw,
  Sparkles,
  MapPin,
  ChevronDown,
} from "lucide-react";
import {
  getCart,
  updateCartItem,
  removeFromCart,
  placeOrder,
  addAddress,
  clearCart,
  getUserProfile,
  getAddresses,
  validatePincode,
} from "@/Api/AllApi";
import { playOrder } from "@/utils/notificationSound";
import { toast } from "@/utils/toast";
import {
  formatCurrency,
  getProductName,
  getProductImagePath,
  getProductPrice,
  resolveMediaSrc,
} from "@/lib/storefront";
import ValidatedInput from "@/components/common/ValidatedInput";
import { validateField } from "@/utils/validation";

/* ─── Constants ───────────────────────────────────────────── */
const FREE_SHIPPING_THRESHOLD = 2500;
const STANDARD_SHIPPING = 0;
const EXPRESS_SHIPPING = 99;
const GST_RATE = 0.05;

const DELIVERY_METHODS = [
  {
    id: "standard",
    name: "Standard Shipping",
    time: "5-7 Business Days",
    cost: STANDARD_SHIPPING,
  },
  {
    id: "express",
    name: "Express Shipping",
    time: "2-3 Business Days",
    cost: EXPRESS_SHIPPING,
  },
];

const PAYMENT_METHODS = [
  {
    id: "razorpay",
    name: "Razorpay",
    desc: "UPI, Cards, Wallets",
    icon: "💳",
  },
  {
    id: "upi",
    name: "UPI",
    desc: "Google Pay, PhonePe, Paytm",
    icon: "📱",
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    desc: "Visa, Mastercard, Rupay",
    icon: "💳",
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    desc: "Pay when you receive",
    icon: "💵",
  },
];

/* ─── Progress Steps ─────────────────────────────────────── */
function ProgressSteps({ currentStep }) {
  const steps = [
    { id: 1, name: "Cart", icon: ShoppingBag },
    { id: 2, name: "Shipping", icon: Truck },
    { id: 3, name: "Payment", icon: CreditCard },
  ];

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-3">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full transition-all ${
                step.id <= currentStep
                  ? "bg-emerald-600 text-white"
                  : "bg-stone-200 text-stone-400"
              }`}
            >
              {step.id < currentStep ? (
                <Check className="w-4 h-4 sm:w-[18px] sm:h-[18px]" strokeWidth={3} />
              ) : (
                <step.icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              )}
            </div>
            <span
              className={`text-[11px] sm:text-sm font-semibold whitespace-nowrap ${
                step.id <= currentStep ? "text-[#1A1A1A]" : "text-stone-400"
              }`}
            >
              {step.name}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="mx-2 sm:mx-4 h-px w-4 sm:w-12 bg-stone-200" />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Shipping form
  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [touched, setTouched] = useState({});
  
  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedAddr, setSelectedSavedAddr] = useState("");

  const showToast = (message, type = "success") => {
    if (type === "error") toast.error(message);
    else if (type === "warning") toast.warning(message);
    else toast.success(message);
  };

  // Advance currentStep based on form completion
  useEffect(() => {
    const required = ["fullName", "mobile", "addressLine1", "city", "state", "pincode"];
    const shippingFilled = required.every(f => shippingForm[f]?.trim());
    if (paymentMethod && shippingFilled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentStep(3);
    } else if (shippingFilled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentStep(2);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentStep(1);
    }
  }, [shippingForm, paymentMethod]);

  /* ─── Fetch Cart ─────────────────────────────────────────── */
  useEffect(() => {
    getCart()
      .then((data) => {
        const items = data?.items || data?.cart?.items || [];
        setCartItems(Array.isArray(items) ? items : []);
      })
      .catch(() => showToast("Could not load cart", "error"))
      .finally(() => setLoading(false));
  }, []);

  /* ─── Auto-fill from profile + saved address ─────────────── */
  useEffect(() => {
    const token = typeof window !== "undefined" && localStorage.getItem("userToken");
    if (!token) return;

    // Load profile (name, email, phone)
    getUserProfile()
      .then((data) => {
        const user = data?.user || data;
        setShippingForm((prev) => ({
          ...prev,
          fullName: prev.fullName || user?.name || "",
          email:    prev.email    || user?.email || "",
          mobile:   prev.mobile   || user?.phone || "",
        }));
      })
      .catch(() => {});

    // Load default/latest saved address
    getAddresses()
      .then((data) => {
        const addresses = data?.addresses || [];
        setSavedAddresses(addresses);
        if (!addresses.length) return;
        const addr = addresses.find((a) => a.isDefault) || addresses[0];
        // Auto-fill form with default/first address
        setSelectedSavedAddr(addr._id || addr.id || "");
        setShippingForm((prev) => ({
          ...prev,
          fullName:     prev.fullName     || addr.fullName     || "",
          mobile:       prev.mobile       || addr.phone        || "",
          addressLine1: prev.addressLine1 || addr.addressLine1 || "",
          addressLine2: prev.addressLine2 || addr.addressLine2 || "",
          city:         prev.city         || addr.city         || "",
          state:        prev.state        || addr.state        || "",
          pincode:      prev.pincode      || addr.pincode      || "",
        }));
      })
      .catch(() => {});
  }, []);

  /* ─── Pincode → Auto-fill city & state ───────────────────── */
  useEffect(() => {
    const pincode = shippingForm.pincode;
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPincodeError("");
      return;
    }

    setPincodeLoading(true);
    setPincodeError("");
    const timer = setTimeout(() => {
      validatePincode(pincode)
        .then((data) => {
          if (data?.data) {
            setShippingForm((prev) => ({
              ...prev,
              city:  data.data.city  || prev.city,
              state: data.data.state || prev.state,
            }));
            setPincodeError("");
          }
        })
        .catch(() => {
          setPincodeError("Invalid pincode");
        })
        .finally(() => setPincodeLoading(false));
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [shippingForm.pincode]);

  /* ─── Calculations ───────────────────────────────────────── */
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.subtotal || item.price * item.quantity),
    0
  );
  
  const discount = appliedCoupon?.discount || 0;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD 
    ? 0 
    : (deliveryMethod === "express" ? EXPRESS_SHIPPING : STANDARD_SHIPPING);
  const taxBase = subtotal - discount + shippingCost;
  const gst = Math.round(taxBase * GST_RATE);
  const total = subtotal - discount + shippingCost + gst;

  /* ─── Handle Quantity Change ─────────────────────────────── */
  const handleQtyChange = async (itemId, newQty) => {
    if (newQty < 1 || newQty > 10) return;
    
    const prev = cartItems;
    setCartItems((cur) =>
      cur.map((i) =>
        (i._id || i.id) === itemId
          ? { ...i, quantity: newQty, subtotal: (i.price || i.salePrice) * newQty }
          : i
      )
    );
    
    try {
      await updateCartItem(itemId, { quantity: newQty });
    } catch {
      setCartItems(prev);
      showToast("Could not update quantity", "error");
    }
  };

  /* ─── Handle Remove Item ─────────────────────────────────── */
  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
      setCartItems((cur) => cur.filter((i) => (i._id || i.id) !== itemId));
      showToast("Item removed");
    } catch {
      showToast("Could not remove item", "error");
    }
  };

  /* ─── Handle Coupon ──────────────────────────────────────── */
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const { validateCoupon } = await import("@/Api/AllApi");
      const data = await validateCoupon({ code: couponCode.trim().toUpperCase(), orderAmount: subtotal });
      if (data?.coupon) {
        setAppliedCoupon({
          code: data.coupon.code,
          discount: data.coupon.discountAmount,
        });
        showToast(`Coupon applied! ${data.coupon.type === "percentage" ? `${data.coupon.value}%` : formatCurrency(data.coupon.value)} off`);
      }
    } catch (err) {
      showToast(err?.message || "Invalid coupon code", "error");
    }
  };

  /* ─── Handle Place Order ─────────────────────────────────── */
  const handlePlaceOrder = async () => {
    // Validation
    const req = { fullName: true, mobile: true, email: true, addressLine1: true, city: true, state: true, pincode: true };
    setTouched(req);

    const isInvalid = 
      validateField("name", shippingForm.fullName) ||
      validateField("mobileNumber", shippingForm.mobile) ||
      validateField("email", shippingForm.email) ||
      validateField("addressLine1", shippingForm.addressLine1) ||
      validateField("city", shippingForm.city) ||
      validateField("state", shippingForm.state) ||
      validateField("pincode", shippingForm.pincode);

    if (isInvalid) {
      showToast("Please fix the validation errors", "error");
      return;
    }
    
    // Mobile validation
    if (!/^[6-9]\d{9}$/.test(shippingForm.mobile)) {
      showToast("Please enter a valid 10-digit mobile number starting with 6-9", "error");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingForm.email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    // Pincode validation
    if (!/^[1-9][0-9]{5}$/.test(shippingForm.pincode)) {
      showToast("Please enter a valid 6-digit pincode", "error");
      return;
    }
    
    if (!paymentMethod) {
      showToast("Please select a payment method", "error");
      return;
    }

    setPlacing(true);
    try {
      // Step 1: Save the address first
      const addressData = {
        fullName: shippingForm.fullName,
        phone: shippingForm.mobile,
        email: shippingForm.email,
        addressLine1: shippingForm.addressLine1,
        addressLine2: shippingForm.addressLine2 || '',
        city: shippingForm.city,
        state: shippingForm.state,
        pincode: shippingForm.pincode,
        country: 'India'
      };
      
      const addressResult = await addAddress(addressData);
      const addressId = addressResult.address?._id || addressResult._id;
      
      if (!addressId) {
        throw new Error("Could not save address");
      }

      // Step 2: Place order with addressId
      const orderData = {
        addressId: addressId,
        paymentMethod: paymentMethod.toUpperCase(),
        notes: '',
        shippingCost: shippingCost,
        ...(appliedCoupon?.code && { couponCode: appliedCoupon.code })
      };

      const result = await placeOrder(orderData);
      
      playOrder();
      
      const orderId = result.order?._id || result.orderId || result.id;

      if (!orderId) {
        throw new Error("Order created but ID not received");
      }

      // Step 3: Clear cart after successful order
      try {
        await clearCart();
      } catch (err) {
        console.error("Failed to clear cart:", err);
      }

      showToast("Order placed successfully!");
      
      setTimeout(() => {
        router.push(`/orders/orders-details/${orderId}`);
      }, 1500);
    } catch (error) {
      showToast(error.message || "Could not place order", "error");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 px-4 py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8 h-8 w-64 animate-pulse rounded-full bg-stone-200" />
          <div className="grid gap-8 md:grid-cols-[1fr_320px] lg:grid-cols-[1fr_400px]">
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-[20px] bg-white" />
              ))}
            </div>
            <div className="h-96 animate-pulse rounded-[20px] bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50">
              <ShoppingBag size={40} className="text-emerald-600" />
            </div>
          </div>
          <h1 className="mb-4 font-serif text-3xl font-semibold text-[#1A1A1A]">
            Your cart is empty
          </h1>
          <p className="mb-8 text-base text-stone-600">
            Add some beautiful products before checking out
          </p>
          <button
            onClick={() => router.push("/shop")}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-emerald-600 cursor-pointer"
          >
            Continue Shopping <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-24 pt-20">
      {/* Header */}
      <div className="border-b border-stone-200/50 bg-white/50 px-6 py-8 backdrop-blur-sm md:px-10">
        <div className="mx-auto max-w-[1440px]">
          <h1 className="mb-6 text-center font-serif text-3xl font-semibold tracking-tight text-[#1A1A1A] md:text-4xl">
            Checkout
          </h1>
          <ProgressSteps currentStep={currentStep} />
        </div>
      </div>
      {/* Main Content */}
      <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-10">
        <div className="grid gap-8 md:grid-cols-[1fr_320px] lg:grid-cols-[1fr_400px]">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Cart Items */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[20px] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] md:p-8"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#1A1A1A]">
                  Your Cart ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
                </h2>
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => {
                  const product = item.product || item;
                  const name = getProductName(product);
                  const image = resolveMediaSrc(getProductImagePath(product));
                  const price = item.price || getProductPrice(product);

                  return (
                    <div
                      key={item._id || item.id}
                      className="flex gap-4 rounded-xl border border-stone-100 p-4 transition-all hover:border-stone-200"
                    >
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-50">
                        {image && (
                          <Image
                            src={image}
                            alt={name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-[#1A1A1A] line-clamp-2">
                              {name}
                            </h3>
                            {item.variant && typeof item.variant === 'object' && (
                              <p className="mt-1 text-xs text-stone-500">
                                {item.variant.color} · {item.variant.size}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemove(item._id || item.id)}
                            className="text-stone-400 transition-colors hover:text-rose-500 cursor-pointer"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-full border border-stone-200 px-3 py-1">
                            <button
                              onClick={() => handleQtyChange(item._id || item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="text-stone-600 transition-colors hover:text-emerald-700 disabled:opacity-30 cursor-not-allowed"
                            >
                              −
                            </button>
                            <span className="text-sm font-semibold text-[#1A1A1A] w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQtyChange(item._id || item.id, item.quantity + 1)}
                              disabled={item.quantity >= 10}
                              className="text-stone-600 transition-colors hover:text-emerald-700 disabled:opacity-30 cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-sm font-bold text-[#1A1A1A]">
                            {formatCurrency(price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>

            {/* Shipping Information */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-[20px] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] md:p-8"
            >
              <h2 className="mb-6 text-xl font-semibold text-[#1A1A1A]">
                Shipping Information
              </h2>

              {/* ── Saved address picker ─────────────────────────────── */}
              {savedAddresses.length > 0 && (
                <div className="mb-5">
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    <MapPin size={12} />
                    Select a saved address
                  </label>
                  <div className="relative">
                    <select
                      id="saved-address-select"
                      value={selectedSavedAddr}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedSavedAddr(id);
                        if (!id) return; // "Enter manually" chosen
                        const addr = savedAddresses.find((a) => (a._id || a.id) === id);
                        if (!addr) return;
                        setShippingForm((prev) => ({
                          ...prev,
                          fullName:     addr.fullName     || prev.fullName,
                          mobile:       addr.phone        || prev.mobile,
                          addressLine1: addr.addressLine1 || "",
                          addressLine2: addr.addressLine2 || "",
                          city:         addr.city         || "",
                          state:        addr.state        || "",
                          pincode:      addr.pincode      || "",
                        }));
                        setPincodeError("");
                      }}
                      className="w-full appearance-none rounded-xl border border-emerald-600/30 bg-emerald-50/20 px-4 py-3 pr-10 text-sm text-[#1A1A1A] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="">— Enter address manually —</option>
                      {savedAddresses.map((addr) => {
                        const id = addr._id || addr.id;
                        const label = [
                          addr.fullName,
                          addr.addressLine1,
                          addr.city,
                          addr.state,
                          addr.pincode,
                        ].filter(Boolean).join(", ");
                        return (
                          <option key={id} value={id}>
                            {label}{addr.isDefault ? " ✦ Default" : ""}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-stone-400">
                    Your details below are pre-filled — edit freely.
                  </p>
                </div>
              )}

              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ValidatedInput
                    placeholder="Full Name"
                    validationType="name"
                    value={shippingForm.fullName}
                    onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                    onBlur={() => touch("fullName")}
                    touched={touched.fullName}
                  />
                  <ValidatedInput
                    type="tel"
                    placeholder="Mobile Number"
                    validationType="mobileNumber"
                    value={shippingForm.mobile}
                    onChange={(e) => setShippingForm({ ...shippingForm, mobile: e.target.value })}
                    onBlur={() => touch("mobile")}
                    touched={touched.mobile}
                  />
                </div>
                
                <ValidatedInput
                  type="email"
                  placeholder="Email Address"
                  validationType="email"
                  value={shippingForm.email}
                  onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                  onBlur={() => touch("email")}
                  touched={touched.email}
                />
                
                <ValidatedInput
                  placeholder="Address Line 1"
                  validationType="addressLine1"
                  value={shippingForm.addressLine1}
                  onChange={(e) => setShippingForm({ ...shippingForm, addressLine1: e.target.value })}
                  onBlur={() => touch("addressLine1")}
                  touched={touched.addressLine1}
                />
                
                <ValidatedInput
                  placeholder="Address Line 2 (Optional)"
                  validationType="addressLine2"
                  value={shippingForm.addressLine2}
                  onChange={(e) => setShippingForm({ ...shippingForm, addressLine2: e.target.value })}
                />
                
                <div className="grid gap-4 sm:grid-cols-3">
                  <ValidatedInput
                    placeholder="City"
                    validationType="city"
                    value={shippingForm.city}
                    onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                    onBlur={() => touch("city")}
                    touched={touched.city}
                    readOnly={pincodeLoading}
                    inputClassName={pincodeLoading ? "border-emerald-600/30 bg-emerald-50/10" : ""}
                  />
                  <ValidatedInput
                    placeholder="State"
                    validationType="state"
                    value={shippingForm.state}
                    onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                    onBlur={() => touch("state")}
                    touched={touched.state}
                    readOnly={pincodeLoading}
                    inputClassName={pincodeLoading ? "border-emerald-600/30 bg-emerald-50/10" : ""}
                  />
                  <div className="relative">
                    <ValidatedInput
                      placeholder="Pincode"
                      validationType="pincode"
                      value={shippingForm.pincode}
                      onChange={(e) => {
                        setPincodeError("");
                        setShippingForm({ ...shippingForm, pincode: e.target.value });
                      }}
                      onBlur={() => touch("pincode")}
                      touched={touched.pincode}
                      error={pincodeError || undefined}
                      inputClassName={pincodeLoading ? "border-emerald-600/30 bg-emerald-50/10" : ""}
                    />
                    <div className="pointer-events-none absolute right-12 top-[26px] -translate-y-1/2">
                      {pincodeLoading && (
                        <svg className="h-4 w-4 animate-spin text-emerald-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Delivery Method */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-[20px] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] md:p-8"
            >
              <h2 className="mb-6 text-xl font-semibold text-[#1A1A1A]">
                Delivery Method
              </h2>

              <div className="grid gap-3 sm:grid-cols-2">
                {DELIVERY_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${
                      deliveryMethod === method.id
                        ? "border-emerald-600 bg-emerald-50/10"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value={method.id}
                      checked={deliveryMethod === method.id}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="mt-0.5 h-5 w-5 accent-emerald-700"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-[#1A1A1A]">{method.name}</p>
                          <p className="text-xs text-stone-500">{method.time}</p>
                        </div>
                        <span className="text-sm font-bold text-emerald-700">
                          {method.cost === 0 ? "FREE" : `+${formatCurrency(method.cost)}`}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </motion.section>

            {/* Payment Method */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-[20px] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] md:p-8"
            >
              <h2 className="mb-6 text-xl font-semibold text-[#1A1A1A]">
                Payment Method
              </h2>

              <div className="grid gap-3 sm:grid-cols-2">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all ${
                      paymentMethod === method.id
                        ? "border-emerald-600 bg-emerald-50/10"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-0.5 h-5 w-5 accent-emerald-700"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{method.icon}</span>
                        <div>
                          <p className="font-semibold text-[#1A1A1A]">{method.name}</p>
                          <p className="text-xs text-stone-500">{method.desc}</p>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Trust Badges */}
              <div className="mt-6 grid grid-cols-3 gap-3 rounded-xl bg-stone-50 p-4">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                    <Lock size={18} className="text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium text-stone-600">Secure Payments</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                    <RotateCcw size={18} className="text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium text-stone-600">Easy Returns</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                    <Truck size={18} className="text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium text-stone-600">Free Shipping</span>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Right Column - Order Summary (Sticky) */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-[20px] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]"
            >
              <h2 className="mb-6 text-xl font-semibold text-[#1A1A1A]">
                Order Summary
              </h2>

              {/* Products */}
              <div className="mb-6 max-h-64 space-y-3 overflow-y-auto">
                {cartItems.map((item) => {
                  const product = item.product || item;
                  const name = getProductName(product);
                  const image = resolveMediaSrc(getProductImagePath(product));
                  const price = item.price || getProductPrice(product);

                  return (
                    <div key={item._id || item.id} className="flex gap-3">
                      <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-stone-50">
                        {image && (
                          <Image
                            src={image}
                            alt={name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#1A1A1A] line-clamp-2">
                          {name}
                        </p>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs text-stone-500">Qty: {item.quantity}</span>
                          <span className="text-sm font-semibold text-[#1A1A1A]">
                            {formatCurrency(price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Code */}
              <div className="mb-6 border-t border-stone-100 pt-6">
                <div className="mb-2 flex items-center gap-2">
                  <Tag size={14} className="text-emerald-700" />
                  <span className="text-sm font-semibold text-[#1A1A1A]">Promo Code</span>
                </div>

                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 rounded-full border border-stone-200 px-4 py-2 text-sm text-[#1A1A1A] placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim()}
                      className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-600 disabled:opacity-50 cursor-not-allowed"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-full bg-emerald-50 px-4 py-2">
                    <span className="text-sm font-semibold text-emerald-700">
                      {appliedCoupon.code} · {formatCurrency(appliedCoupon.discount)} off
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
              <div className="space-y-3 border-t border-stone-100 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Subtotal</span>
                  <span className="font-medium text-[#1A1A1A]">{formatCurrency(subtotal)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600">Discount</span>
                    <span className="font-semibold text-emerald-600">−{formatCurrency(discount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Shipping</span>
                  <span className="font-medium text-[#1A1A1A]">
                    {shippingCost === 0 ? "FREE" : formatCurrency(shippingCost)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">GST (5%)</span>
                  <span className="font-medium text-[#1A1A1A]">{formatCurrency(gst)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-6">
                <span className="text-base font-semibold text-[#1A1A1A]">Total</span>
                <span className="font-serif text-2xl font-bold text-[#1A1A1A]">
                  {formatCurrency(total)}
                </span>
              </div>

              {/* Free Shipping Progress */}
              {subtotal < FREE_SHIPPING_THRESHOLD && (
                <div className="mt-4 rounded-xl bg-emerald-50 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles size={14} className="text-emerald-700" />
                    <p className="text-xs font-semibold text-emerald-950">
                      Add {formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} more for FREE shipping
                    </p>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100">
                    <motion.div
                       className="h-full bg-emerald-600"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`,
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 py-4 text-sm font-bold uppercase tracking-wide text-white transition-all cursor-pointer hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
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
                    Place Order
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs text-stone-500">
                By placing your order, you agree to our{" "}
                <a href="/terms" className="text-emerald-700 hover:underline cursor-pointer">
                  Terms
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-emerald-700 hover:underline cursor-pointer">
                  Privacy Policy
                </a>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
