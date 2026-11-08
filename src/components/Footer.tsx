import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Footer: React.FC = () => {
  const { setActiveCategory } = useShop();

  const handleCategory = (cat: any) => {
    setActiveCategory(cat);
    document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#f7f5f2] border-t border-stone-200/80 pt-16 pb-12 text-stone-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-stone-200">
          {/* Brand Info matching template */}
          <div className="lg:col-span-1 space-y-4">
            <a
              href="#hero"
              className="text-2xl font-black tracking-[0.2em] text-stone-900 font-serif uppercase block"
            >
              TRENDY
            </a>
            <p className="text-xs text-stone-500 leading-relaxed">
              An oasis of modern wardrobe essentials designed specifically so your everyday styling feels effortless and tailored.
            </p>
            <div className="space-y-2 text-xs text-stone-600 pt-1">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-stone-400" />
                <span>+1 (800) 88-66-990</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-stone-400" />
                <span>concierge@trendy-store.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-stone-400" />
                <span>544 Mercer St, SoHo, NY 10013</span>
              </div>
            </div>
          </div>

          {/* About Us matching template */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-900">About Us</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#hero" className="hover:text-stone-900 transition-colors">Our Story</a>
              </li>
              <li>
                <button onClick={() => handleCategory('All')} className="hover:text-stone-900 transition-colors">All Products</button>
              </li>
              <li>
                <a href="#lookbook" className="hover:text-stone-900 transition-colors">Lookbook</a>
              </li>
              <li>
                <a href="#hero" className="hover:text-stone-900 transition-colors">Giving Back & Ecology</a>
              </li>
              <li>
                <a href="#hero" className="hover:text-stone-900 transition-colors">Studio Partnerships</a>
              </li>
              <li>
                <a href="#hero" className="hover:text-stone-900 transition-colors">Careers</a>
              </li>
            </ul>
          </div>

          {/* Support matching template */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-900">Support</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#hero" className="hover:text-stone-900 transition-colors">Shipping Information</a>
              </li>
              <li>
                <a href="#hero" className="hover:text-stone-900 transition-colors">Returns & Exchanges</a>
              </li>
              <li>
                <a href="#hero" className="hover:text-stone-900 transition-colors">Help & FAQ</a>
              </li>
              <li>
                <a href="#hero" className="hover:text-stone-900 transition-colors">Customer Reviews</a>
              </li>
              <li>
                <a href="#hero" className="hover:text-stone-900 transition-colors">Garment Size Quiz</a>
              </li>
              <li>
                <a href="#hero" className="hover:text-stone-900 transition-colors">Store Locator</a>
              </li>
            </ul>
          </div>

          {/* Service matching template */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-900">Service</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#hero" className="hover:text-stone-900 transition-colors">Contact Concierge</a>
              </li>
              <li>
                <a href="#hero" className="hover:text-stone-900 transition-colors">Express Delivery</a>
              </li>
              <li>
                <a href="#hero" className="hover:text-stone-900 transition-colors">Returns Portal</a>
              </li>
              <li>
                <a href="#hero" className="hover:text-stone-900 transition-colors">My Wardrobe Account</a>
              </li>
              <li>
                <a href="#hero" className="hover:text-stone-900 transition-colors">Loyalty Rewards</a>
              </li>
            </ul>
          </div>

          {/* Socials matching template */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-900">Socials</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-rose-600 transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="hover:text-rose-600 transition-colors">
                  Pinterest
                </a>
              </li>
              <li>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-stone-900 transition-colors">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-stone-900 transition-colors">
                  Twitter / X
                </a>
              </li>
              <li>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-stone-900 transition-colors">
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright matching template */}
        <div className="pt-8 text-center text-xs text-stone-400">
          <p>Copyright © 2026 Trendy Apparel Inc. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};
