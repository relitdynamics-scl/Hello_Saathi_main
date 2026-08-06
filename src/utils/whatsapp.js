// Hello Saathi's WhatsApp number, digits only (country code + number), no spaces or symbols.
export const WHATSAPP_NUMBER = '917503523510';

// Only ever called with values that already passed validateForm. The guard is
// here so a future caller can't build a link straight from raw form state.
export function buildWhatsAppLink({ name, phone, email, message }) {
  for (const [field, value] of Object.entries({ name, phone, message })) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`buildWhatsAppLink: "${field}" must be a validated non-empty string`);
    }
  }
  const contactLine = email ? `${phone}, ${email}` : phone;
  const text = `Hi Hello Saathi, I'm ${name} (${contactLine}).\n\n${message}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

// A one-tap "ask about this plant" link from the catalog — no form behind it,
// so there's nothing to validate beyond what the catalog itself already
// guarantees (every entry has a common name).
export function buildPlantInquiryLink({ common, price }) {
  if (typeof common !== 'string' || !common.trim()) {
    throw new Error('buildPlantInquiryLink: "common" must be a non-empty string');
  }
  const priceLine = typeof price === 'number' ? ` I saw it listed around ₹${price}.` : '';
  const text = `Hi Hello Saathi, I'm interested in the ${common}.${priceLine} Is it in stock?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/*
  Builds the WhatsApp message for a cart order: contact details + an itemized
  line per plant + a grand total.

  `lines` is expected in the shape CartContext already produces —
  [{ plant: { common, price }, qty, lineTotal }] — where plant/price/lineTotal
  were derived from the trusted PLANTS catalog by CartContext, never taken
  from anything a caller could hand-supply as a raw string. This function
  still doesn't take that on faith: every line is re-checked for a sane
  shape, and the whole batch throws rather than sending a partial or
  garbled order if any line fails.
*/
export function buildOrderWhatsAppLink({ name, phone, email, note }, lines) {
  for (const [field, value] of Object.entries({ name, phone })) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`buildOrderWhatsAppLink: "${field}" must be a validated non-empty string`);
    }
  }
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error('buildOrderWhatsAppLink: "lines" must be a non-empty array');
  }

  let grandTotal = 0;
  const itemLines = lines.map((line, i) => {
    const common = line?.plant?.common;
    const price = line?.plant?.price;
    const qty = line?.qty;
    const lineTotal = line?.lineTotal;

    if (typeof common !== 'string' || !common.trim()) {
      throw new Error(`buildOrderWhatsAppLink: line ${i} has no plant name`);
    }
    if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
      throw new Error(`buildOrderWhatsAppLink: line ${i} has an invalid price`);
    }
    if (!Number.isInteger(qty) || qty < 1) {
      throw new Error(`buildOrderWhatsAppLink: line ${i} has an invalid quantity`);
    }
    if (typeof lineTotal !== 'number' || Math.round(lineTotal) !== Math.round(price * qty)) {
      throw new Error(`buildOrderWhatsAppLink: line ${i} total does not match price × quantity`);
    }

    grandTotal += lineTotal;
    return `${i + 1}. ${common} × ${qty} — ${INR.format(lineTotal)}`;
  });

  const contactLine = email ? `${phone}, ${email}` : phone;
  // "note" is whatever was saved earlier from the welcome popup or the
  // contact page — e.g. "low-light plant for a small balcony" — and rides
  // along into the order if one was ever given. Optional: most orders won't
  // have one, since the cart's own details modal never collects it.
  const noteLine = typeof note === 'string' && note.trim() ? `Note: ${note.trim()}\n\n` : '';
  const text =
    `Hi Hello Saathi, I'm ${name} (${contactLine}).\n\n` +
    `${noteLine}I'd like to order:\n\n` +
    `${itemLines.join('\n')}\n\n` +
    `Total: ${INR.format(grandTotal)}`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
