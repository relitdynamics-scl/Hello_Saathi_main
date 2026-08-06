import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { validateForm } from '../utils/validation';

const CustomerContext = createContext(null);
const STORAGE_KEY = 'hello-saathi-customer';
// "note" is optional and shared across three different forms (the welcome
// popup, the contact page, and the cart's own details modal) that don't all
// collect it — see the schema comment in validation.js.
const FIELDS = ['name', 'phone', 'email', 'note'];
const EMPTY = { name: '', phone: '', email: '', note: '' };

// Same "read once, guard every access" shape as ThemeContext/CartContext.
// This one holds PII (name, phone, email, note), so on top of the usual
// storage-can-throw guard, everything read back out is re-validated through
// the same schema the form used to collect it — a value that reaches this
// context without going through validateForm (a tampered localStorage entry,
// a future call site that forgets to validate) is treated as absent rather
// than trusted.
function readStoredDetails() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const { ok, value } = validateForm(parsed, FIELDS);
    // validateForm omits a key entirely when an optional field wasn't
    // provided (rather than defaulting it), and this record may also predate
    // "note" existing at all — merge over EMPTY so every caller always gets
    // all four keys rather than having to guard against `undefined`.
    return ok ? { ...EMPTY, ...value } : null;
  } catch {
    return null;
  }
}

export function CustomerProvider({ children }) {
  const [details, setDetails] = useState(null); // null = nothing saved yet
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDetails(readStoredDetails());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (details) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore write failures
    }
  }, [details, hydrated]);

  // Re-validates before saving rather than trusting the caller's word that a
  // form already checked it — the one path this can't skip. Every save fully
  // replaces the stored record (merged over EMPTY, not over the previous
  // details), matching how the underlying form always submits a complete
  // set of fields — a caller that omits "note" is saying "no note", not
  // "leave whatever was there before".
  const saveDetails = useCallback((raw) => {
    const { ok, value, errors } = validateForm(raw, FIELDS);
    if (ok) setDetails({ ...EMPTY, ...value });
    return { ok, errors };
  }, []);

  const forgetDetails = useCallback(() => setDetails(null), []);

  const value = useMemo(
    () => ({ details, hasDetails: !!details, saveDetails, forgetDetails, EMPTY }),
    [details, saveDetails, forgetDetails],
  );

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomer must be used within CustomerProvider');
  return ctx;
}
