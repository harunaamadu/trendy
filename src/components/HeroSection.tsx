import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { useShop } from '../context/ShopContext';

export const HeroSection: React.FC = () => {
  const { setActiveCategory } = useShop();

  const handleShopNow = () => {
    setActiveCategory('All');
    const el = document.getElementById('featured');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative overflow-hidden bg-[#faf7f4] py-12 lg:py-20">
      {/* Decorative background radial glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[550px] h-[550px] bg-rose-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-amber-50/70 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5 text-rose-500" />
              <span>Autumn / Winter 2026 Collection</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-stone-900 leading-[1.12]">
              Discover <br />
              <span className="font-serif italic font-normal text-stone-800">The Essence</span> <br />
              Of Minimal Style
            </h1>

            <p className="text-stone-600 text-base sm:text-lg max-w-lg font-normal leading-relaxed">
              Curated everyday garments crafted from pure Grade-A Mongolian cashmere, Normandy flax linen, and Japanese selvedge. Modern silhouettes designed for effortless living.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Button
                size="lg"
                variant="default"
                onClick={handleShopNow}
                className="group px-8 bg-black hover:bg-stone-800 text-white shadow-lg shadow-stone-900/10 cursor-pointer"
              >
                <span>SHOP NOW</span>
                <ArrowRight className="ml-2.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>

              <button
                onClick={() => {
                  setActiveCategory('Knitwear');
                  document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center text-sm font-semibold tracking-wider uppercase text-stone-700 hover:text-stone-900 px-5 py-3 rounded-full hover:bg-stone-200/50 transition-colors cursor-pointer"
              >
                Explore Knitwear
              </button>
            </div>

            {/* Micro value badges */}
            <div className="pt-6 border-t border-stone-200/80 flex items-center gap-6 text-xs text-stone-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>100% Certified Organic Fabrics</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-stone-300">•</span>
                <span>Ethically Tailored</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Product Showcase matching template's soft circular presentation */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            {/* Template soft blush background circular card */}
            <div className="relative w-full max-w-[480px] aspect-[4/5] sm:aspect-square rounded-[2.5rem] bg-gradient-to-br from-[#f8ece8] via-[#f5e4e0] to-[#ecd3cd] p-6 sm:p-8 flex items-center justify-center shadow-xl shadow-rose-950/5 overflow-hidden">
              {/* Radial backdrop highlight */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7)_0%,transparent_75%)]" />

              {/* Floating aesthetic background floral accent */}
              <div className="absolute top-4 right-4 text-rose-300/40 select-none pointer-events-none text-8xl font-serif">
                ✻
              </div>

              {/* Showcase Image container */}
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80"
                  alt="Relaxed Cashmere Crewneck"
                  className="max-h-[82%] object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-105"
                />

                {/* Floating Product Tag Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-white/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-rose-600">Featured Drop</span>
                    <h2 className="text-sm font-semibold text-stone-900">Mongolian Cashmere Crew</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-stone-400 line-through mr-1.5">$148</span>
                    <span className="text-sm font-bold text-stone-900">$118</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
