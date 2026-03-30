export function normalizePhoneNumber(phone?: string): string {
  if (!phone) {
    throw new Error("Phone number is required");
  }

  let cleaned = phone.trim().replace(/[^\d+]/g, "");

  if (cleaned.startsWith("00")) {
    cleaned = `+${cleaned.slice(2)}`;
  }

  if (!cleaned.startsWith("+")) {
    if (cleaned.startsWith("0")) {
      cleaned = `+94${cleaned.slice(1)}`;
    } else {
      cleaned = `+${cleaned}`;
    }
  }

  if (!/^\+\d{10,15}$/.test(cleaned)) {
    throw new Error("Invalid phone number. Example: +94771234567");
  }

  return cleaned;
}