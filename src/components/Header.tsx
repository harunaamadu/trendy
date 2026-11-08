import React, { useState } from 'react';
import {
  Search,
  Heart,
  ShoppingBag,
  SlidersHorizontal,
  Menu,
  X,
  PackageCheck,
  LayoutTemplate,
  ArrowLeftRight,
  User,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { calculateSubtotal } from '../lib/cart-utils';

interface HeaderProps {
  onOpenOrderTracking: () => void;
  onOpenTemplateReference: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenOrderTracking, onOpenTemplateReference }) => {
  const {
    cart,
    wishlist,
    compareList,
    userProfile,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsSearchOpen,
    setIsInventoryManagerOpen,
    setIsCompareOpen,
    setIsProfileOpen,
    setActiveCategory,
  } = useShop();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = calculateSubtotal(cart);

  const navLinks = [
    { label: 'HOME', href: '#hero', category: 'All' },
    { label: 'SHOP', href: '#featured', category: 'All' },
    { label: 'WOMEN', href: '#featured', category: 'Women' },
    { label: 'MEN', href: '#featured', category: 'Men' },
    { label: 'KNITWEAR', href: '#featured', category: 'Knitwear' },
    { label: 'LOOKBOOK', href: '#lookbook' },
  ];

  const handleNavClick = (category?: string, href?: string) => {
    if (category) {
      setActiveCategory(category as any);
    }
    if (href) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-100 transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-[#f7f5f2] py-2 px-4 text-center text-[11px] font-medium tracking-widest text-stone-600 uppercase border-b border-stone-200/60 flex items-center justify-center gap-2">
        <span>FREE STANDARD SHIPPING ON ALL U.S. ORDERS OVER $75</span>
        <span className="hidden sm:inline text-stone-300">•</span>
        <span className="hidden sm:inline text-rose-500 font-semibold">USE CODE 'TRENDY10' FOR 10% OFF</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-700 hover:text-stone-900 rounded-lg"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Desktop Left Nav Links */}
          <nav className="hidden md:flex items-center space-x-7" aria-label="Main navigation">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.category, link.href)}
                className="text-[12px] font-semibold tracking-widest text-stone-700 hover:text-stone-900 transition-colors uppercase py-1 relative group cursor-pointer"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-400 transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* Center Brand Logo */}
          <div className="flex-1 md:flex-none text-center">
            <a
              href="#hero"
              className="inline-block text-2xl md:text-3xl font-extrabold tracking-[0.22em] text-stone-900 uppercase font-serif"
            >
              TRENDY
            </a>
          </div>

          {/* Right Action Icons & Admin Switch */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              aria-label="Search products"
              title="Search store"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* User Profile Button matching template navbar */}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              aria-label="Member Account and Orders"
              title={`Account: ${userProfile.fullName}`}
            >
              <User className="h-5 w-5" />
            </button>

            {/* Order Tracking / Lookup */}
            <button
              onClick={onOpenOrderTracking}
              className="hidden sm:flex items-center p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              aria-label="Track order"
              title="Track your order"
            >
              <PackageCheck className="h-5 w-5" />
            </button>

            {/* Wishlist Button with Badge */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              aria-label="View wishlist"
              title="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Product Comparison Button with Badge */}
            <button
              onClick={() => setIsCompareOpen(true)}
              className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              aria-label={`Compare products (${compareList.length})`}
              title="Compare Products"
            >
              <ArrowLeftRight className="h-5 w-5" />
              {compareList.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-stone-900 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {compareList.length}
                </span>
              )}
            </button>

            {/* Cart Button with Count & Subtotal */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 p-2 sm:px-3 sm:py-2 text-stone-800 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-full transition-colors border border-stone-200/80 cursor-pointer"
              aria-label={`Shopping cart with ${totalCartCount} items`}
            >
              <div className="relative">
                <ShoppingBag className="h-5 w-5 text-stone-800" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-stone-700">
                ${cartSubtotal.toFixed(2)}
              </span>
            </button>

            {/* Admin & Inventory Management Button */}
            <button
              onClick={() => setIsInventoryManagerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full transition-all cursor-pointer shadow-xs"
              title="Open Live Inventory Dashboard"
              aria-label="Inventory Management"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-amber-700" />
              <span className="hidden lg:inline text-amber-900">Inventory</span>
            </button>

            {/* Template Blueprint Button */}
            <button
              onClick={onOpenTemplateReference}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-full transition-all cursor-pointer shadow-xs"
              title="Compare layout against provided template blueprint"
              aria-label="View Template Blueprint"
            >
              <LayoutTemplate className="h-3.5 w-3.5 text-rose-600" />
              <span>Template</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.category, link.href)}
              className="block w-full text-left py-2 text-sm font-semibold tracking-wider text-stone-700 hover:text-stone-900 uppercase"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsProfileOpen(true);
              }}
              className="text-xs font-medium text-stone-700 flex items-center gap-1.5"
            >
              <User className="h-4 w-4 text-stone-500" />
              Account
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsCompareOpen(true);
              }}
              className="text-xs font-medium text-stone-700 flex items-center gap-1.5"
            >
              <ArrowLeftRight className="h-4 w-4 text-stone-500" />
              Compare ({compareList.length})
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenOrderTracking();
              }}
              className="text-xs font-medium text-stone-600 flex items-center gap-1.5"
            >
              <PackageCheck className="h-4 w-4" />
              Track Order
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsInventoryManagerOpen(true);
              }}
              className="text-xs font-medium text-amber-700 flex items-center gap-1.5"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Inventory
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
