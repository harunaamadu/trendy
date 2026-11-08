export type ProductCategory = 'All' | 'Women' | 'Men' | 'Knitwear' | 'Outerwear' | 'Accessories';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  description: string;
  details: string[];
  fabric: string;
  care: string;
  sustainability: string;
  images: string[];
  colors: {
    name: string;
    hex: string;
    image?: string;
  }[];
  sizes: ('XS' | 'S' | 'M' | 'L' | 'XL')[];
  stock: number;
  lowStockThreshold: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isTopRated?: boolean;
  isOnSale?: boolean;
  tags?: string[];
}

export interface CartItem {
  id: string; // unique item instance id: `${productId}-${size}-${color}`
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  size: string;
  color: string;
  colorHex: string;
  quantity: number;
  maxStock: number;
}

export interface PromoCode {
  code: string;
  discountPercent?: number;
  discountFixed?: number;
  freeShipping?: boolean;
  minSpend?: number;
  description: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  shippingMethod: 'standard' | 'express' | 'overnight';
}

export interface PaymentDetails {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string; // MM/YY
  cvv: string;
  billingSameAsShipping: boolean;
}

export interface Order {
  id: string;
  createdAt: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentSummary: {
    cardBrand: string;
    last4: string;
    transactionId: string;
  };
  trackingNumber: string;
  estimatedDelivery: string;
}

export interface InventoryStats {
  totalSkus: number;
  totalUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
}

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  authorEmail?: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
  fitFeedback?: 'Runs Small' | 'True to Size' | 'Runs Large';
  helpfulCount: number;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  preferredSize: 'XS' | 'S' | 'M' | 'L' | 'XL';
  stylePreference: string;
  marketingEmails: boolean;
  smsUpdates: boolean;
}

export interface SavedAddress {
  id: string;
  label: string; // e.g., 'Home', 'Office'
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}
