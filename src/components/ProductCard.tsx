import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Star, ArrowLeftRight } from 'lucide-react';
import { Product } from '../types/ecommerce';
import { Badge } from './ui/badge';
import { useShop } from '../context/ShopContext';
import { getStockBadgeLabel } from '../lib/inventory-utils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    addToCart,
    toggleWishlist,
    isWishlisted,
    setQuickViewProduct,
    setIsCartOpen,
    toggleCompare,
    isInCompare,
  } = useShop();

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const selectedColor = product.colors[selectedColorIndex] || product.colors[0];
  const isFavorited = isWishlisted(product.id);
  const stockBadge = getStockBadgeLabel(product.stock, product.lowStockThreshold);
  const isOutOfStock = product.stock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const defaultSize = product.sizes[0] || 'M';
    const success = addToCart(
      product,
      defaultSize,
      selectedColor.name,
      selectedColor.hex,
      1
    );
    if (success) {
      setIsCartOpen(true);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => setQuickViewProduct(product)}
      className="group relative flex flex-col rounded-3xl bg-white border border-stone-200/70 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-stone-900/5 hover:border-stone-300 cursor-pointer"
    >
      {/* Top Badges */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-1.5 pointer-events-none">
        {product.isNew && <Badge variant="new">NEW</Badge>}
        {product.isOnSale && <Badge variant="sale">SALE</Badge>}
        {product.stock > 0 && product.stock <= product.lowStockThreshold && (
          <Badge variant="warning">{stockBadge.label}</Badge>
        )}
        {isOutOfStock && <Badge variant="danger">SOLD OUT</Badge>}
        {isInCompare(product.id) && (
          <Badge variant="outline" className="border-rose-400 text-rose-600 bg-white/95 shadow-xs">
            COMPARING
          </Badge>
        )}
      </div>

      {/* Wishlist Top Right Button */}
      <button
        onClick={handleWishlist}
        className={`absolute top-6 right-6 z-20 h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 ${
          isFavorited
            ? 'bg-rose-50 text-rose-500 shadow-xs'
            : 'bg-white/80 backdrop-blur-xs text-stone-400 hover:text-stone-800 hover:bg-white shadow-xs'
        }`}
        aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={`h-4 w-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
      </button>

      {/* Image Area with subtle warm background matching template */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#f7f5f2] flex items-center justify-center">
        <img
          src={product.images[0]}
          alt={product.name}
          className={`h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 ${
            isOutOfStock ? 'grayscale opacity-75' : ''
          }`}
          loading="lazy"
        />

        {/* Floating Quick Action Dock on hover matching template */}
        <div className="absolute bottom-3 inset-x-2 z-20 flex items-center justify-center gap-1.5 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={handleQuickView}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white/95 backdrop-blur-xs text-stone-800 text-[11px] font-semibold rounded-full shadow-md hover:bg-stone-900 hover:text-white transition-all cursor-pointer"
            title="Quick view"
          >
            <Eye className="h-3 w-3" />
            <span>Quick View</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(product.id);
            }}
            className={`p-1.5 rounded-full shadow-md transition-all cursor-pointer ${
              isInCompare(product.id)
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-white/95 backdrop-blur-xs text-stone-800 hover:bg-stone-900 hover:text-white'
            }`}
            title={isInCompare(product.id) ? 'Remove from comparison' : 'Compare with others'}
            aria-label={`Compare ${product.name}`}
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`p-1.5 rounded-full shadow-md transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-stone-900 text-white hover:bg-rose-500'
            }`}
            title={isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
            aria-label={`Add ${product.name} to bag`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="pt-4 flex flex-col flex-1 text-center items-center">
        {/* Star Rating */}
        <div className="flex items-center justify-center gap-1 mb-1.5">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(product.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-stone-300'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-medium text-stone-400 ml-1">
            ({product.reviewCount})
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-stone-900 group-hover:text-stone-700 transition-colors line-clamp-1">
          {product.name}
        </h3>

        {/* Price matching template */}
        <div className="mt-1.5 flex items-center justify-center gap-2">
          {product.originalPrice && (
            <span className="text-xs text-stone-400 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
          <span className="text-sm font-bold text-stone-900">
            ${product.price.toFixed(2)}
          </span>
        </div>

        {/* Live stock subtext */}
        <div className="mt-1">
          {isOutOfStock ? (
            <span className="text-[11px] font-medium text-rose-500">Out of Stock</span>
          ) : product.stock <= product.lowStockThreshold ? (
            <span className="text-[11px] font-semibold text-amber-600">
              Only {product.stock} left in stock
            </span>
          ) : (
            <span className="text-[11px] text-stone-400 font-normal">
              In Stock ({product.stock})
            </span>
          )}
        </div>

        {/* Color Swatch Dots */}
        {product.colors.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {product.colors.map((c, idx) => (
              <button
                key={c.name}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColorIndex(idx);
                }}
                className={`h-3.5 w-3.5 rounded-full border transition-all ${
                  selectedColorIndex === idx
                    ? 'ring-2 ring-stone-900 ring-offset-1 scale-110'
                    : 'border-stone-300 hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
                aria-label={`Select ${c.name} color`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
