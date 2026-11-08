import React from 'react';
import { ArrowLeftRight, X, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Button } from './ui/button';

export const ComparisonBar: React.FC = () => {
  const {
    compareList,
    products,
    toggleCompare,
    clearCompare,
    setIsCompareOpen,
  } = useShop();

  if (compareList.length === 0) return null;

  const selectedProducts = products.filter((p) => compareList.includes(p.id));

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] sm:w-auto animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-stone-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-stone-800 flex items-center justify-between gap-4 sm:gap-6">
        {/* Left: Indicator & Thumbnails */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-300 font-medium">
            <ArrowLeftRight className="h-4 w-4 text-rose-400" />
            <span>Compare ({selectedProducts.length}/4):</span>
          </div>

          <div className="flex items-center -space-x-2">
            {selectedProducts.map((p) => (
              <div
                key={p.id}
                className="relative group h-10 w-10 rounded-xl overflow-hidden border-2 border-stone-800 bg-stone-800 shrink-0"
              >
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => toggleCompare(p.id)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                  title={`Remove ${p.name}`}
                  aria-label={`Remove ${p.name} from comparison`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={clearCompare}
            className="text-[11px] text-stone-400 hover:text-white px-2 py-1 transition-colors"
          >
            Clear
          </button>

          <Button
            size="sm"
            onClick={() => setIsCompareOpen(true)}
            className="bg-white text-stone-900 hover:bg-stone-100 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-rose-500" />
            <span>Compare Now</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
