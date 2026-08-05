import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PLANTS } from '../data/plants';

const CartContext = createContext(null);
const STORAGE_KEY = 'hello-saathi-cart';

// Hard bounds on a single line's quantity. Not just a UX nicety — this is the
// one place raw numbers from localStorage (editable via devtools, or simply
// corrupted) reach the app, and an unclamped quantity would flow straight
// into a currency total and then into the WhatsApp message text.
const MIN_QTY = 1;
const MAX_QTY = 99;

const PLANTS_BY_ID = new Map(PLANTS.map((p) => [p.id, p]));

function clampQty(qty) {
  const n = Math.trunc(Number(qty));
  if (!Number.isFinite(n)) return MIN_QTY;
  return Math.min(MAX_QTY, Math.max(MIN_QTY, n));
}

// Reduces whatever was in storage to a list of { id, qty } where every id is
// a real catalog entry and every qty is a valid integer in range. Anything
// else — a stale id from a since-removed plant, a string where a number
// should be, a plain corrupted blob — is dropped rather than trusted.
function sanitizeItems(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const out = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const id = Number(entry.id);
    if (!Number.isInteger(id) || !PLANTS_BY_ID.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, qty: clampQty(entry.qty) });
  }
  return out;
}

function readStoredItems() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return sanitizeItems(JSON.parse(raw));
  } catch {
    // corrupted JSON, storage disabled, private-mode throw — start empty
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => []);
  const [hydrated, setHydrated] = useState(false);

  // Read once on mount rather than in useState's initializer: the initializer
  // runs during SSR-less first render too, but keeping the localStorage read
  // in an effect matches ThemeContext's pattern and keeps first paint pure.
  useEffect(() => {
    setItems(readStoredItems());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; // don't overwrite storage with the empty initial state
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore write failures (private browsing, storage full, etc.)
    }
  }, [items, hydrated]);

  const addItem = useCallback((plantId, qty = 1) => {
    const id = Number(plantId);
    if (!PLANTS_BY_ID.has(id)) return; // silently refuse an id that isn't a real plant
    const delta = clampQty(qty);
    setItems((prev) => {
      const existing = prev.find((it) => it.id === id);
      if (existing) {
        return prev.map((it) => (it.id === id ? { ...it, qty: clampQty(it.qty + delta) } : it));
      }
      return [...prev, { id, qty: delta }];
    });
  }, []);

  const setQty = useCallback((plantId, qty) => {
    const id = Number(plantId);
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty: clampQty(qty) } : it)));
  }, []);

  const removeItem = useCallback((plantId) => {
    const id = Number(plantId);
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  // Joined with live catalog data every render rather than snapshotting
  // name/price into storage — a price change on the catalog side should
  // never leave a stale figure sitting in someone's saved cart.
  const lines = useMemo(
    () =>
      items
        .map((it) => {
          const plant = PLANTS_BY_ID.get(it.id);
          if (!plant) return null; // catalog entry removed since this was added
          return { plant, qty: it.qty, lineTotal: plant.price * it.qty };
        })
        .filter(Boolean),
    [items],
  );

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.lineTotal, 0), [lines]);

  const value = useMemo(
    () => ({ lines, itemCount, subtotal, addItem, setQty, removeItem, clearCart, MIN_QTY, MAX_QTY }),
    [lines, itemCount, subtotal, addItem, setQty, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
