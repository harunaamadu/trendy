import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getRecommendations } from './recommendation-utils';
import { Product, CartItem } from '../types/ecommerce';

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    sku: 'TRN-101',
    name: 'Cashmere Crewneck',
    category: 'Knitwear',
    price: 118,
    rating: 4.9,
    reviewCount: 42,
    description: '',
    details: [],
    fabric: 'Cashmere',
    care: '',
    sustainability: '',
    images: ['img1.jpg'],
    colors: [{ name: 'Oatmeal', hex: '#fff' }],
    sizes: ['M'],
    stock: 10,
    lowStockThreshold: 2,
    isBestSeller: true,
    tags: ['Cashmere', 'Warm'],
  },
  {
    id: 'prod-2',
    sku: 'TRN-102',
    name: 'Wool Overcoat',
    category: 'Outerwear',
    price: 245,
    rating: 5.0,
    reviewCount: 56,
    description: '',
    details: [],
    fabric: 'Wool',
    care: '',
    sustainability: '',
    images: ['img2.jpg'],
    colors: [{ name: 'Camel', hex: '#000' }],
    sizes: ['M'],
    stock: 5,
    lowStockThreshold: 2,
    tags: ['Warm', 'Minimal'],
  },
  {
    id: 'prod-3',
    sku: 'TRN-103',
    name: 'Wide-Leg Trousers',
    category: 'Men',
    price: 95,
    rating: 4.8,
    reviewCount: 20,
    description: '',
    details: [],
    fabric: 'Wool Blend',
    care: '',
    sustainability: '',
    images: ['img3.jpg'],
    colors: [{ name: 'Navy', hex: '#000' }],
    sizes: ['M'],
    stock: 8,
    lowStockThreshold: 2,
  },
  {
    id: 'prod-4',
    sku: 'TRN-104',
    name: 'Leather Belt',
    category: 'Accessories',
    price: 45,
    rating: 4.9,
    reviewCount: 15,
    description: '',
    details: [],
    fabric: 'Leather',
    care: '',
    sustainability: '',
    images: ['img4.jpg'],
    colors: [{ name: 'Black', hex: '#000' }],
    sizes: ['M'],
    stock: 0, // out of stock
    lowStockThreshold: 2,
  },
];

describe('Product Recommendation Engine', () => {
  it('excludes currently viewed product from recommendations', () => {
    const recs = getRecommendations({
      currentProduct: mockProducts[0],
      allProducts: mockProducts,
    });

    assert.ok(recs.every((r) => r.product.id !== 'prod-1'));
  });

  it('prioritizes recently viewed products with appropriate reason tag', () => {
    const recs = getRecommendations({
      currentProduct: mockProducts[0],
      allProducts: mockProducts,
      recentlyViewedIds: ['prod-3'],
    });

    const foundRecentlyViewed = recs.find((r) => r.product.id === 'prod-3');
    assert.ok(foundRecentlyViewed);
    assert.equal(foundRecentlyViewed.reason, 'recently-viewed');
  });

  it('boosts products that pair well with items in the cart', () => {
    const cart: CartItem[] = [
      {
        id: 'cart-1',
        productId: 'prod-1', // Knitwear
        name: 'Cashmere Crewneck',
        price: 118,
        image: 'img1.jpg',
        size: 'M',
        color: 'Oatmeal',
        colorHex: '#fff',
        quantity: 1,
        maxStock: 10,
      },
    ];

    const recs = getRecommendations({
      currentProduct: mockProducts[2],
      allProducts: mockProducts,
      cartItems: cart,
    });

    // Outerwear (prod-2) complements Knitwear in cart
    const coatRec = recs.find((r) => r.product.id === 'prod-2');
    assert.ok(coatRec);
    assert.equal(coatRec.reason, 'cart-match');
  });

  it('penalizes out of stock items in ranking', () => {
    const recs = getRecommendations({
      currentProduct: mockProducts[0],
      allProducts: mockProducts,
    });

    // prod-4 is out of stock (stock: 0)
    if (recs.length > 2) {
      assert.notEqual(recs[0].product.id, 'prod-4');
    }
  });
});
