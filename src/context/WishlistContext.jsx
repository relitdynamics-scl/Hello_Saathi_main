import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PLANTS } from '../data/plants';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'hello-saathi-wishlist';

const PLANTS_BY_ID = new Map(PLANTS.map((p) => [p.id, p]));

// Same "reject, don't repair" posture as CartContext.sanitizeItems: a stale
// id from a since-removed plant, a duplicate, or a corrupted non-number
// entry is dropped silently rather than trusted.
function sanitizeIds(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const out = [];
  for (const entry of raw) {
    const id = Number(entry);
    if (!Number.isInteger(id) || !PLANTS_BY_ID.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function readStoredIds() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return sanitizeIds(JSON.parse(raw));
  } catch {
    // corrupted JSON, storage disabled, private-mode throw — start empty
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => []);
  const [hydrated, setHydrated] = useState(false);

  // Read once on mount rather than in useState's initializer — matches
  // ThemeContext/CartContext's pattern and keeps first paint pure.
  useEffect(() => {
    setIds(readStoredIds());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; // don't overwrite storage with the empty initial state
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // ignore write failures (private browsing, storage full, etc.)
    }
  }, [ids, hydrated]);

  const isWishlisted = useCallback((plantId) => ids.includes(Number(plantId)), [ids]);

  const toggleWishlist = useCallback((plantId) => {
    const id = Number(plantId);
    if (!PLANTS_BY_ID.has(id)) return; // silently refuse an id that isn't a real plant
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const removeFromWishlist = useCallback((plantId) => {
    const id = Number(plantId);
    setIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const clearWishlist = useCallback(() => setIds([]), []);

  // Joined with live catalog data every render, same reasoning as
  // CartContext.lines — a price or catalog change should never leave a
  // stale figure sitting in someone's saved wishlist.
  const lines = useMemo(() => ids.map((id) => PLANTS_BY_ID.get(id)).filter(Boolean), [ids]);

  const value = useMemo(
    () => ({
      lines,
      count: lines.length,
      isWishlisted,
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
    }),
    [lines, isWishlisted, toggleWishlist, removeFromWishlist, clearWishlist],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
