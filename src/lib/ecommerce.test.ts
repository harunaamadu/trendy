import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSubtotal,
  calculateDiscount,
  calculateShipping,
  calculateTax,
  calculateOrderSummary,
  VALID_PROMO_CODES,
  FREE_SHIPPING_THRESHOLD,
} from './cart-utils';
import {
  validateLuhn,
  detectCardBrand,
  validateExpiryDate,
  validateCVV,
  validateEmail,
  formatCardNumber,
  formatExpiry,
} from './checkout-utils';
import {
  getStockStatus,
  getStockBadgeLabel,
  canAddQuantity,
  adjustInventoryAfterOrder,
} from './inventory-utils';
import { CartItem, Product } from '../types/ecommerce';

test('Cart calculations: subtotal and discounts', () => {
  const items: CartItem[] = [
    {
      id: 'p1-M-Black',
      productId: 'p1',
      name: 'Organic Cotton Tee',
      price: 45.0,
      image: '',
      size: 'M',
      color: 'Black',
      colorHex: '#000',
      quantity: 2,
      maxStock: 10,
    },
    {
      id: 'p2-S-Beige',
      productId: 'p2',
      name: 'Linen Trousers',
      price: 85.0,
      image: '',
      size: 'S',
      color: 'Beige',
      colorHex: '#d8c8b8',
      quantity: 1,
      maxStock: 5,
    },
  ];

  // Subtotal = 45*2 + 85 = 175
  const subtotal = calculateSubtotal(items);
  assert.equal(subtotal, 175.0);

  // Discount 10%
  const discount10 = calculateDiscount(subtotal, VALID_PROMO_CODES.TRENDY10);
  assert.equal(discount10, 17.5);

  // Free shipping on >= $75
  const shippingStandard = calculateShipping(subtotal, 'standard');
  assert.equal(shippingStandard, 0);

  // Under $75 standard shipping fee applied
  const underShipping = calculateShipping(50, 'standard');
  assert.equal(underShipping, 8.5);

  // Promo FREESHIP frees under $75 shipping
  const promoFreeship = calculateShipping(50, 'standard', VALID_PROMO_CODES.FREESHIP);
  assert.equal(promoFreeship, 0);

  // Tax calculation on $157.50 taxable amount (175 - 17.5) = $12.60
  const summary = calculateOrderSummary(items, VALID_PROMO_CODES.TRENDY10, 'standard');
  assert.equal(summary.subtotal, 175.0);
  assert.equal(summary.discount, 17.5);
  assert.equal(summary.shipping, 0);
  assert.equal(summary.tax, 12.6);
  assert.equal(summary.total, 170.1);
  assert.equal(summary.isFreeShippingEligible, true);
});

test('Checkout validation: Luhn algorithm, card type, expiry, and email', () => {
  // Test valid card numbers (standard test card numbers)
  assert.equal(validateLuhn('4532015112830366'), true); // Visa
  assert.equal(validateLuhn('4532 0151 1283 0366'), true); // Visa with spaces
  assert.equal(validateLuhn('5555555555554444'), true); // Mastercard test card
  assert.equal(validateLuhn('1234567812345670'), true); // Luhn check pass

  // Invalid card number (fails Luhn)
  assert.equal(validateLuhn('4532015112830367'), false);
  assert.equal(validateLuhn('1234'), false);

  // Card brand detection
  assert.equal(detectCardBrand('4242424242424242'), 'visa');
  assert.equal(detectCardBrand('5105105105105100'), 'mastercard');
  assert.equal(detectCardBrand('378282246310005'), 'amex');

  // Formatting
  assert.equal(formatCardNumber('4242424242424242'), '4242 4242 4242 4242');
  assert.equal(formatExpiry('1228'), '12/28');

  // Expiry date validation with future date
  const refDate = new Date(2026, 5, 1); // June 2026
  assert.equal(validateExpiryDate('07/26', refDate), true);
  assert.equal(validateExpiryDate('12/28', refDate), true);
  assert.equal(validateExpiryDate('04/26', refDate), false); // past
  assert.equal(validateExpiryDate('13/28', refDate), false); // invalid month
  assert.equal(validateExpiryDate('abc', refDate), false);

  // CVV validation
  assert.equal(validateCVV('123', 'visa'), true);
  assert.equal(validateCVV('1234', 'amex'), true);
  assert.equal(validateCVV('12', 'visa'), false);

  // Email validation
  assert.equal(validateEmail('customer@example.com'), true);
  assert.equal(validateEmail('invalid-email'), false);
});

test('Inventory management: stock statuses and decrementing after checkout', () => {
  assert.equal(getStockStatus(15, 5), 'in_stock');
  assert.equal(getStockStatus(4, 5), 'low_stock');
  assert.equal(getStockStatus(0, 5), 'out_of_stock');

  const badgeInStock = getStockBadgeLabel(12, 5);
  assert.equal(badgeInStock.variant, 'default');

  const badgeLow = getStockBadgeLabel(2, 5);
  assert.equal(badgeLow.label, 'Only 2 left!');
  assert.equal(badgeLow.variant, 'warning');

  const badgeOut = getStockBadgeLabel(0, 5);
  assert.equal(badgeOut.label, 'Sold Out');
  assert.equal(badgeOut.variant, 'danger');

  assert.equal(canAddQuantity(2, 1, 5), true);
  assert.equal(canAddQuantity(5, 1, 5), false);

  // Mock catalog
  const products: Product[] = [
    {
      id: 'prod-1',
      sku: 'TRN-001',
      name: 'Cashmere Ribbed Knit',
      category: 'Knitwear',
      price: 120,
      rating: 4.9,
      reviewCount: 38,
      description: '',
      details: [],
      fabric: '',
      care: '',
      sustainability: '',
      images: [],
      colors: [],
      sizes: ['S', 'M', 'L'],
      stock: 5,
      lowStockThreshold: 3,
    },
  ];

  const orderItems: CartItem[] = [
    {
      id: 'prod-1-M-Ivory',
      productId: 'prod-1',
      name: 'Cashmere Ribbed Knit',
      price: 120,
      image: '',
      size: 'M',
      color: 'Ivory',
      colorHex: '#fff',
      quantity: 2,
      maxStock: 5,
    },
  ];

  const result = adjustInventoryAfterOrder(products, orderItems);
  assert.equal(result.success, true);
  assert.equal(result.updatedProducts[0].stock, 3);

  // Over-order fails safely
  const excessOrder: CartItem[] = [
    {
      ...orderItems[0],
      quantity: 10,
    },
  ];
  const failResult = adjustInventoryAfterOrder(products, excessOrder);
  assert.equal(failResult.success, false);
});
