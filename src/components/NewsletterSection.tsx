import React, { useState } from 'react';
import { Mail, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const NewsletterSection: React.FC = () => {
  const { applyPromoCode, showToast } = useShop();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address');
      return;
    }
    setSubscribed(true);
    applyPromoCode('TRENDY10');
    showToast("Subscribed! Promo code 'TRENDY10' applied automatically.");
  };

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#fae7e2] via-[#f7ded8] to-[#edd0cb] p-8 sm:p-12 md:p-16 text-center border border-rose-100 shadow-md">
        {/* Subtle background decorative shapes */}
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/40 blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-rose-200/50 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 text-rose-800 text-[11px] font-bold tracking-widest uppercase">
            <Sparkles className="h-3 w-3 text-rose-500" />
            <span>VIP Style Club</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-stone-900 tracking-tight">
            Sign up now & <span className="font-serif italic font-normal">get 10% off</span>
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
            Subscribe to our emails (they're curated, promise) and get 10% off your first online order plus private access to seasonal drops.
          </p>

          {!subscribed ? (
            <form onSubmit={handleSubmit} className="pt-4 max-w-md mx-auto flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Your Email..."
                  required
                  className="w-full h-12 pl-11 pr-4 rounded-full bg-white border border-stone-200 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 shadow-xs"
                />
              </div>

              <button
                type="submit"
                className="h-12 px-7 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs tracking-wider uppercase transition-colors shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>SUBSCRIBE</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          ) : (
            <div className="pt-4 max-w-md mx-auto bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-rose-200 shadow-sm animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold text-sm">
                <Check className="h-4 w-4" />
                <span>You're subscribed! Use code below at checkout:</span>
              </div>
              <div className="mt-2 inline-block px-4 py-1.5 bg-rose-50 border border-dashed border-rose-300 rounded-lg text-rose-800 font-mono font-bold tracking-wider text-base">
                TRENDY10
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
