export function extractFirstPhoneNumber(phoneText: string): string | null {
  // Extract first phone-like token, keep digits only (and optional leading +)
  const match = phoneText.match(/(\+?\d[\d\s-]{7,}\d)/);
  if (!match) return null;
  return match[1].replace(/[^\d+]/g, '');
}

export function toTelHref(phoneText: string): string | null {
  const phone = extractFirstPhoneNumber(phoneText);
  if (!phone) return null;
  return `tel:${phone}`;
}

export function toWhatsAppHref(phoneText: string, message: string): string | null {
  const phone = extractFirstPhoneNumber(phoneText);
  if (!phone) return null;
  const wa = phone.replace(/^\+/, '').replace(/\D/g, '');
  if (!wa) return null;
  return `https://wa.me/${wa}?text=${encodeURIComponent(message)}`;
}



