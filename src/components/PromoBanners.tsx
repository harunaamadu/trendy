import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const PromoBanners: React.FC = () => {
  const { setActiveCategory } = useShop();

  const handleCategoryNavigate = (cat: 'Women' | 'Knitwear') => {
    setActiveCategory(cat);
    document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: Soft Mint/Sage Linen Collection */}
        <div
          onClick={() => handleCategoryNavigate('Women')}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#d9ede7] to-[#e8f5f1] p-8 flex items-center justify-between cursor-pointer border border-emerald-100/60 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="z-10 max-w-[60%] space-y-2">
            <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-800">
              UP TO 30% OFF
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-stone-900 leading-tight">
              Pure Linen <br />
              <span className="font-serif italic font-normal">Essentials</span>
            </h2>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-stone-900 group-hover:text-emerald-900">
              <span>SHOP NOW</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </div>
          </div>

          <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80"
              alt="Pure Linen Trouser"
              className="max-h-full max-w-full object-cover rounded-2xl shadow-md transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Right Card: Soft Peach/Rose Knitwear Collection */}
        <div
          onClick={() => handleCategoryNavigate('Knitwear')}
          className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#fae7e0] to-[#fcf0ec] p-8 flex items-center justify-between cursor-pointer border border-rose-100/60 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="z-10 max-w-[60%] space-y-2">
            <span className="text-[11px] font-bold tracking-widest uppercase text-rose-800">
              NEW SEASON DROPS
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-stone-900 leading-tight">
              Merino & <br />
              <span className="font-serif italic font-normal">Knitwear</span>
            </h2>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-stone-900 group-hover:text-rose-900">
              <span>SHOP NOW</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </div>
          </div>

          <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80"
              alt="Soft Merino Cardigan"
              className="max-h-full max-w-full object-cover rounded-2xl shadow-md transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
