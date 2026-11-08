import React, { useState } from 'react';
import { Trash2, Plus, Minus, ArrowRight, Tag, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Sheet } from './ui/sheet';
import { Button } from './ui/button';
import { useShop } from '../context/ShopContext';
import { calculateOrderSummary } from '../lib/cart-utils';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    promoCode,
    promoError,
    applyPromoCode,
    removePromoCode,
    setIsCheckoutOpen,
  } = useShop();

  const [promoInput, setPromoInput] = useState('');

  const summary = calculateOrderSummary(cart, promoCode, 'standard');

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const ok = applyPromoCode(promoInput);
    if (ok) setPromoInput('');
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <Sheet
      open={isCartOpen}
      onOpenChange={setIsCartOpen}
      title="Shopping Bag"
      description={`${cart.reduce((a, b) => a + b.quantity, 0)} items in your bag`}
    >
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full py-16 text-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-900">Your bag is empty</h3>
            <p className="text-xs text-stone-500 max-w-xs mt-1">
              Explore our curated wardrobe essentials and discover your new favorites.
            </p>
          </div>
          <Button
            variant="default"
            onClick={() => setIsCartOpen(false)}
            className="mt-4 px-6 text-xs uppercase tracking-wider"
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-full justify-between">
          {/* Free Shipping Progress Meter */}
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 text-xs">
            {summary.isFreeShippingEligible ? (
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck className="h-4 w-4" />
                <span>You've unlocked Complimentary Standard Shipping!</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between text-stone-700">
                  <span>Add <strong className="text-rose-600 font-bold">${summary.remainingForFreeShipping.toFixed(2)}</strong> more for Free Shipping</span>
                  <span className="font-semibold">{summary.freeShippingProgress}%</span>
                </div>
                <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${summary.freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-3 rounded-2xl border border-stone-100 bg-white shadow-xs"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-24 w-20 rounded-xl object-cover bg-stone-100 shrink-0"
                />

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-stone-900 truncate">{item.name}</h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        aria-label={`Remove ${item.name} from bag`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
                      <span>Size: <strong>{item.size}</strong></span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-stone-300"
                          style={{ backgroundColor: item.colorHex }}
                        />
                        <span>{item.color}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {/* Stepper */}
                    <div className="flex items-center border border-stone-200 rounded-full overflow-hidden bg-stone-50">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="h-7 w-7 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="h-7 w-7 flex items-center justify-center text-stone-600 hover:bg-stone-200 disabled:opacity-30 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Item Price */}
                    <div className="text-right">
                      <span className="text-xs font-bold text-stone-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Checkout Section */}
          <div className="pt-4 mt-4 border-t border-stone-200 space-y-3">
            {/* Promo Code Form */}
            {!promoCode ? (
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Promo code (e.g. TRENDY10)"
                    className="w-full h-9 pl-9 pr-3 rounded-xl border border-stone-200 text-xs text-stone-900 uppercase placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
                <Button type="submit" variant="secondary" size="sm" className="px-4 text-xs">
                  Apply
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <Tag className="h-3.5 w-3.5 text-emerald-600" />
                  <span>
                    <strong>{promoCode.code}</strong> applied ({promoCode.description})
                  </span>
                </div>
                <button
                  onClick={removePromoCode}
                  className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 underline text-[11px]"
                >
                  Remove
                </button>
              </div>
            )}
            {promoError && <p className="text-[11px] text-rose-500">{promoError}</p>}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-stone-600 pt-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900">${summary.subtotal.toFixed(2)}</span>
              </div>
              {summary.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>-${summary.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Standard Shipping</span>
                <span className="font-semibold text-stone-900">
                  {summary.shipping === 0 ? (
                    <span className="text-emerald-600 uppercase text-[11px]">FREE</span>
                  ) : (
                    `$${summary.shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-semibold text-stone-900">${summary.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-900">
                <span>Estimated Total</span>
                <span>${summary.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleProceedToCheckout}
              size="lg"
              className="w-full bg-stone-900 hover:bg-black text-white text-xs uppercase tracking-wider py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span>Proceed to Secure Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="text-center">
              <span className="text-[10px] text-stone-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-stone-400" />
                <span>256-Bit SSL Encrypted & PCI-DSS Compliant</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  );
};
