// Formats a rupee amount the way Indian retail prices are actually written —
// digit grouping in the 2-3-2 pattern (₹1,499 not ₹1499, ₹12,499 not ₹12499).
// Intl's 'en-IN' locale already knows this grouping; this just wraps it.
const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatINR(amount) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return null;
  return INR.format(amount);
}
