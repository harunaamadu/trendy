import React from 'react';
import { Instagram, Eye } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const LookbookGrid: React.FC = () => {
  const { setQuickViewProduct, products } = useShop();

  const lookbookItems = [
    {
      id: 'look-1',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80',
      handle: '@trendy_store',
      caption: 'Autumn tones & layered wool tailoring #MinimalChic',
      productId: 'prod-2',
    },
    {
      id: 'look-2',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=700&q=80',
      handle: '@trendy_store',
      caption: 'Effortless Normandy flax trousers under the morning sun',
      productId: 'prod-4',
    },
    {
      id: 'look-3',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80',
      handle: '@trendy_store',
      caption: 'The everyday boxy 280 GSM organic cotton staple',
      productId: 'prod-3',
    },
    {
      id: 'look-4',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=80',
      handle: '@trendy_store',
      caption: 'Pure Mulberry silk georgette slip for twilight gatherings',
      productId: 'prod-5',
    },
  ];

  const handleOpenProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setQuickViewProduct(product);
    }
  };

  return (
    <section id="lookbook" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div className="mb-8 space-y-1">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-lg font-bold text-stone-900 hover:text-rose-500 transition-colors font-serif"
        >
          <Instagram className="h-5 w-5 text-rose-500" />
          <span>@trendy_store</span>
        </a>
        <p className="text-xs text-stone-500 uppercase tracking-widest font-medium">
          Follow us on Instagram for daily style inspiration
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {lookbookItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleOpenProduct(item.productId)}
            className="group relative aspect-square overflow-hidden rounded-2xl bg-stone-100 cursor-pointer shadow-xs hover:shadow-lg transition-all duration-300"
          >
            <img
              src={item.image}
              alt={item.caption}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            {/* Hover overlay matching template gallery */}
            <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end text-left text-white">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300">
                <Instagram className="h-3.5 w-3.5" />
                <span>Trendy Community</span>
              </div>
              <p className="text-xs line-clamp-2 mt-1 text-stone-200">{item.caption}</p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white">
                <Eye className="h-3 w-3" />
                <span>Shop Look</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
