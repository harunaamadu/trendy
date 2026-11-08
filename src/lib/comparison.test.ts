import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canAddToComparison,
  toggleComparisonItem,
  computeComparisonDifferences,
  MAX_COMPARE_PRODUCTS,
} from './comparison-utils';
import { Product } from '../types/ecommerce';

test('Comparison item management: add, remove, and max limit enforcement', () => {
  let list: string[] = [];

  // Adding items
  const r1 = toggleComparisonItem(list, 'prod-1');
  assert.equal(r1.action, 'added');
  assert.deepEqual(r1.updatedIds, ['prod-1']);
  list = r1.updatedIds;

  const r2 = toggleComparisonItem(list, 'prod-2');
  assert.equal(r2.action, 'added');
  list = r2.updatedIds;

  const r3 = toggleComparisonItem(list, 'prod-3');
  assert.equal(r3.action, 'added');
  list = r3.updatedIds;

  const r4 = toggleComparisonItem(list, 'prod-4');
  assert.equal(r4.action, 'added');
  list = r4.updatedIds;
  assert.equal(list.length, MAX_COMPARE_PRODUCTS);

  // Exceeding limit
  assert.equal(canAddToComparison(list, 'prod-5'), false);
  const r5 = toggleComparisonItem(list, 'prod-5');
  assert.equal(r5.action, 'limit_reached');
  assert.equal(r5.updatedIds.length, 4);

  // Removing an existing item
  assert.equal(canAddToComparison(list, 'prod-2'), true);
  const rRemove = toggleComparisonItem(list, 'prod-2');
  assert.equal(rRemove.action, 'removed');
  assert.deepEqual(rRemove.updatedIds, ['prod-1', 'prod-3', 'prod-4']);
});

test('Comparison difference detection: highlights divergent product attributes', () => {
  const p1: Product = {
    id: 'p1',
    sku: 'TRN-101',
    name: 'Cashmere Crew',
    category: 'Knitwear',
    price: 118,
    rating: 4.9,
    reviewCount: 42,
    description: '',
    details: [],
    fabric: '100% Cashmere',
    care: 'Hand wash cold',
    sustainability: 'OEKO-TEX Certified',
    images: ['img1'],
    colors: [],
    sizes: ['M', 'L'],
    stock: 14,
    lowStockThreshold: 5,
  };

  const p2: Product = {
    id: 'p2',
    sku: 'TRN-102',
    name: 'Wool Overcoat',
    category: 'Outerwear',
    price: 245,
    rating: 5.0,
    reviewCount: 56,
    description: '',
    details: [],
    fabric: 'Recycled Wool',
    care: 'Dry clean only',
    sustainability: 'GRS Certified',
    images: ['img2'],
    colors: [],
    sizes: ['S', 'M', 'L'],
    stock: 4,
    lowStockThreshold: 5,
  };

  // Compare 2 different products
  const diffs = computeComparisonDifferences([p1, p2]);
  assert.equal(diffs.price, true);
  assert.equal(diffs.category, true);
  assert.equal(diffs.fabric, true);
  assert.equal(diffs.care, true);
  assert.equal(diffs.sustainability, true);
  assert.equal(diffs.stock, true);
  assert.equal(diffs.rating, true);

  // Compare identical products (clones)
  const cloneP1: Product = { ...p1, id: 'p1-clone' };
  const sameDiffs = computeComparisonDifferences([p1, cloneP1]);
  assert.equal(sameDiffs.price, false);
  assert.equal(sameDiffs.category, false);
  assert.equal(sameDiffs.fabric, false);
  assert.equal(sameDiffs.care, false);
  assert.equal(sameDiffs.sustainability, false);
});
