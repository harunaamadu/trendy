import React, { useState } from 'react';
import { ShopProvider } from './context/ShopContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { PromoBanners } from './components/PromoBanners';
import { FeaturedProducts } from './components/FeaturedProducts';
import { BentoPromos } from './components/BentoPromos';
import { TripleColumnLists } from './components/TripleColumnLists';
import { NewsletterSection } from './components/NewsletterSection';
import { BrandsStrip } from './components/BrandsStrip';
import { LookbookGrid } from './components/LookbookGrid';
import { PerksBar } from './components/PerksBar';
import { Footer } from './components/Footer';

// Modals & Drawers
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { CheckoutModal } from './components/CheckoutModal';
import { InventoryManagerModal } from './components/InventoryManagerModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchModal } from './components/SearchModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { TemplateReferenceModal } from './components/TemplateReferenceModal';
import { ProductComparisonModal } from './components/ProductComparisonModal';
import { ComparisonBar } from './components/ComparisonBar';
import { UserProfileModal } from './components/UserProfileModal';
import { Toast } from './components/Toast';

export default function App() {
  const [orderTrackingOpen, setOrderTrackingOpen] = useState(false);
  const [templateReferenceOpen, setTemplateReferenceOpen] = useState(false);

  return (
    <ShopProvider>
      <div className="min-h-screen flex flex-col bg-[#faf9f8] text-stone-900 selection:bg-rose-100 selection:text-rose-900">
        {/* Navigation & Header */}
        <Header
          onOpenOrderTracking={() => setOrderTrackingOpen(true)}
          onOpenTemplateReference={() => setTemplateReferenceOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1">
          {/* Hero Section matching template */}
          <HeroSection />

          {/* Dual Promotional Cards under hero matching template */}
          <PromoBanners />

          {/* Featured Products Grid with Category Tabs matching template */}
          <FeaturedProducts />

          {/* Asymmetric Bento Promotional Grid matching template */}
          <BentoPromos />

          {/* Triple Column Mini Lists (Best Seller, Top Rated, On Sale) matching template */}
          <TripleColumnLists />

          {/* Newsletter Subscribe Banner matching template */}
          <NewsletterSection />

          {/* Brand/Press Logos Strip matching template */}
          <BrandsStrip />

          {/* Lookbook / Instagram Gallery matching template */}
          <LookbookGrid />

          {/* Value Propositions / Trust Bar matching template */}
          <PerksBar />
        </main>

        {/* Comprehensive Modern Minimalist Footer */}
        <Footer />

        {/* Interactive Drawers & Overlays */}
        <CartDrawer />
        <QuickViewModal />
        <CheckoutModal />
        <InventoryManagerModal />
        <WishlistDrawer />
        <SearchModal />
        <OrderTrackingModal
          open={orderTrackingOpen}
          onOpenChange={setOrderTrackingOpen}
        />
        <TemplateReferenceModal
          open={templateReferenceOpen}
          onOpenChange={setTemplateReferenceOpen}
        />
        <ComparisonBar />
        <ProductComparisonModal />
        <UserProfileModal
          onOpenOrderTracking={(_id) => setOrderTrackingOpen(true)}
        />
        <Toast />
      </div>
    </ShopProvider>
  );
}
