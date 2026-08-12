"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getCart, getWishlist } from "@/Api/AllApi";

const CartWishlistContext = createContext(null);

export function CartWishlistProvider({ children }) {
  const [cartCount,    setCartCount]    = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartItems,    setCartItems]    = useState([]);   // full item list for CartDrawer
  const [cartSubtotal, setCartSubtotal] = useState(0);   // sum of price × qty
  const [isCartOpen,   setIsCartOpen]   = useState(false);

  const isLoggedIn = () =>
    typeof window !== "undefined" && !!localStorage.getItem("userToken");

  const refreshCounts = useCallback(async () => {
    if (!isLoggedIn()) {
      setCartCount(0);
      setWishlistCount(0);
      setCartItems([]);
      setCartSubtotal(0);
      return;
    }
    try {
      const [cartData, wishlistData] = await Promise.all([
        getCart().catch(() => null),
        getWishlist().catch(() => null),
      ]);

      const items = cartData?.items || cartData?.cart?.items || [];
      const wishItems = wishlistData?.items || wishlistData?.wishlist?.items || [];

      if (Array.isArray(items)) {
        setCartItems(items);
        setCartCount(items.reduce((s, i) => s + (i.quantity || 1), 0));
        // Calculate subtotal: prefer item.subtotal, fallback to price × qty
        setCartSubtotal(
          items.reduce((s, i) => {
            const price = i.price || i.salePrice || i.variant?.salePrice || 0;
            const subtotal = i.subtotal ?? price * (i.quantity || 1);
            return s + subtotal;
          }, 0)
        );
      }

      setWishlistCount(Array.isArray(wishItems) ? wishItems.length : 0);
    } catch { /* silent */ }
  }, []);

  // Optimistic helpers (for immediate badge updates without a full API refresh)
  const incCart     = useCallback((by = 1) => setCartCount(c => Math.max(0, c + by)), []);
  const incWishlist = useCallback((by = 1) => setWishlistCount(c => Math.max(0, c + by)), []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { refreshCounts(); }, [refreshCounts]);

  return (
    <CartWishlistContext.Provider
      value={{
        cartCount,
        wishlistCount,
        cartItems,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        refreshCounts,
        incCart,
        incWishlist,
      }}
    >
      {children}
    </CartWishlistContext.Provider>
  );
}

export function useCartWishlist() {
  const ctx = useContext(CartWishlistContext);
  if (!ctx) throw new Error("useCartWishlist must be inside CartWishlistProvider");
  return ctx;
}
