import React, { useState, useEffect } from 'react';
import {
  Star,
  ShieldCheck,
  Heart,
  ShoppingBag,
  Check,
  Sparkles,
  ArrowLeftRight,
  MessageSquare,
  Layers,
  Ruler,
} from 'lucide-react';
import { Dialog } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useShop } from '../context/ShopContext';
import { getStockBadgeLabel } from '../lib/inventory-utils';
import { ProductReviews } from './ProductReviews';
import { SizeGuideModal } from './SizeGuideModal';
import { RecommendedProducts } from './RecommendedProducts';

export const QuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    toggleWishlist,
    isWishlisted,
    setIsCartOpen,
    setIsCheckoutOpen,
    toggleCompare,
    isInCompare,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  useEffect(() => {
    if (quickViewProduct) {
      setActiveTab('details');
      setSelectedImageIndex(0);
      setSelectedColorIndex(0);
      setQuantity(1);
      setSelectedSize(quickViewProduct.sizes[0] || 'M');
    }
  }, [quickViewProduct?.id]);

  if (!quickViewProduct) return null;

  const currentSize = selectedSize || quickViewProduct.sizes[0] || 'M';
  const currentColor = quickViewProduct.colors[selectedColorIndex] || quickViewProduct.colors[0];
  const isFavorited = isWishlisted(quickViewProduct.id);
  const stockBadge = getStockBadgeLabel(quickViewProduct.stock, quickViewProduct.lowStockThreshold);
  const isOutOfStock = quickViewProduct.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const ok = addToCart(
      quickViewProduct,
      currentSize,
      currentColor.name,
      currentColor.hex,
      quantity
    );
    if (ok) {
      setQuickViewProduct(null);
      setIsCartOpen(true);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const ok = addToCart(
      quickViewProduct,
      currentSize,
      currentColor.name,
      currentColor.hex,
      quantity
    );
    if (ok) {
      setQuickViewProduct(null);
      setIsCheckoutOpen(true);
    }
  };

  return (
    <Dialog
      open={!!quickViewProduct}
      onOpenChange={(open) => !open && setQuickViewProduct(null)}
      maxWidth="4xl"
    >
      {/* Top Tab Bar inside QuickView */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 pb-2 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
              activeTab === 'details'
                ? 'text-stone-900 border-b-2 border-stone-900 -mb-[10px]'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Garment Details</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2 pb-2 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
              activeTab === 'reviews'
                ? 'text-stone-900 border-b-2 border-stone-900 -mb-[10px]'
                : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Customer Reviews</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-100 text-stone-700 font-semibold">
              {quickViewProduct.reviewCount}
            </span>
          </button>
        </div>

        {/* Quick price info on review tab */}
        {activeTab === 'reviews' && (
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-xs text-stone-500 font-medium">{quickViewProduct.name}</span>
            <span className="text-sm font-bold text-stone-900">${quickViewProduct.price.toFixed(2)}</span>
            <Button
              size="sm"
              onClick={() => setActiveTab('details')}
              className="rounded-full text-xs px-3 py-1 bg-stone-900 text-white cursor-pointer"
            >
              Order Garment
            </Button>
          </div>
        )}
      </div>

      {activeTab === 'reviews' ? (
        <ProductReviews
          productId={quickViewProduct.id}
          productName={quickViewProduct.name}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Gallery (5 cols) */}
          <div className="md:col-span-6 space-y-4">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-stone-100 flex items-center justify-center">
              <img
                src={quickViewProduct.images[selectedImageIndex] || quickViewProduct.images[0]}
                alt={quickViewProduct.name}
                className={`h-full w-full object-cover object-center ${
                  isOutOfStock ? 'grayscale opacity-80' : ''
                }`}
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {quickViewProduct.isNew && <Badge variant="new">NEW</Badge>}
                {quickViewProduct.isOnSale && <Badge variant="sale">SALE</Badge>}
                <Badge variant={stockBadge.variant}>{stockBadge.label}</Badge>
              </div>
            </div>

            {/* Thumbnails */}
            {quickViewProduct.images.length > 1 && (
              <div className="flex gap-3">
                {quickViewProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`h-16 w-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-stone-900 scale-105'
                        : 'border-stone-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Product Specs & Controls (7 cols) */}
          <div className="md:col-span-6 flex flex-col space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                <span>SKU: {quickViewProduct.sku}</span>
                <span className="uppercase tracking-wider font-semibold text-stone-700">
                  {quickViewProduct.category}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-stone-900 font-serif leading-tight">
                {quickViewProduct.name}
              </h2>

              {/* Rating - Clickable to open reviews tab */}
              <button
                onClick={() => setActiveTab('reviews')}
                className="flex items-center gap-1.5 mt-2 text-left group cursor-pointer"
                title="View customer reviews and feedback"
              >
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.floor(quickViewProduct.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-stone-700">
                  {quickViewProduct.rating}
                </span>
                <span className="text-xs text-stone-400 group-hover:text-stone-900 group-hover:underline transition-colors">
                  ({quickViewProduct.reviewCount} verified reviews)
                </span>
              </button>

            {/* Price */}
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-stone-900">
                ${quickViewProduct.price.toFixed(2)}
              </span>
              {quickViewProduct.originalPrice && (
                <span className="text-base text-stone-400 line-through">
                  ${quickViewProduct.originalPrice.toFixed(2)}
                </span>
              )}
              {quickViewProduct.isOnSale && (
                <span className="text-xs font-bold text-rose-500 uppercase tracking-wide">
                  Save ${(quickViewProduct.originalPrice! - quickViewProduct.price).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {quickViewProduct.description}
          </p>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              Color: <span className="font-normal text-stone-500">{currentColor.name}</span>
            </label>
            <div className="flex items-center gap-2.5">
              {quickViewProduct.colors.map((c, idx) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColorIndex(idx)}
                  className={`relative h-7 w-7 rounded-full border transition-all ${
                    selectedColorIndex === idx
                      ? 'ring-2 ring-stone-900 ring-offset-2 scale-110'
                      : 'border-stone-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                  aria-label={`Select ${c.name}`}
                >
                  {selectedColorIndex === idx && (
                    <Check
                      className={`h-3.5 w-3.5 mx-auto ${
                        c.hex === '#f6f6f4' || c.hex === '#ffffff'
                          ? 'text-stone-900'
                          : 'text-white'
                      }`}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-stone-700">Select Size</label>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="flex items-center gap-1 text-[11px] font-semibold text-stone-600 hover:text-stone-900 underline underline-offset-2 transition-colors cursor-pointer"
                title="Calculate your size and view measurement chart"
              >
                <Ruler className="h-3 w-3 text-rose-500" />
                <span>Size Guide & Fit Finder</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickViewProduct.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`h-10 min-w-10 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentSize === s
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-stone-200 rounded-full bg-stone-50 h-11 px-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-8 w-8 flex items-center justify-center text-stone-600 hover:bg-stone-200 rounded-full transition-colors"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-semibold text-stone-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(quickViewProduct.stock, q + 1))}
                  disabled={quantity >= quickViewProduct.stock}
                  className="h-8 w-8 flex items-center justify-center text-stone-600 hover:bg-stone-200 rounded-full transition-colors disabled:opacity-30"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <Button
                variant="default"
                size="md"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 h-11 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 bg-stone-900 hover:bg-black text-white shadow-md cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
              </Button>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(quickViewProduct.id)}
                className={`h-11 w-11 shrink-0 rounded-full border border-stone-200 flex items-center justify-center transition-colors ${
                  isFavorited
                    ? 'bg-rose-50 border-rose-200 text-rose-500'
                    : 'hover:bg-stone-100 text-stone-600'
                }`}
                aria-label="Wishlist toggle"
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
              </button>

              {/* Compare Button */}
              <button
                onClick={() => toggleCompare(quickViewProduct.id)}
                className={`h-11 w-11 shrink-0 rounded-full border border-stone-200 flex items-center justify-center transition-colors ${
                  isInCompare(quickViewProduct.id)
                    ? 'bg-rose-50 border-rose-300 text-rose-600'
                    : 'hover:bg-stone-100 text-stone-600'
                }`}
                title={isInCompare(quickViewProduct.id) ? 'Remove from comparison' : 'Compare with other garments'}
                aria-label="Toggle comparison"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </button>
            </div>

            {/* Instant Buy Now button */}
            {!isOutOfStock && (
              <Button
                variant="outline"
                size="md"
                onClick={handleBuyNow}
                className="w-full h-10 rounded-full text-xs font-semibold uppercase tracking-wider border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white transition-colors cursor-pointer"
              >
                Instant Buy Now
              </Button>
            )}
          </div>

          {/* Sustainability & Fabric Highlights */}
          <div className="pt-3 border-t border-stone-100 space-y-2 text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span><strong>Fabric:</strong> {quickViewProduct.fabric}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span><strong>Ethics:</strong> {quickViewProduct.sustainability}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended for You Section based on Cart & History */}
      <RecommendedProducts
        currentProduct={quickViewProduct}
        onProductSelected={(p) => setQuickViewProduct(p)}
      />
    </>
      )}

      {/* Size Guide & Fit Finder Modal */}
      <SizeGuideModal
        open={isSizeGuideOpen}
        onOpenChange={setIsSizeGuideOpen}
        productName={quickViewProduct.name}
        category={quickViewProduct.category}
        currentSize={currentSize}
        onSelectSize={(newSize) => setSelectedSize(newSize)}
      />
    </Dialog>
  );
};
