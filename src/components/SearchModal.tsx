import React, { useState } from 'react';
import { Search, ArrowRight, Tag } from 'lucide-react';
import { Dialog } from './ui/dialog';
import { useShop } from '../context/ShopContext';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    products,
    setQuickViewProduct,
    setActiveCategory,
  } = useShop();

  const [query, setQuery] = useState('');

  const popularKeywords = ['Cashmere', 'Linen', 'Denim', 'Overcoat', 'Silk', 'Tote'];

  const searchResults = query.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          p.fabric.toLowerCase().includes(query.toLowerCase()) ||
          p.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const handleSelectProduct = (product: any) => {
    setIsSearchOpen(false);
    setQuickViewProduct(product);
  };

  const handleQuickTag = (tag: string) => {
    setQuery(tag);
  };

  return (
    <Dialog
      open={isSearchOpen}
      onOpenChange={setIsSearchOpen}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clothes, fabrics, cashmere, linen..."
            className="w-full h-13 pl-12 pr-4 rounded-2xl bg-stone-50 border border-stone-200 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white transition-all"
          />
        </div>

        {/* Popular Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            Trending:
          </span>
          {popularKeywords.map((kw) => (
            <button
              key={kw}
              onClick={() => handleQuickTag(kw)}
              className="text-xs px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
            >
              {kw}
            </button>
          ))}
        </div>

        {/* Results */}
        {query.trim() && (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              {searchResults.length} {searchResults.length === 1 ? 'Result' : 'Results'} Found
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-stone-500 text-xs">
                No items matching "{query}". Try another keyword or browse our categories.
              </div>
            ) : (
              searchResults.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectProduct(p)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer border border-transparent hover:border-stone-200"
                >
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="h-12 w-10 rounded-lg object-cover bg-stone-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-stone-900 truncate">{p.name}</h4>
                    <p className="text-[11px] text-stone-400">
                      {p.category} • ${p.price.toFixed(2)}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-stone-400" />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
};
