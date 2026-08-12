"use client";

import { createContext, useContext, useState, useCallback } from "react";

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState([]); // max 3 products

  const addToCompare = useCallback((product) => {
    setCompareList((prev) => {
      if (prev.find((p) => (p._id || p.id) === (product._id || product.id))) return prev;
      if (prev.length >= 3) return prev; // max 3
      return [...prev, product];
    });
  }, []);

  const removeFromCompare = useCallback((productId) => {
    setCompareList((prev) => prev.filter((p) => (p._id || p.id) !== productId));
  }, []);

  const isInCompare = useCallback(
    (productId) => compareList.some((p) => (p._id || p.id) === productId),
    [compareList]
  );

  const clearCompare = useCallback(() => setCompareList([]), []);

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, isInCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used inside CompareProvider");
  return ctx;
}
