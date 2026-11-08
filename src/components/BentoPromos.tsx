import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCategory } from '../types/ecommerce';

export const BentoPromos: React.FC = () => {
  const { setActiveCategory } = useShop();

  const handleNavigate = (cat: ProductCategory) => {
    setActiveCategory(cat);
    document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tall Promotional Banner matching template */}
        <div
          onClick={() => handleNavigate('Outerwear')}
          className="lg:col-span-4 relative group overflow-hidden rounded-3xl bg-gradient-to-b from-[#f2e9e1] via-[#ece2d8] to-[#e1d5c8] p-8 flex flex-col justify-between cursor-pointer min-h-[440px] sm:min-h-[500px] border border-stone-200/60 shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <div className="z-10 space-y-2">
            <span className="text-[11px] font-bold tracking-widest uppercase text-amber-900/80">
              UP TO 50% OFF
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-stone-900 leading-tight">
              Super Minimal <br />
              <span className="font-serif italic font-normal">Wardrobe</span>
            </h2>
            <div className="pt-2 inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-stone-900 group-hover:translate-x-1 transition-transform">
              <span>SHOP NOW</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="relative mt-6 flex-1 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=700&q=80"
              alt="Tailored Wool Overcoat"
              className="max-h-[300px] object-cover rounded-2xl shadow-xl transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Right Column: 3 Banners (2 on top, 1 wide banner on bottom) matching template */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Top Row: 2 Banners */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
            {/* Top Card 1: 10% OFF Knitwear */}
            <div
              onClick={() => handleNavigate('Knitwear')}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f8ebe7] to-[#f4ded8] p-7 flex flex-col justify-between cursor-pointer border border-rose-100/60 shadow-sm hover:shadow-md transition-all duration-300 min-h-[220px]"
            >
              <div className="z-10 space-y-1">
                <span className="text-[10px] font-bold tracking-widest uppercase text-rose-800">
                  10% OFF
                </span>
                <h3 className="text-xl sm:text-2xl font-light text-stone-900">
                  Cashmere <span className="font-serif italic font-normal">Knits</span>
                </h3>
                <div className="pt-2 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-stone-800 group-hover:text-rose-900">
                  <span>SHOP NOW</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              <div className="relative mt-3 self-end w-28 h-28 sm:w-32 sm:h-32">
                <img
                  src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=500&q=80"
                  alt="Cashmere Knit"
                  className="max-h-full max-w-full object-cover rounded-xl shadow-md transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Top Card 2: Organic Silk & Linen */}
            <div
              onClick={() => handleNavigate('Women')}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#e8f1f5] to-[#d6e7ee] p-7 flex flex-col justify-between cursor-pointer border border-sky-100/60 shadow-sm hover:shadow-md transition-all duration-300 min-h-[220px]"
            >
              <div className="z-10 space-y-1">
                <span className="text-[10px] font-bold tracking-widest uppercase text-sky-800">
                  STUDIO 2.0
                </span>
                <h3 className="text-xl sm:text-2xl font-light text-stone-900">
                  Mulberry <span className="font-serif italic font-normal">Silk</span>
                </h3>
                <div className="pt-2 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-stone-800 group-hover:text-sky-900">
                  <span>SHOP NOW</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              <div className="relative mt-3 self-end w-28 h-28 sm:w-32 sm:h-32">
                <img
                  src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=500&q=80"
                  alt="Mulberry Silk Dress"
                  className="max-h-full max-w-full object-cover rounded-xl shadow-md transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Bottom Wide Banner matching template */}
          <div
            onClick={() => handleNavigate('Outerwear')}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#e7e7e4] via-[#e2e2de] to-[#d9d9d5] p-8 flex items-center justify-between cursor-pointer border border-stone-300/40 shadow-sm hover:shadow-md transition-all duration-300 min-h-[200px]"
          >
            <div className="z-10 max-w-[65%] space-y-2">
              <span className="text-[10px] font-bold tracking-widest uppercase text-stone-600">
                TAILORING & WORKWEAR
              </span>
              <h3 className="text-2xl sm:text-3xl font-light text-stone-900">
                Modern <span className="font-serif italic font-normal">Suiting & Blazers</span>
              </h3>
              <p className="text-xs text-stone-600 max-w-sm hidden sm:block">
                Precision lines crafted for effortless everyday polish from boardroom to evening gallery.
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-stone-900">
                <span>SHOP COLLECTION</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            <div className="relative w-32 h-32 sm:w-44 sm:h-44 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80"
                alt="Modern Tailored Blazer"
                className="max-h-full max-w-full object-cover rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
