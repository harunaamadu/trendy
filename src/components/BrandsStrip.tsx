import React from 'react';

export const BrandsStrip: React.FC = () => {
  const brands = [
    { name: 'VOGUE', label: 'Vogue Living' },
    { name: 'ELLE', label: 'Elle Atelier' },
    { name: 'HARPERS', label: "Harper's Bazaar" },
    { name: 'GQ', label: 'GQ Style' },
    { name: 'MONOCLE', label: 'Monocle Studio' },
    { name: 'DAZED', label: 'Dazed & Confused' },
  ];

  return (
    <section className="py-10 border-y border-stone-200/60 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[10px] uppercase font-bold tracking-[0.25em] text-stone-400 mb-6">
          Featured & Celebrated In
        </p>
        <div className="flex flex-wrap items-center justify-around gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
          {brands.map((b) => (
            <div key={b.name} className="flex items-center gap-2 select-none">
              <span className="font-serif tracking-[0.2em] font-semibold text-lg text-stone-800">
                {b.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
