import React from 'react';
import { Truck, Award, RotateCcw, ShieldCheck } from 'lucide-react';

export const PerksBar: React.FC = () => {
  const perks = [
    {
      icon: Truck,
      title: 'Free Standard Delivery',
      subtitle: 'On all orders over $75',
    },
    {
      icon: Award,
      title: 'Earn Reward Points',
      subtitle: 'With our loyalty wardrobe program',
    },
    {
      icon: RotateCcw,
      title: '30-Day Easy Exchanges',
      subtitle: 'Complimentary doorstep returns',
    },
    {
      icon: ShieldCheck,
      title: 'Encrypted Secure Checkout',
      subtitle: '256-Bit bank-grade protection',
    },
  ];

  return (
    <section className="py-12 border-t border-stone-200/60 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {perks.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div key={idx} className="flex flex-col items-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-1">
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-stone-900">{p.title}</h4>
                <p className="text-[11px] sm:text-xs text-stone-500 max-w-[180px]">{p.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
