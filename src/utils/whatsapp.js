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
