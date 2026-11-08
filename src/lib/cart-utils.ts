import { CartItem, PromoCode } from '../types/ecommerce';

export const FREE_SHIPPING_THRESHOLD = 75;
export const STANDARD_SHIPPING_FEE = 8.5;
export const EXPRESS_SHIPPING_FEE = 15.0;
export const OVERNIGHT_SHIPPING_FEE = 25.0;
export const ESTIMATED_TAX_RATE = 0.08; // 8%

export const VALID_PROMO_CODES: Record<string, PromoCode> = {
  TRENDY10: {
    code: 'TRENDY10',
    discountPercent: 10,
    description: '10% off your entire order',
  },
  SAVE20: {
    code: 'SAVE20',
    discountPercent: 20,
    minSpend: 100,
    description: '20% off orders over $100',
  },
  FREESHIP: {
    code: 'FREESHIP',
    freeShipping: true,
    description: 'Complimentary standard shipping',
  },
};

export function calculateSubtotal(items: CartItem[]): number {
  return Number(items.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2));
}

export function calculateDiscount(subtotal: number, promo: PromoCode | null): number {
  if (!promo) return 0;
  if (promo.minSpend && subtotal < promo.minSpend) return 0;

  if (promo.discountPercent) {
    return Number(((subtotal * promo.discountPercent) / 100).toFixed(2));
  }
  if (promo.discountFixed) {
    return Math.min(subtotal, promo.discountFixed);
  }
  return 0;
}

export function calculateShipping(
  subtotal: number,
  method: 'standard' | 'express' | 'overnight' = 'standard',
  promo: PromoCode | null = null
): number {
  if (promo?.freeShipping && method === 'standard') {
    return 0;
  }
  if (method === 'standard') {
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  }
  if (method === 'express') {
    return EXPRESS_SHIPPING_FEE;
  }
  return OVERNIGHT_SHIPPING_FEE;
}

export function calculateTax(taxableAmount: number): number {
  return Number((Math.max(0, taxableAmount) * ESTIMATED_TAX_RATE).toFixed(2));
}

export function calculateOrderSummary(
  items: CartItem[],
  promo: PromoCode | null,
  shippingMethod: 'standard' | 'express' | 'overnight' = 'standard'
) {
  const subtotal = calculateSubtotal(items);
  const discount = calculateDiscount(subtotal, promo);
  const taxableAmount = Math.max(0, subtotal - discount);
  const shipping = items.length === 0 ? 0 : calculateShipping(subtotal, shippingMethod, promo);
  const tax = items.length === 0 ? 0 : calculateTax(taxableAmount);
  const total = items.length === 0 ? 0 : Number((taxableAmount + shipping + tax).toFixed(2));
  const remainingForFreeShipping = Math.max(0, Number((FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)));
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total,
    remainingForFreeShipping,
    freeShippingProgress,
    isFreeShippingEligible: subtotal >= FREE_SHIPPING_THRESHOLD || promo?.freeShipping === true,
  };
}
