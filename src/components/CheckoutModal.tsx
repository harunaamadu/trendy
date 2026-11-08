import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  Printer,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Dialog } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useShop } from '../context/ShopContext';
import { calculateOrderSummary } from '../lib/cart-utils';
import {
  formatCardNumber,
  formatExpiry,
  detectCardBrand,
  validateLuhn,
  validateExpiryDate,
  validateCVV,
  validateEmail,
} from '../lib/checkout-utils';
import { ShippingAddress, PaymentDetails, Order } from '../types/ecommerce';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    promoCode,
    submitCheckout,
    lastCompletedOrder,
    setLastCompletedOrder,
    userProfile,
    savedAddresses,
  } = useShop();

  const [step, setStep] = useState<'shipping' | 'payment' | 'processing' | 'confirmed'>('shipping');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'overnight'>('standard');

  const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];

  // Shipping Form State prefilled from user profile & saved addresses
  const [shipping, setShipping] = useState<ShippingAddress>(() => ({
    fullName: defaultAddr?.fullName || userProfile.fullName || '',
    email: userProfile.email || '',
    phone: defaultAddr?.phone || userProfile.phone || '',
    addressLine1: defaultAddr?.addressLine1 || '',
    addressLine2: defaultAddr?.addressLine2 || '',
    city: defaultAddr?.city || '',
    state: defaultAddr?.state || '',
    zipCode: defaultAddr?.zipCode || '',
    country: defaultAddr?.country || 'United States',
    shippingMethod: 'standard',
  }));

  // Payment Form State
  const [payment, setPayment] = useState<PaymentDetails>({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    billingSameAsShipping: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processingStatus, setProcessingStatus] = useState<string>('Initiating secure transaction...');
  const [apiError, setApiError] = useState<string | null>(null);

  const summary = calculateOrderSummary(cart, promoCode, shippingMethod);
  const cardBrand = detectCardBrand(payment.cardNumber);

  // Auto-fill demo details for rapid testing
  const handleAutoFillDemoShipping = () => {
    setShipping({
      fullName: 'Elena Rostova',
      email: 'elena.rostova@example.com',
      phone: '+1 (555) 234-5678',
      addressLine1: '742 Evergreen Terrace',
      addressLine2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      shippingMethod: 'standard',
    });
    setErrors({});
  };

  const handleAutoFillTestCard = () => {
    setPayment({
      cardNumber: '4532 0151 1283 0366', // Valid Luhn Visa test card
      cardholderName: 'Elena Rostova',
      expiryDate: '12/28',
      cvv: '842',
      billingSameAsShipping: true,
    });
    setErrors({});
  };

  // Step 1 validation
  const validateShipping = () => {
    const newErrors: Record<string, string> = {};
    if (!shipping.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!shipping.email.trim()) newErrors.email = 'Email address is required';
    else if (!validateEmail(shipping.email)) newErrors.email = 'Enter a valid email address';
    if (!shipping.addressLine1.trim()) newErrors.addressLine1 = 'Street address is required';
    if (!shipping.city.trim()) newErrors.city = 'City is required';
    if (!shipping.state.trim()) newErrors.state = 'State is required';
    if (!shipping.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2 validation
  const validatePayment = () => {
    const newErrors: Record<string, string> = {};
    const cleanCard = payment.cardNumber.replace(/\D/g, '');

    if (!cleanCard) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!validateLuhn(cleanCard)) {
      newErrors.cardNumber = 'Invalid card number (checksum failed)';
    }

    if (!payment.cardholderName.trim()) {
      newErrors.cardholderName = 'Name on card is required';
    }

    if (!payment.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date required (MM/YY)';
    } else if (!validateExpiryDate(payment.expiryDate)) {
      newErrors.expiryDate = 'Invalid or expired date';
    }

    if (!payment.cvv.trim()) {
      newErrors.cvv = 'CVV code required';
    } else if (!validateCVV(payment.cvv, cardBrand)) {
      newErrors.cvv = 'Invalid CVV (3-4 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShipping()) {
      setStep('payment');
    }
  };

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validatePayment()) return;

    setStep('processing');
    setProcessingStatus('Encrypting credentials and authorizing with bank gateway...');

    const result = await submitCheckout(
      { ...shipping, shippingMethod },
      payment
    );

    if (result.success && result.order) {
      setStep('confirmed');
    } else {
      setStep('payment');
      setApiError(result.error || 'Payment failed. Please check your details and try again.');
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    // Reset back to shipping for next time
    setTimeout(() => {
      setStep('shipping');
      setApiError(null);
    }, 300);
  };

  return (
    <Dialog
      open={isCheckoutOpen}
      onOpenChange={(open) => !open && handleClose()}
      maxWidth="2xl"
    >
      {/* Step 1: Shipping Address */}
      {step === 'shipping' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-xl font-bold text-stone-900 font-serif">Checkout & Delivery</h2>
              <p className="text-xs text-stone-500 mt-0.5">Step 1 of 2: Shipping Destination</p>
            </div>
            <button
              type="button"
              onClick={handleAutoFillDemoShipping}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200 transition-colors"
            >
              Fill Demo Info
            </button>
          </div>

          {/* Quick Saved Address Picker */}
          {savedAddresses.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap text-xs bg-stone-50/70 p-2.5 rounded-xl border border-stone-200/80">
              <span className="text-stone-500 font-medium text-[11px]">Use Saved Address:</span>
              {savedAddresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => {
                    setShipping((prev) => ({
                      ...prev,
                      fullName: addr.fullName,
                      addressLine1: addr.addressLine1,
                      addressLine2: addr.addressLine2 || '',
                      city: addr.city,
                      state: addr.state,
                      zipCode: addr.zipCode,
                      country: addr.country,
                      phone: addr.phone || prev.phone,
                    }));
                    setErrors({});
                  }}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all border cursor-pointer ${
                    shipping.addressLine1 === addr.addressLine1
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {addr.label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleProceedToPayment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                placeholder="Jane Doe"
                value={shipping.fullName}
                onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                error={errors.fullName}
              />
              <Input
                label="Email Address *"
                type="email"
                placeholder="jane@example.com"
                value={shipping.email}
                onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                error={errors.email}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                value={shipping.phone}
                onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
              />
              <Input
                label="Country *"
                value={shipping.country}
                disabled
                className="bg-stone-50"
              />
            </div>

            <Input
              label="Street Address *"
              placeholder="123 Minimalist Way"
              value={shipping.addressLine1}
              onChange={(e) => setShipping({ ...shipping, addressLine1: e.target.value })}
              error={errors.addressLine1}
            />

            <Input
              label="Apartment, Suite, Unit (Optional)"
              placeholder="Apt 4B"
              value={shipping.addressLine2 || ''}
              onChange={(e) => setShipping({ ...shipping, addressLine2: e.target.value })}
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="City *"
                placeholder="New York"
                value={shipping.city}
                onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                error={errors.city}
              />
              <Input
                label="State *"
                placeholder="NY"
                value={shipping.state}
                onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                error={errors.state}
              />
              <Input
                label="ZIP Code *"
                placeholder="10001"
                value={shipping.zipCode}
                onChange={(e) => setShipping({ ...shipping, zipCode: e.target.value })}
                error={errors.zipCode}
              />
            </div>

            {/* Shipping Speed Options */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Shipping Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setShippingMethod('standard')}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    shippingMethod === 'standard'
                      ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="font-semibold text-stone-900">Standard Delivery</div>
                  <div className="text-[11px] text-stone-500">3-5 business days</div>
                  <div className="mt-1 font-bold text-emerald-700">
                    {summary.shipping === 0 ? 'FREE' : '$8.50'}
                  </div>
                </div>

                <div
                  onClick={() => setShippingMethod('express')}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    shippingMethod === 'express'
                      ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="font-semibold text-stone-900">Express Courier</div>
                  <div className="text-[11px] text-stone-500">2 business days</div>
                  <div className="mt-1 font-bold text-stone-900">$15.00</div>
                </div>

                <div
                  onClick={() => setShippingMethod('overnight')}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    shippingMethod === 'overnight'
                      ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="font-semibold text-stone-900">Overnight VIP</div>
                  <div className="text-[11px] text-stone-500">Next business day</div>
                  <div className="mt-1 font-bold text-stone-900">$25.00</div>
                </div>
              </div>
            </div>

            {/* Total Preview */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-500">Total with Shipping & Tax</span>
                <div className="text-xl font-bold text-stone-900 font-serif">
                  ${summary.total.toFixed(2)}
                </div>
              </div>

              <Button
                type="submit"
                size="md"
                className="px-6 rounded-full text-xs font-semibold uppercase tracking-wider bg-stone-900 hover:bg-black text-white"
              >
                Continue to Payment →
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2: Payment Details */}
      {step === 'payment' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-xl font-bold text-stone-900 font-serif">Secure Payment</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Step 2 of 2: End-to-end encrypted card processing
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoFillTestCard}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200 transition-colors"
            >
              Fill Test Card
            </button>
          </div>

          {apiError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Interactive Credit Card Visualization */}
          <div className="relative w-full max-w-sm mx-auto aspect-[1.58/1] rounded-2xl bg-gradient-to-tr from-stone-900 via-stone-800 to-stone-950 text-white p-5 shadow-xl flex flex-col justify-between overflow-hidden">
            {/* Card holographic background glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-rose-500/20 blur-xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-rose-300" />
                <span className="text-[10px] font-mono tracking-widest text-stone-300 uppercase">
                  Trendy Secure Pay
                </span>
              </div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-200">
                {cardBrand.toUpperCase()}
              </span>
            </div>

            {/* Chip */}
            <div className="w-9 h-7 rounded-md bg-amber-200/80 border border-amber-300 shadow-inner flex items-center justify-center">
              <div className="w-5 h-4 border border-amber-600/40 rounded-xs" />
            </div>

            {/* Card Number */}
            <div className="font-mono text-lg tracking-widest text-stone-100">
              {payment.cardNumber || '•••• •••• •••• ••••'}
            </div>

            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="block text-[8px] uppercase tracking-wider text-stone-400">
                  Cardholder
                </span>
                <span className="font-medium tracking-wide uppercase truncate max-w-[160px] block">
                  {payment.cardholderName || 'YOUR NAME'}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[8px] uppercase tracking-wider text-stone-400">
                  Expires
                </span>
                <span className="font-mono font-medium">
                  {payment.expiryDate || 'MM/YY'}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handlePayNow} className="space-y-4">
            <Input
              label="Card Number *"
              placeholder="4532 0151 1283 0366"
              value={payment.cardNumber}
              onChange={(e) =>
                setPayment({ ...payment, cardNumber: formatCardNumber(e.target.value) })
              }
              error={errors.cardNumber}
              helperText="Tested with standard Visa, Mastercard, and Amex test numbers"
            />

            <Input
              label="Cardholder Name *"
              placeholder="Elena Rostova"
              value={payment.cardholderName}
              onChange={(e) => setPayment({ ...payment, cardholderName: e.target.value })}
              error={errors.cardholderName}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiration Date *"
                placeholder="12/28"
                maxLength={5}
                value={payment.expiryDate}
                onChange={(e) =>
                  setPayment({ ...payment, expiryDate: formatExpiry(e.target.value) })
                }
                error={errors.expiryDate}
              />
              <Input
                label="Security Code (CVV) *"
                placeholder="842"
                maxLength={4}
                value={payment.cvv}
                onChange={(e) => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, '') })}
                error={errors.cvv}
              />
            </div>

            {/* Trust and compliance strip */}
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-around text-[11px] text-stone-600">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>256-Bit SSL Protection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-stone-600" />
                <span>PCI-DSS Level 1</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('shipping')}
                className="text-xs font-semibold text-stone-600 hover:text-stone-900"
              >
                ← Back to Shipping
              </button>

              <Button
                type="submit"
                size="lg"
                className="px-8 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
              >
                Pay ${summary.total.toFixed(2)} Now
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: Real-Time Processing Simulation */}
      {step === 'processing' && (
        <div className="py-16 text-center space-y-6">
          <div className="relative mx-auto h-20 w-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-rose-100 border-t-rose-500 animate-spin" />
            <Lock className="h-8 w-8 text-stone-800" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-stone-900 font-serif">
              Processing Secure Payment
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {processingStatus}
            </p>
          </div>
        </div>
      )}

      {/* Step 4: Order Confirmation & Printable Invoice */}
      {step === 'confirmed' && lastCompletedOrder && (
        <div className="space-y-6 text-center sm:text-left">
          {/* Header */}
          <div className="text-center pb-4 border-b border-stone-100 space-y-2">
            <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 font-serif">
              Thank You for Your Order!
            </h2>
            <p className="text-xs text-stone-500">
              A confirmation receipt and tracking code have been dispatched to{' '}
              <strong>{lastCompletedOrder.shippingAddress.email}</strong>.
            </p>
          </div>

          {/* Key Order Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs text-stone-600">
            <div>
              <span className="block text-[10px] uppercase font-bold text-stone-400">Order ID</span>
              <span className="font-mono font-bold text-stone-900">{lastCompletedOrder.id}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-stone-400">Date</span>
              <span className="font-medium text-stone-900">
                {new Date(lastCompletedOrder.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-stone-400">Estimated Delivery</span>
              <span className="font-semibold text-emerald-700">{lastCompletedOrder.estimatedDelivery}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-stone-400">Tracking #</span>
              <span className="font-mono font-semibold text-stone-900">{lastCompletedOrder.trackingNumber}</span>
            </div>
          </div>

          {/* Itemized Receipt */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 text-left">
              Itemized Receipt
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {lastCompletedOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-stone-100 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-10 w-8 rounded-lg object-cover bg-stone-100"
                    />
                    <div className="text-left">
                      <div className="font-semibold text-stone-900">{item.name}</div>
                      <div className="text-[11px] text-stone-400">
                        Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-stone-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial summary */}
            <div className="p-3 rounded-xl bg-stone-50 space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${lastCompletedOrder.subtotal.toFixed(2)}</span>
              </div>
              {lastCompletedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-${lastCompletedOrder.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{lastCompletedOrder.shippingCost === 0 ? 'FREE' : `$${lastCompletedOrder.shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${lastCompletedOrder.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-stone-200">
                <span>Total Paid</span>
                <span>${lastCompletedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Invoice Receipt</span>
            </button>

            <Button
              onClick={handleClose}
              className="w-full sm:w-auto px-7 rounded-full text-xs uppercase tracking-wider bg-stone-900 text-white"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
};
