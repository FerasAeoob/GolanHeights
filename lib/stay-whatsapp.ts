export const STAY_WHATSAPP_MESSAGE = "שלום, הגעתי אליכם דרך אתר Golan Wiki ואשמח לקבל פרטים על זמינות ואפשרויות הזמנה. תודה!";

/** Accept international numbers only; never infer WhatsApp support or a country code. */
export function normalizeWhatsAppNumber(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const input = value.trim();
  if (!/^\+?[\d\s().-]+$/.test(input)) return null;
  const compact = input.replace(/[\s().-]/g, "");
  const number = compact.startsWith("+") ? compact.slice(1) : compact.replace(/^00/, "");
  return /^[1-9]\d{7,14}$/.test(number) ? number : null;
}

export function getStayWhatsAppLink(category: string | undefined, whatsapp: string | null | undefined): string | null {
  if (category !== "stays") return null;
  const number = normalizeWhatsAppNumber(whatsapp);
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(STAY_WHATSAPP_MESSAGE)}` : null;
}
