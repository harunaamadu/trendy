export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'generic';

/**
 * Standard Luhn Algorithm check for card number validation
 */
export function validateLuhn(cardNumber: string): boolean {
  const sanitized = cardNumber.replace(/\D/g, '');
  if (sanitized.length < 13 || sanitized.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function detectCardBrand(cardNumber: string): CardBrand {
  const sanitized = cardNumber.replace(/\D/g, '');
  if (/^4/.test(sanitized)) return 'visa';
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/.test(sanitized)) return 'mastercard';
  if (/^3[47]/.test(sanitized)) return 'amex';
  if (/^6(011|5|4[4-9])/.test(sanitized)) return 'discover';
  return 'generic';
}

export function formatCardNumber(value: string): string {
  const sanitized = value.replace(/\D/g, '').slice(0, 16);
  const parts: string[] = [];
  for (let i = 0; i < sanitized.length; i += 4) {
    parts.push(sanitized.slice(i, i + 4));
  }
  return parts.join(' ');
}

export function formatExpiry(value: string): string {
  const sanitized = value.replace(/\D/g, '').slice(0, 4);
  if (sanitized.length >= 3) {
    return `${sanitized.slice(0, 2)}/${sanitized.slice(2, 4)}`;
  }
  return sanitized;
}

export function validateExpiryDate(expiry: string, referenceDate: Date = new Date()): boolean {
  const cleaned = expiry.trim();
  const match = cleaned.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/);
  if (!match) return false;

  const month = parseInt(match[1], 10);
  const year = 2000 + parseInt(match[2], 10);

  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1; // 1-12

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  if (year > currentYear + 20) return false;

  return true;
}

export function validateCVV(cvv: string, cardBrand: CardBrand = 'generic'): boolean {
  const cleaned = cvv.replace(/\D/g, '');
  if (cardBrand === 'amex') {
    return cleaned.length === 4;
  }
  return cleaned.length === 3 || cleaned.length === 4;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function generateTransactionId(): string {
  const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `TXN_${Date.now()}_${rand}`;
}

export function generateOrderId(): string {
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `TRND-${rand}`;
}
