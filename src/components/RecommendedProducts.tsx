import React from 'react';
import {
  Sparkles,
  ShoppingBag,
  Eye,
  ArrowRight,
  Clock,
  Shirt,
} from 'lucide-react';
import { Product } from '../types/ecommerce';
import { useShop } from '../context/ShopContext';
import { getRecommendations, RecommendedProductItem } from '../lib/recommendation-utils';
import { Button } from './ui/button';

interface RecommendedProductsProps {
  currentProduct: Product;
  onProductSelected?: (product: Product) => void;
}

export const RecommendedProducts: React.FC<RecommendedProductsProps> = ({
  currentProduct,
  onProductSelected,
}) => {
  const {
    products,
    cart,
    recentlyViewed,
    setQuickViewProduct,
    addToCart,
    showToast,
  } = useShop();

  const recommendations: RecommendedProductItem[] = getRecommendations({
    currentProduct,
    allProducts: products,
    cartItems: cart,
    recentlyViewedIds: recentlyViewed,
    limit: 4,
  });

  if (recommendations.length === 0) return null;

  const handleQuickAdd = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (p.stock <= 0) return;
    const size = p.sizes[0] || 'M';
    const color = p.colors[0]?.name || 'Standard';
    const colorHex = p.colors[0]?.hex || '#000';
    addToCart(p, size, color, colorHex, 1);
  };

  const handleSelect = (p: Product) => {
    if (onProductSelected) {
      onProductSelected(p);
    } else {
      setQuickViewProduct(p);
    }
  };

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'cart-match':
        return <ShoppingBag className="h-2.5 w-2.5 text-rose-500" />;
      case 'recently-viewed':
        return <Clock className="h-2.5 w-2.5 text-stone-500" />;
      case 'complete-look':
        return <Shirt className="h-2.5 w-2.5 text-amber-600" />;
      default:
        return <Sparkles className="h-2.5 w-2.5 text-rose-500" />;
    }
  };

  const getReasonBadgeClass = (reason: string) => {
    switch (reason) {
      case 'cart-match':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'recently-viewed':
        return 'bg-stone-100 text-stone-700 border-stone-200';
      case 'complete-look':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="pt-6 mt-6 border-t border-stone-200 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5 font-serif">
            <Sparkles className="h-3.5 w-3.5 text-rose-500" />
            <span>Recommended for You</span>
          </h4>
          <p className="text-[11px] text-stone-500">
            Curated to pair with your bag and recent browsing history
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {recommendations.map(({ product: p, reason, reasonText }) => {
          const isOutOfStock = p.stock <= 0;

          return (
            <div
              key={p.id}
              onClick={() => handleSelect(p)}
              className="group relative rounded-xl border border-stone-200 bg-white p-2.5 hover:border-stone-300 transition-all hover:shadow-xs flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Product Thumbnail */}
                <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-stone-100 mb-2">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      isOutOfStock ? 'grayscale opacity-75' : ''
                    }`}
                  />

                  {/* Recommendation Reason Pill Badge */}
                  <div className="absolute top-1.5 left-1.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border shadow-2xs backdrop-blur-xs ${getReasonBadgeClass(
                        reason
                      )}`}
                    >
                      {getReasonIcon(reason)}
                      <span>{reasonText}</span>
                    </span>
                  </div>

                  {/* Hover Quick Add / Preview overlay */}
                  <div className="absolute inset-x-1.5 bottom-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(p);
                      }}
                      className="flex-1 py-1 bg-white/95 text-stone-900 text-[10px] font-semibold rounded-md shadow-xs hover:bg-stone-900 hover:text-white transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={(e) => handleQuickAdd(p, e)}
                      className="p-1 bg-stone-900 text-white rounded-md shadow-xs hover:bg-rose-500 transition-colors disabled:opacity-40"
                      title={isOutOfStock ? 'Sold Out' : 'Add to Bag'}
                    >
                      <ShoppingBag className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-0.5">
                  <span className="text-[10px] text-stone-400 uppercase font-medium">
                    {p.category}
                  </span>
                  <h5 className="text-xs font-bold text-stone-900 line-clamp-1 group-hover:text-rose-600 transition-colors">
                    {p.name}
                  </h5>
                </div>
              </div>

              {/* Price & Stock */}
              <div className="mt-2 pt-1 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900">
                  ${p.price.toFixed(2)}
                </span>
                {isOutOfStock ? (
                  <span className="text-[10px] text-stone-400 font-medium">Sold Out</span>
                ) : (
                  <span className="text-[10px] text-emerald-600 font-medium">In Stock</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
