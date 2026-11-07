// src/lib/dpdpMasker.mjs
// Digital Personal Data Protection (DPDP) Act 2023 Compliance Utility

export function maskName(fullName) {
  if (!fullName || fullName.trim().length === 0) return '***';
  const parts = fullName.trim().split(/\s+/);
  return parts
    .map(p => {
      if (p.length <= 1) return `${p}*`;
      return `${p[0]}****`;
    })
    .join(' ');
}

export function maskPhone(phone) {
  if (!phone || phone.trim().length === 0) return '***';
  const clean = phone.trim();
  if (clean.length < 8) return '****';

  if (clean.startsWith('+91')) {
    const prefix = clean.substring(0, 7);
    const suffix = clean.substring(clean.length - 3);
    return `${prefix}****${suffix}`;
  }

  const start = clean.substring(0, 2);
  const end = clean.substring(clean.length - 3);
  return `${start}****${end}`;
}

export function maskAddress(address) {
  if (!address || address.trim().length === 0) return '***';
  const clean = address.trim();
  const commaIndex = clean.indexOf(',');
  if (commaIndex !== -1 && commaIndex < clean.length - 1) {
    return `*** ${clean.substring(commaIndex + 1).trim()}`;
  }
  return `*** ${clean.substring(Math.min(8, clean.length))}`;
}

export function sanitizeOrderPII(order, shouldMask = true) {
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
