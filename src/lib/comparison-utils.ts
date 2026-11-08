import { Product } from '../types/ecommerce';

export const MAX_COMPARE_PRODUCTS = 4;

export function canAddToComparison(currentIds: string[], productId: string, maxItems: number = MAX_COMPARE_PRODUCTS): boolean {
  if (currentIds.includes(productId)) return true; // can toggle off
  return currentIds.length < maxItems;
}

export function toggleComparisonItem(
  currentIds: string[],
  productId: string,
  maxItems: number = MAX_COMPARE_PRODUCTS
): { updatedIds: string[]; action: 'added' | 'removed' | 'limit_reached' } {
  if (currentIds.includes(productId)) {
    return {
      updatedIds: currentIds.filter((id) => id !== productId),
      action: 'removed',
    };
  }

  if (currentIds.length >= maxItems) {
    return {
      updatedIds: currentIds,
      action: 'limit_reached',
    };
  }

  return {
    updatedIds: [...currentIds, productId],
    action: 'added',
  };
}

export interface AttributeDifference {
  price: boolean;
  category: boolean;
  fabric: boolean;
  care: boolean;
  sustainability: boolean;
  stock: boolean;
  rating: boolean;
}

export function computeComparisonDifferences(products: Product[]): AttributeDifference {
  if (products.length <= 1) {
    return {
      price: false,
      category: false,
      fabric: false,
      care: false,
      sustainability: false,
      stock: false,
      rating: false,
    };
  }

  const first = products[0];

  const priceDiff = products.some((p) => p.price !== first.price);
  const categoryDiff = products.some((p) => p.category !== first.category);
  const fabricDiff = products.some((p) => p.fabric !== first.fabric);
  const careDiff = products.some((p) => p.care !== first.care);
  const sustainabilityDiff = products.some((p) => p.sustainability !== first.sustainability);
  const stockDiff = products.some((p) => p.stock !== first.stock);
  const ratingDiff = products.some((p) => p.rating !== first.rating);

  return {
    price: priceDiff,
    category: categoryDiff,
    fabric: fabricDiff,
    care: careDiff,
    sustainability: sustainabilityDiff,
    stock: stockDiff,
    rating: ratingDiff,
  };
}
