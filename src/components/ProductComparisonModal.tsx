import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Trash2,
  ShoppingBag,
  Star,
  Check,
  ShieldCheck,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import { Dialog } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useShop } from '../context/ShopContext';
import { computeComparisonDifferences } from '../lib/comparison-utils';
import { getStockBadgeLabel } from '../lib/inventory-utils';

export const ProductComparisonModal: React.FC = () => {
  const {
    isCompareOpen,
    setIsCompareOpen,
    compareList,
    products,
    toggleCompare,
    clearCompare,
    addToCart,
    setIsCartOpen,
  } = useShop();

  const [highlightDifferences, setHighlightDifferences] = useState(false);

  const comparedProducts = products.filter((p) => compareList.includes(p.id));
  const diffs = computeComparisonDifferences(comparedProducts);

  const handleAddProductToCart = (product: any) => {
    if (product.stock <= 0) return;
    const ok = addToCart(
      product,
      product.sizes[0] || 'M',
      product.colors[0]?.name || 'Standard',
      product.colors[0]?.hex || '#000',
      1
    );
    if (ok) {
      setIsCompareOpen(false);
      setIsCartOpen(true);
    }
  };

  const getDiffClass = (isDiff: boolean) =>
    highlightDifferences && isDiff
      ? 'bg-amber-50/70 font-medium'
      : '';

  return (
    <Dialog
      open={isCompareOpen}
      onOpenChange={setIsCompareOpen}
      title="Side-by-Side Product Comparison"
      description={`Compare specifications, material origins, fabric care, and pricing across ${comparedProducts.length} items`}
      maxWidth="4xl"
    >
      {comparedProducts.length === 0 ? (
        <div className="py-16 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
            <ArrowLeftRight className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-900">No products selected</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
              Click the compare icon (⇄) on any garment card to compare fabrics, fit, and prices side by side.
            </p>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsCompareOpen(false)}
            className="text-xs uppercase tracking-wider px-6"
          >
            Browse Garments
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100 text-xs">
            {/* Highlight differences toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={highlightDifferences}
                onChange={(e) => setHighlightDifferences(e.target.checked)}
                className="rounded border-stone-300 text-stone-900 focus:ring-stone-400 h-4 w-4"
              />
              <span className="text-stone-700 font-medium flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>Highlight Differences Only</span>
              </span>
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={clearCompare}
                className="text-stone-500 hover:text-rose-600 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Clear All ({comparedProducts.length})
              </button>
            </div>
          </div>

          {/* Comparison Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
            <table className="w-full border-collapse text-left text-xs min-w-[620px]">
              {/* Product Header Row */}
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/60 divide-x divide-stone-100">
                  <th className="p-4 w-40 text-stone-400 font-bold uppercase tracking-wider text-[10px] align-top">
                    Product Details
                  </th>
                  {comparedProducts.map((p) => {
                    const isOut = p.stock <= 0;
                    const stockBadge = getStockBadgeLabel(p.stock, p.lowStockThreshold);

                    return (
                      <th
                        key={p.id}
                        className="p-4 w-60 align-top font-normal text-stone-900 relative space-y-3"
                      >
                        {/* Remove item button */}
                        <button
                          onClick={() => toggleCompare(p.id)}
                          className="absolute top-3 right-3 p-1 rounded-full text-stone-400 hover:text-rose-600 hover:bg-stone-200/60 transition-colors"
                          title="Remove from comparison"
                          aria-label={`Remove ${p.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        {/* Image */}
                        <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-stone-100">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className={`h-full w-full object-cover ${isOut ? 'grayscale' : ''}`}
                          />
                        </div>

                        {/* Name & SKU */}
                        <div>
                          <div className="text-[10px] uppercase font-mono text-stone-400">
                            {p.sku}
                          </div>
                          <h4 className="font-bold text-sm text-stone-900 line-clamp-2 mt-0.5">
                            {p.name}
                          </h4>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-extrabold text-stone-900">
                            ${p.price.toFixed(2)}
                          </span>
                          {p.originalPrice && (
                            <span className="text-xs text-stone-400 line-through">
                              ${p.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Stock badge */}
                        <div>
                          <Badge variant={stockBadge.variant}>{stockBadge.label}</Badge>
                        </div>

                        {/* Add to bag button */}
                        <Button
                          variant="default"
                          size="sm"
                          disabled={isOut}
                          onClick={() => handleAddProductToCart(p)}
                          className="w-full text-xs font-semibold py-2 rounded-full flex items-center justify-center gap-1.5"
                        >
                          <ShoppingBag className="h-3 w-3" />
                          <span>{isOut ? 'Sold Out' : 'Add to Bag'}</span>
                        </Button>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Specification Rows */}
              <tbody className="divide-y divide-stone-100">
                {/* Category */}
                <tr className={getDiffClass(diffs.category)}>
                  <td className="p-3.5 font-semibold text-stone-700 bg-stone-50/50">
                    Category
                  </td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-3.5 text-stone-800">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium text-[11px]">
                        {p.category}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Rating & Reviews */}
                <tr className={getDiffClass(diffs.rating)}>
                  <td className="p-3.5 font-semibold text-stone-700 bg-stone-50/50">
                    Rating & Reviews
                  </td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-3.5">
                      <div className="flex items-center gap-1">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(p.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-stone-900 ml-1">{p.rating}</span>
                        <span className="text-[11px] text-stone-400">({p.reviewCount})</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Fabric & Materials */}
                <tr className={getDiffClass(diffs.fabric)}>
                  <td className="p-3.5 font-semibold text-stone-700 bg-stone-50/50">
                    Fabric & Material
                  </td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-3.5 text-stone-800 font-medium">
                      {p.fabric}
                    </td>
                  ))}
                </tr>

                {/* Sustainability & Ethics */}
                <tr className={getDiffClass(diffs.sustainability)}>
                  <td className="p-3.5 font-semibold text-stone-700 bg-stone-50/50">
                    Sustainability
                  </td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-3.5 text-emerald-800">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{p.sustainability}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Care Instructions */}
                <tr className={getDiffClass(diffs.care)}>
                  <td className="p-3.5 font-semibold text-stone-700 bg-stone-50/50">
                    Care Guide
                  </td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-3.5 text-stone-600 text-[11px] leading-relaxed">
                      {p.care}
                    </td>
                  ))}
                </tr>

                {/* Key Features & Details */}
                <tr>
                  <td className="p-3.5 font-semibold text-stone-700 bg-stone-50/50 align-top">
                    Craftsmanship Details
                  </td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-3.5 text-stone-600 align-top">
                      <ul className="space-y-1">
                        {p.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                            <Check className="h-3 w-3 text-stone-400 shrink-0 mt-0.5" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Available Sizes */}
                <tr>
                  <td className="p-3.5 font-semibold text-stone-700 bg-stone-50/50">
                    Available Sizes
                  </td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {p.sizes.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 text-[10px] font-semibold"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Available Colorways */}
                <tr>
                  <td className="p-3.5 font-semibold text-stone-700 bg-stone-50/50">
                    Colors & Finishes
                  </td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {p.colors.map((c) => (
                          <div
                            key={c.name}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-stone-200 text-[10px] text-stone-600"
                          >
                            <span
                              className="h-2.5 w-2.5 rounded-full border border-stone-300"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span>{c.name}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Dialog>
  );
};
