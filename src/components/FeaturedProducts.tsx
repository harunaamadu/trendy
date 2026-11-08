import React, { useMemo } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Tabs } from './ui/tabs';
import { ProductCard } from './ProductCard';
import { ProductCategory } from '../types/ecommerce';

export const FeaturedProducts: React.FC = () => {
  const { products, activeCategory, setActiveCategory, searchQuery } = useShop();

  const categoryTabs = [
    { id: 'All', label: 'All' },
    { id: 'Women', label: 'For Women' },
    { id: 'Men', label: 'For Men' },
    { id: 'Knitwear', label: 'Knitwear' },
    { id: 'Outerwear', label: 'Outerwear' },
    { id: 'Accessories', label: 'Accessories' },
  ];

  const displayedProducts = useMemo(() => {
    let list = [...products];

    // Filter by active category tab
    if (activeCategory !== 'All') {
      list = list.filter((p) => p.category === activeCategory);
    }

    // Filter by search query if any
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [products, activeCategory, searchQuery]);

  return (
    <section id="featured" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header matching template */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <h2 className="text-3xl sm:text-4xl font-light text-stone-900 tracking-tight">
          Featured <span className="font-serif italic font-normal">Products</span>
        </h2>
        <p className="text-sm text-stone-500">
          Clean lines, premium natural yarns, and tailored silhouettes crafted for everyday luxury.
        </p>

        {/* Category Tabs matching template pill bar */}
        <div className="pt-4">
          <Tabs
            tabs={categoryTabs}
            activeTab={activeCategory}
            onChange={(id) => setActiveCategory(id as ProductCategory)}
          />
        </div>
      </div>

      {/* Product Display Grid - 4 columns on desktop matching template */}
      {displayedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {displayedProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
          <Sparkles className="h-8 w-8 text-stone-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-stone-800">No products match your filter</h3>
          <p className="text-xs text-stone-500 mt-1">
            Try switching categories or clearing search keywords.
          </p>
          <button
            onClick={() => setActiveCategory('All')}
            className="mt-4 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-full hover:bg-stone-800 transition-colors"
          >
            Show All Products
          </button>
        </div>
      )}

      {/* Subtext link below products matching template */}
      <div className="mt-14 text-center">
        <button
          onClick={() => {
            setActiveCategory('All');
            const el = document.getElementById('featured');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-stone-700 hover:text-stone-900 transition-colors group cursor-pointer"
        >
          <span>Get hands on our new season drops • Shop All Products</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
};
