import React from 'react';
import { Star, Plus } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Product } from '../types/ecommerce';

export const TripleColumnLists: React.FC = () => {
  const { products, addToCart, setQuickViewProduct, setIsCartOpen } = useShop();

  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 3);
  const topRated = products.filter((p) => p.isTopRated).slice(0, 3);
  const onSale = products.filter((p) => p.isOnSale).slice(0, 3);

  const renderMiniItem = (product: Product) => {
    const defaultColor = product.colors[0];
    const isOut = product.stock <= 0;

    return (
      <div
        key={product.id}
        onClick={() => setQuickViewProduct(product)}
        className="group flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-stone-100 hover:border-stone-300 hover:shadow-md transition-all duration-200 cursor-pointer"
      >
        {/* Thumbnail */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100">
          <img
            src={product.images[0]}
            alt={product.name}
            className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              isOut ? 'grayscale' : ''
            }`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-stone-900 group-hover:text-stone-700 truncate">
            {product.name}
          </h4>

          {/* Star rating */}
          <div className="flex items-center gap-0.5 mt-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-2.5 w-2.5 ${
                  i < Math.floor(product.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-stone-300'
                }`}
              />
            ))}
            <span className="text-[10px] text-stone-400 ml-1">({product.rating})</span>
          </div>

          {/* Price */}
          <div className="mt-1 flex items-center gap-2">
            {product.originalPrice && (
              <span className="text-[11px] text-stone-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-xs font-bold text-stone-900">
              ${product.price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isOut) return;
            const success = addToCart(
              product,
              product.sizes[0] || 'M',
              defaultColor.name,
              defaultColor.hex,
              1
            );
            if (success) setIsCartOpen(true);
          }}
          disabled={isOut}
          className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-all ${
            isOut
              ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-900 hover:text-white'
          }`}
          title={isOut ? 'Out of stock' : 'Quick add to bag'}
          aria-label={`Quick add ${product.name}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <section className="py-12 bg-stone-50/60 border-y border-stone-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Best Seller */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="text-lg font-bold text-stone-900 font-serif">Best Seller</h3>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-rose-500">
                Trending
              </span>
            </div>
            <div className="space-y-3">
              {bestSellers.map(renderMiniItem)}
            </div>
          </div>

          {/* Column 2: Top Rated */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="text-lg font-bold text-stone-900 font-serif">Top Rated</h3>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-600">
                5-Star Reviews
              </span>
            </div>
            <div className="space-y-3">
              {topRated.map(renderMiniItem)}
            </div>
          </div>

          {/* Column 3: On Sale */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="text-lg font-bold text-stone-900 font-serif">On Sale</h3>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600">
                Limited Time
              </span>
            </div>
            <div className="space-y-3">
              {onSale.map(renderMiniItem)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
