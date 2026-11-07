// src/lib/dpdpMasker.ts
// Digital Personal Data Protection (DPDP) Act 2023 Compliance Utility

export interface MaskedCustomerData {
  name: string;
  phone: string;
  address: string;
  isMasked: boolean;
}

/**
 * Masks a full customer name keeping only initials:
 * "Ananya Sharma" -> "A**** S****"
 * "Vikram" -> "V****"
 */
export function maskName(fullName: string): string {
  if (!fullName || fullName.trim().length === 0) return '***';
  const parts = fullName.trim().split(/\s+/);
  return parts
    .map(p => {
      if (p.length <= 1) return `${p}*`;
      return `${p[0]}****`;
    })
    .join(' ');
}

/**
 * Masks a phone number hiding the middle digits:
 * "+91 98450 12891" -> "+91 98****891"
 * "9845012891" -> "98****2891"
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.trim().length === 0) return '***';
  const clean = phone.trim();
  if (clean.length < 8) return '****';

  // If starts with country code like +91
  if (clean.startsWith('+91')) {
    const digits = clean.replace(/\D/g, '');
    const prefix = clean.substring(0, 7);
    const suffix = clean.substring(clean.length - 3);
    return `${prefix}****${suffix}`;
  }

  const start = clean.substring(0, 2);
  const end = clean.substring(clean.length - 3);
  return `${start}****${end}`;
}

/**
 * Masks house/street numbers and specific identifiable dwelling details,
 * retaining general city/locality for logistical routing:
 * "42, 12th Main, Indiranagar, Bengaluru 560038" -> "*** Indiranagar, Bengaluru 560038"
 */
export function maskAddress(address: string): string {
  if (!address || address.trim().length === 0) return '***';
  const clean = address.trim();
  const commaIndex = clean.indexOf(',');
  if (commaIndex !== -1 && commaIndex < clean.length - 1) {
    return `*** ${clean.substring(commaIndex + 1).trim()}`;
  }
  return `*** ${clean.substring(Math.min(8, clean.length))}`;
}

/**
 * Applies DPDP Act 2023 masking to an order object if masking is enabled.
 */
export function sanitizeOrderPII(
  order: { customerName: string; customerPhone: string; customerAddress: string },
  shouldMask: boolean = true
): MaskedCustomerData {
  if (!shouldMask) {
    return {
      name: order.customerName,
      phone: order.customerPhone,
      address: order.customerAddress,
      isMasked: false,
    };
  }

  return {
    name: maskName(order.customerName),
    phone: maskPhone(order.customerPhone),
    address: maskAddress(order.customerAddress),
    isMasked: true,
  };
}
