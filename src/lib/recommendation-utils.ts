import { Product, CartItem } from '../types/ecommerce';

export type RecommendationReason =
  | 'cart-match'
  | 'recently-viewed'
  | 'complete-look'
  | 'style-match'
  | 'trending';

export interface RecommendedProductItem {
  product: Product;
  reason: RecommendationReason;
  reasonText: string;
  score: number;
}

// Complementary categories mapping for cohesive outfit building
const COMPLEMENTARY_CATEGORIES: Record<string, string[]> = {
  Knitwear: ['Outerwear', 'Accessories', 'Women', 'Men'],
  Outerwear: ['Knitwear', 'Accessories', 'Men', 'Women'],
  Accessories: ['Knitwear', 'Outerwear', 'Women', 'Men'],
  Women: ['Accessories', 'Knitwear', 'Outerwear'],
  Men: ['Accessories', 'Knitwear', 'Outerwear'],
  All: ['Knitwear', 'Outerwear', 'Accessories'],
};

export function getRecommendations(params: {
  currentProduct?: Product | null;
  allProducts: Product[];
  cartItems?: CartItem[];
  recentlyViewedIds?: string[];
  limit?: number;
}): RecommendedProductItem[] {
  const {
    currentProduct,
    allProducts,
    cartItems = [],
    recentlyViewedIds = [],
    limit = 4,
  } = params;

  if (allProducts.length === 0) return [];

  const currentId = currentProduct?.id;
  const cartProductIds = new Set(cartItems.map((c) => c.productId));
  const recentlyViewedSet = new Set(recentlyViewedIds);

  const scored: RecommendedProductItem[] = [];

  for (const product of allProducts) {
    // Never recommend the currently viewed item to itself
    if (product.id === currentId) continue;

    let score = 0;
    let reason: RecommendationReason = 'trending';
    let reasonText = 'Popular this season';

    // 1. Check if product is in recently viewed
    if (recentlyViewedSet.has(product.id)) {
      score += 45;
      reason = 'recently-viewed';
      reasonText = 'Recently viewed';
    }

    // 2. Check if product complements current cart contents
    const cartCategories = cartItems.map((item) => {
      const p = allProducts.find((x) => x.id === item.productId);
      return p?.category;
    });

    if (cartCategories.some((cat) => cat && COMPLEMENTARY_CATEGORIES[cat]?.includes(product.category))) {
      score += 40;
      reason = 'cart-match';
      reasonText = 'Pairs with your bag';
    }

    // 3. Check if product complements currently viewed product
    if (currentProduct) {
      const compCats = COMPLEMENTARY_CATEGORIES[currentProduct.category] || [];
      if (compCats.includes(product.category)) {
        score += 30;
        if (reason !== 'cart-match' && reason !== 'recently-viewed') {
          reason = 'complete-look';
          reasonText = 'Complete the look';
        }
      }

      // Shared tags or fabric aesthetic
      if (currentProduct.tags && product.tags) {
        const sharedTags = currentProduct.tags.filter((t) => product.tags?.includes(t));
        if (sharedTags.length > 0) {
          score += sharedTags.length * 15;
          if (reason !== 'cart-match' && reason !== 'recently-viewed') {
            reason = 'style-match';
            reasonText = `Matching ${sharedTags[0]} style`;
          }
        }
      }
    }

    // 4. Rating & Best Seller bias
    if (product.rating >= 4.9) {
      score += 15;
    }
    if (product.isBestSeller) {
      score += 10;
    }

    // 5. In-stock check: prioritize available garments
    if (product.stock <= 0) {
      score -= 50;
    }

    scored.push({
      product,
      reason,
      reasonText,
      score,
    });
  }

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}
