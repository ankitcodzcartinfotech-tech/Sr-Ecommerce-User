/**
 * Guest Recently Viewed helper
 * Stores up to MAX_ITEMS product IDs in localStorage under STORAGE_KEY.
 * Works for both guests and logged-in users (as a local cache).
 */

const STORAGE_KEY = "keshrag_rv";
const MAX_ITEMS = 10;

/** Returns array of product ID strings (most recent first). */
export function getGuestRecentlyViewed() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Prepends a product ID to the list (deduped, capped at MAX_ITEMS).
 * @param {string} productId
 */
export function addGuestRecentlyViewed(productId) {
  if (!productId || typeof window === "undefined") return;
  try {
    const current = getGuestRecentlyViewed();
    const deduped = [productId, ...current.filter((id) => id !== productId)].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
  } catch {
    // Storage full or disabled — silently ignore
  }
}

/** Clears the guest recently viewed list (called after merge on login). */
export function clearGuestRecentlyViewed() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
