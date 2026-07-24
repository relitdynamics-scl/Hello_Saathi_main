// Hello Saathi's WhatsApp number, digits only (country code + number), no spaces or symbols.
export const WHATSAPP_NUMBER = '917503523510';

export function buildWhatsAppLink({ name, phone, message }) {
  const text = `Hi Hello Saathi, I'm ${name} (${phone}).\n\n${message}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
