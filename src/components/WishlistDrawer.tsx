import React from 'react';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { Sheet } from './ui/sheet';
import { Button } from './ui/button';
import { useShop } from '../context/ShopContext';

export const WishlistDrawer: React.FC = () => {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlist,
    products,
    toggleWishlist,
    addToCart,
    setIsCartOpen,
  } = useShop();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleMoveToBag = (product: any) => {
    const success = addToCart(
      product,
      product.sizes[0] || 'M',
      product.colors[0]?.name || 'Standard',
      product.colors[0]?.hex || '#000',
      1
    );
    if (success) {
      toggleWishlist(product.id);
      setIsWishlistOpen(false);
      setIsCartOpen(true);
    }
  };

  return (
    <Sheet
      open={isWishlistOpen}
      onOpenChange={setIsWishlistOpen}
      title="Saved Wishlist"
      description={`${wishlistedProducts.length} items saved for later`}
    >
      {wishlistedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full py-16 text-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center">
            <Heart className="h-10 w-10" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-900">Your wishlist is empty</h3>
            <p className="text-xs text-stone-500 max-w-xs mt-1">
              Tap the heart icon on any garment to save your favorites for later.
            </p>
          </div>
          <Button
            variant="default"
            onClick={() => setIsWishlistOpen(false)}
            className="mt-4 px-6 text-xs uppercase tracking-wider"
          >
            Explore Catalog
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {wishlistedProducts.map((p) => {
            const isOut = p.stock <= 0;
            return (
              <div
                key={p.id}
                className="flex gap-4 p-3 rounded-2xl border border-stone-100 bg-white shadow-xs items-center"
              >
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="h-20 w-16 rounded-xl object-cover bg-stone-100 shrink-0"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-xs font-semibold text-stone-900 truncate">{p.name}</h4>
                  <div className="text-xs font-bold text-stone-900">
                    ${p.price.toFixed(2)}
                  </div>
                  <div className="text-[11px]">
                    {isOut ? (
                      <span className="text-rose-500 font-medium">Sold Out</span>
                    ) : (
                      <span className="text-emerald-700 font-medium">In Stock ({p.stock})</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="default"
                    disabled={isOut}
                    onClick={() => handleMoveToBag(p)}
                    className="text-[11px] px-3 py-1.5 flex items-center gap-1"
                  >
                    <ShoppingBag className="h-3 w-3" />
                    <span>Move to Bag</span>
                  </Button>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="text-[11px] text-stone-400 hover:text-rose-600 flex items-center justify-center gap-1 py-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Sheet>
  );
};
