import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { validateForm } from '../utils/validation';

const CustomerContext = createContext(null);
const STORAGE_KEY = 'hello-saathi-customer';
const FIELDS = ['name', 'phone', 'email'];
const EMPTY = { name: '', phone: '', email: '' };

// Same "read once, guard every access" shape as ThemeContext/CartContext.
// This one holds PII (name, phone, email), so on top of the usual
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
    return ok ? value : null;
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
  // form already checked it — the one path this can't skip.
  const saveDetails = useCallback((raw) => {
    const { ok, value, errors } = validateForm(raw, FIELDS);
    if (ok) setDetails(value);
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
