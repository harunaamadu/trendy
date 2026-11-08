import { CartItem, Product } from '../types/ecommerce';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export function getStockStatus(stock: number, lowStockThreshold: number = 5): StockStatus {
  if (stock <= 0) return 'out_of_stock';
  if (stock <= lowStockThreshold) return 'low_stock';
  return 'in_stock';
}

export function getStockBadgeLabel(stock: number, lowStockThreshold: number = 5): {
  label: string;
  variant: 'default' | 'warning' | 'danger';
} {
  const status = getStockStatus(stock, lowStockThreshold);
  switch (status) {
    case 'out_of_stock':
      return { label: 'Sold Out', variant: 'danger' };
    case 'low_stock':
      return { label: `Only ${stock} left!`, variant: 'warning' };
    case 'in_stock':
      return { label: `${stock} in stock`, variant: 'default' };
  }
}

export function canAddQuantity(currentInCart: number, quantityToAdd: number, availableStock: number): boolean {
  if (availableStock <= 0) return false;
  return currentInCart + quantityToAdd <= availableStock;
}

export function adjustInventoryAfterOrder(
  products: Product[],
  orderItems: CartItem[]
): {
  updatedProducts: Product[];
  success: boolean;
  error?: string;
} {
  const productMap = new Map(products.map((p) => [p.id, { ...p }]));

  for (const item of orderItems) {
    const product = productMap.get(item.productId);
    if (!product) {
      return {
        updatedProducts: products,
        success: false,
        error: `Product ${item.name} not found in catalog.`,
      };
    }
    if (product.stock < item.quantity) {
      return {
        updatedProducts: products,
        success: false,
        error: `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${item.quantity}.`,
      };
    }
    product.stock -= item.quantity;
  }

  return {
    updatedProducts: Array.from(productMap.values()),
    success: true,
  };
}
