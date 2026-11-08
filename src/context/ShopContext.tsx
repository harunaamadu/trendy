import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  CartItem,
  PromoCode,
  Order,
  ShippingAddress,
  PaymentDetails,
  ProductCategory,
  UserProfile,
  SavedAddress,
  Review,
} from '../types/ecommerce';
import { VALID_PROMO_CODES } from '../lib/cart-utils';
import { INITIAL_PRODUCTS } from '../data/initial-products';
import { toggleComparisonItem, MAX_COMPARE_PRODUCTS } from '../lib/comparison-utils';
import {
  DEFAULT_USER_PROFILE,
  INITIAL_SAVED_ADDRESSES,
  addSavedAddress,
  updateSavedAddress,
  deleteSavedAddress,
  setDefaultAddress,
} from '../lib/user-profile-utils';

interface ShopContextType {
  products: Product[];
  isLoadingProducts: boolean;
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  activeCategory: ProductCategory;
  setActiveCategory: (cat: ProductCategory) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  promoCode: PromoCode | null;
  promoError: string | null;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  addToCart: (product: Product, size: string, color: string, colorHex: string, quantity?: number) => boolean;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  // Modal visibility states
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isInventoryManagerOpen: boolean;
  setIsInventoryManagerOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  lastCompletedOrder: Order | null;
  setLastCompletedOrder: (order: Order | null) => void;
  // Product Comparison
  compareList: string[];
  isCompareOpen: boolean;
  setIsCompareOpen: (open: boolean) => void;
  toggleCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
  // User Profile & Addresses
  userProfile: UserProfile;
  savedAddresses: SavedAddress[];
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<boolean>;
  saveAddress: (address: Omit<SavedAddress, 'id'>) => Promise<boolean>;
  updateAddress: (id: string, address: Partial<SavedAddress>) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  setDefaultShippingAddress: (id: string) => Promise<boolean>;
  // Reviews
  submitProductReview: (
    productId: string,
    review: {
      authorName: string;
      authorEmail?: string;
      rating: number;
      title: string;
      comment: string;
      fitFeedback?: 'Runs Small' | 'True to Size' | 'Runs Large';
    }
  ) => Promise<{ success: boolean; review?: Review; error?: string }>;
  voteReviewHelpful: (reviewId: string) => Promise<boolean>;
  // Recently Viewed & Recommendations
  recentlyViewed: string[];
  addToRecentlyViewed: (productId: string) => void;
  // Actions
  refreshProducts: () => Promise<void>;
  updateInventoryStock: (productId: string, stock: number, lowStockThreshold?: number, price?: number) => Promise<boolean>;
  resetInventory: () => Promise<void>;
  submitCheckout: (
    shippingAddress: ShippingAddress,
    paymentDetails: PaymentDetails
  ) => Promise<{ success: boolean; order?: Order; error?: string }>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('trendy_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('trendy_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [promoCode, setPromoCode] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isInventoryManagerOpen, setIsInventoryManagerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('trendy_user_profile');
      return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  });
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => {
    try {
      const saved = localStorage.getItem('trendy_saved_addresses');
      return saved ? JSON.parse(saved) : INITIAL_SAVED_ADDRESSES;
    } catch {
      return INITIAL_SAVED_ADDRESSES;
    }
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Recently viewed products history
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('trendy_recently_viewed');
      return saved ? JSON.parse(saved) : ['prod-1', 'prod-2', 'prod-3'];
    } catch {
      return ['prod-1', 'prod-2', 'prod-3'];
    }
  });

  const addToRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      const updated = [productId, ...filtered].slice(0, 10);
      try {
        localStorage.setItem('trendy_recently_viewed', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  }, []);

  const handleSetQuickViewProduct = useCallback((product: Product | null) => {
    setQuickViewProduct(product);
    if (product) {
      addToRecentlyViewed(product.id);
    }
  }, [addToRecentlyViewed]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('trendy_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Save wishlist to local storage
  useEffect(() => {
    try {
      localStorage.setItem('trendy_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Save profile and addresses to local storage
  useEffect(() => {
    try {
      localStorage.setItem('trendy_user_profile', JSON.stringify(userProfile));
    } catch (e) {
      console.error(e);
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('trendy_saved_addresses', JSON.stringify(savedAddresses));
    } catch (e) {
      console.error(e);
    }
  }, [savedAddresses]);

  // Fetch products from server
  const refreshProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.products) {
          setProducts(data.products);
        }
      }
    } catch (err) {
      console.error('Failed to load products from API:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  // Add to cart with live inventory verification
  const addToCart = (
    product: Product,
    size: string,
    color: string,
    colorHex: string,
    quantity: number = 1
  ): boolean => {
    // Current stock check
    const currentProd = products.find((p) => p.id === product.id) || product;
    if (currentProd.stock <= 0) {
      showToast(`${currentProd.name} is currently out of stock.`);
      return false;
    }

    const itemId = `${product.id}-${size}-${color}`;
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === itemId);
      const currentQty = existing ? existing.quantity : 0;
      const newQty = currentQty + quantity;

      if (newQty > currentProd.stock) {
        showToast(`Cannot add more. Only ${currentProd.stock} units available in stock.`);
        return prevCart;
      }

      if (existing) {
        return prevCart.map((i) =>
          i.id === itemId
            ? { ...i, quantity: newQty, maxStock: currentProd.stock }
            : i
        );
      } else {
        return [
          ...prevCart,
          {
            id: itemId,
            productId: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.images[0],
            size,
            color,
            colorHex,
            quantity,
            maxStock: currentProd.stock,
          },
        ];
      }
    });

    showToast(`Added ${product.name} (${size}) to your bag`);
    return true;
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === itemId) {
          const clampedQty = Math.min(quantity, item.maxStock);
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((i) => i.id !== itemId));
    showToast('Item removed from your bag');
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        showToast('Removed from your wishlist');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to your wishlist');
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const toggleCompare = (productId: string) => {
    const result = toggleComparisonItem(compareList, productId, MAX_COMPARE_PRODUCTS);
    if (result.action === 'limit_reached') {
      showToast(`Comparison limited to maximum ${MAX_COMPARE_PRODUCTS} products at a time`);
      return;
    }
    setCompareList(result.updatedIds);
    if (result.action === 'added') {
      const prod = products.find((p) => p.id === productId);
      showToast(`Added ${prod?.name || 'product'} to comparison list`);
    } else {
      showToast('Removed product from comparison');
    }
  };

  const isInCompare = (productId: string) => compareList.includes(productId);

  const clearCompare = () => {
    setCompareList([]);
    showToast('Cleared comparison list');
  };

  const applyPromoCode = (code: string): boolean => {
    setPromoError(null);
    const upper = code.trim().toUpperCase();
    const found = VALID_PROMO_CODES[upper];
    if (found) {
      setPromoCode(found);
      showToast(`Promo code '${upper}' applied successfully!`);
      return true;
    } else {
      setPromoError('Invalid promo code. Try TRENDY10 or FREESHIP');
      showToast('Invalid promo code');
      return false;
    }
  };

  const removePromoCode = () => {
    setPromoCode(null);
    setPromoError(null);
  };

  // Admin inventory update
  const updateInventoryStock = async (
    productId: string,
    stock: number,
    lowStockThreshold?: number,
    price?: number
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/inventory/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, stock, lowStockThreshold, price }),
      });
      if (res.ok) {
        await refreshProducts();
        showToast(`Stock updated successfully`);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const resetInventory = async () => {
    try {
      await fetch('/api/inventory/reset', { method: 'POST' });
      await refreshProducts();
      showToast('Inventory reset to initial factory values');
    } catch (e) {
      console.error(e);
    }
  };

  // Submit checkout
  const submitCheckout = async (
    shippingAddress: ShippingAddress,
    paymentDetails: PaymentDetails
  ): Promise<{ success: boolean; order?: Order; error?: string }> => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          shippingAddress,
          paymentDetails,
          promoCode: promoCode?.code,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Payment failed to process.' };
      }

      // Order success!
      setOrders((prev) => [data.order, ...prev]);
      setLastCompletedOrder(data.order);
      clearCart();
      await refreshProducts(); // refresh live stock
      return { success: true, order: data.order };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during payment.' };
    }
  };

  // Initial orders & profile fetching
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      }
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    }
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.profile) setUserProfile(data.profile);
          if (data.addresses) setSavedAddresses(data.addresses);
        }
      }
    } catch (e) {
      console.error('Failed to fetch user profile:', e);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchUserProfile();
  }, [fetchOrders, fetchUserProfile]);

  const updateProfile = async (patch: Partial<UserProfile>): Promise<boolean> => {
    try {
      const updated = { ...userProfile, ...patch };
      setUserProfile(updated);
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      showToast('Profile details updated successfully');
      return true;
    } catch {
      showToast('Profile updated locally');
      return true;
    }
  };

  const saveAddress = async (newAddr: Omit<SavedAddress, 'id'>): Promise<boolean> => {
    try {
      const updatedList = addSavedAddress(savedAddresses, newAddr);
      setSavedAddresses(updatedList);
      await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddr),
      });
      showToast('New shipping address saved');
      return true;
    } catch {
      showToast('Address saved');
      return true;
    }
  };

  const updateAddress = async (id: string, patch: Partial<SavedAddress>): Promise<boolean> => {
    try {
      const updatedList = updateSavedAddress(savedAddresses, id, patch);
      setSavedAddresses(updatedList);
      await fetch(`/api/user/addresses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      showToast('Address updated');
      return true;
    } catch {
      showToast('Address updated');
      return true;
    }
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    try {
      const updatedList = deleteSavedAddress(savedAddresses, id);
      setSavedAddresses(updatedList);
      await fetch(`/api/user/addresses/${id}`, { method: 'DELETE' });
      showToast('Address removed');
      return true;
    } catch {
      showToast('Address removed');
      return true;
    }
  };

  const setDefaultShippingAddress = async (id: string): Promise<boolean> => {
    try {
      const updatedList = setDefaultAddress(savedAddresses, id);
      setSavedAddresses(updatedList);
      await fetch(`/api/user/addresses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      showToast('Default shipping address updated');
      return true;
    } catch {
      showToast('Default address set');
      return true;
    }
  };

  const submitProductReview = async (
    productId: string,
    reviewInput: {
      authorName: string;
      authorEmail?: string;
      rating: number;
      title: string;
      comment: string;
      fitFeedback?: 'Runs Small' | 'True to Size' | 'Runs Large';
    }
  ): Promise<{ success: boolean; review?: Review; error?: string }> => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewInput),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to submit review.' };
      }
      if (data.updatedProduct) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? data.updatedProduct : p))
        );
      }
      showToast('Review submitted! Thank you for your feedback.');
      return { success: true, review: data.review };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error while submitting review.' };
    }
  };

  const voteReviewHelpful = async (reviewId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' });
      if (res.ok) {
        showToast('Marked as helpful');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        isLoadingProducts,
        cart,
        wishlist,
        orders,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        promoCode,
        promoError,
        applyPromoCode,
        removePromoCode,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isWishlisted,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isInventoryManagerOpen,
        setIsInventoryManagerOpen,
        isSearchOpen,
        setIsSearchOpen,
        quickViewProduct,
        setQuickViewProduct: handleSetQuickViewProduct,
        recentlyViewed,
        addToRecentlyViewed,
        lastCompletedOrder,
        setLastCompletedOrder,
        compareList,
        isCompareOpen,
        setIsCompareOpen,
        toggleCompare,
        isInCompare,
        clearCompare,
        userProfile,
        savedAddresses,
        isProfileOpen,
        setIsProfileOpen,
        updateProfile,
        saveAddress,
        updateAddress,
        deleteAddress,
        setDefaultShippingAddress,
        submitProductReview,
        voteReviewHelpful,
        refreshProducts,
        updateInventoryStock,
        resetInventory,
        submitCheckout,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
