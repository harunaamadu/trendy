import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PRODUCTS } from './src/data/initial-products';
import { INITIAL_REVIEWS } from './src/data/initial-reviews';
import {
  Product,
  Order,
  CartItem,
  ShippingAddress,
  PaymentDetails,
  Review,
  UserProfile,
  SavedAddress,
} from './src/types/ecommerce';
import { calculateOrderSummary, VALID_PROMO_CODES } from './src/lib/cart-utils';
import {
  validateLuhn,
  detectCardBrand,
  validateExpiryDate,
  validateCVV,
  validateEmail,
  generateOrderId,
  generateTransactionId,
} from './src/lib/checkout-utils';
import { adjustInventoryAfterOrder } from './src/lib/inventory-utils';
import {
  calculateRatingBreakdown,
  filterAndSortReviews,
  validateReviewSubmission,
  ReviewSortOption,
} from './src/lib/review-utils';
import {
  DEFAULT_USER_PROFILE,
  INITIAL_SAVED_ADDRESSES,
  addSavedAddress,
  updateSavedAddress,
  deleteSavedAddress,
  setDefaultAddress,
  validateUserProfile,
  validateAddressInput,
} from './src/lib/user-profile-utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory persistent database for products, reviews, user profile, saved addresses & orders
let productsDatabase: Product[] = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
let reviewsDatabase: Review[] = JSON.parse(JSON.stringify(INITIAL_REVIEWS));
let userProfileDatabase: UserProfile = JSON.parse(JSON.stringify(DEFAULT_USER_PROFILE));
let savedAddressesDatabase: SavedAddress[] = JSON.parse(JSON.stringify(INITIAL_SAVED_ADDRESSES));
const ordersDatabase: Order[] = [
  {
    id: 'TRN-884210',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
    items: [
      {
        id: 'prod-1-M-Oatmeal Heather',
        productId: 'prod-1',
        name: 'Relaxed Cashmere Crewneck',
        price: 118,
        originalPrice: 148,
        image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80',
        size: 'M',
        color: 'Oatmeal Heather',
        colorHex: '#e3dcce',
        quantity: 1,
        maxStock: 14,
      },
    ],
    subtotal: 118,
    discount: 11.8,
    shippingCost: 0,
    tax: 9.03,
    total: 115.23,
    shippingAddress: {
      fullName: 'Haruna Amadu',
      email: 'harunaamadu@gmail.com',
      phone: '+1 (555) 382-9014',
      addressLine1: '742 Evergreen Terrace',
      addressLine2: 'Apt 4B',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'United States',
      shippingMethod: 'standard',
    },
    paymentSummary: {
      cardBrand: 'Visa',
      last4: '4242',
      transactionId: 'TXN-90214812',
    },
    trackingNumber: 'TRK-982415124',
    estimatedDelivery: 'Oct 30, 2026',
  },
];

// ==========================================
// REST API ROUTES
// ==========================================

// GET /api/products - list and filter
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search, sort, minPrice, maxPrice, inStock, tag } = req.query;

  let filtered = [...productsDatabase];

  if (category && category !== 'All') {
    filtered = filtered.filter(
      (p) => p.category.toLowerCase() === String(category).toLowerCase()
    );
  }

  if (tag) {
    filtered = filtered.filter((p) => p.tags?.includes(String(tag)));
  }

  if (search) {
    const q = String(search).toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (minPrice) {
    const min = parseFloat(String(minPrice));
    if (!isNaN(min)) filtered = filtered.filter((p) => p.price >= min);
  }

  if (maxPrice) {
    const max = parseFloat(String(maxPrice));
    if (!isNaN(max)) filtered = filtered.filter((p) => p.price <= max);
  }

  if (inStock === 'true') {
    filtered = filtered.filter((p) => p.stock > 0);
  }

  // Sorting
  if (sort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'newest') {
    filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  }

  res.json({
    success: true,
    count: filtered.length,
    products: filtered,
  });
});

// GET /api/products/:id - single product
app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = productsDatabase.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }
  res.json({ success: true, product });
});

// ==========================================
// REVIEWS API
// ==========================================

// GET /api/products/:id/reviews
app.get('/api/products/:id/reviews', (req: Request, res: Response) => {
  const { id } = req.params;
  const { star, sort } = req.query;

  const productReviews = reviewsDatabase.filter((r) => r.productId === id);
  const breakdown = calculateRatingBreakdown(productReviews);

  const starFilter = star ? parseInt(String(star), 10) : null;
  const sortOption = (sort as ReviewSortOption) || 'newest';

  const filteredAndSorted = filterAndSortReviews(productReviews, starFilter, sortOption);

  res.json({
    success: true,
    productId: id,
    breakdown,
    count: filteredAndSorted.length,
    reviews: filteredAndSorted,
  });
});

// POST /api/products/:id/reviews - submit new review
app.post('/api/products/:id/reviews', (req: Request, res: Response) => {
  const { id } = req.params;
  const product = productsDatabase.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found.' });
  }

  const { authorName, authorEmail, rating, title, comment, fitFeedback } = req.body;

  const validation = validateReviewSubmission({
    authorName,
    rating: Number(rating),
    title,
    comment,
  });

  if (!validation.valid) {
    return res.status(400).json({ success: false, error: validation.error });
  }

  const newReview: Review = {
    id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    productId: id,
    authorName: String(authorName).trim(),
    authorEmail: authorEmail ? String(authorEmail).trim() : undefined,
    rating: Math.max(1, Math.min(5, Math.round(Number(rating)))),
    title: String(title).trim(),
    comment: String(comment).trim(),
    createdAt: new Date().toISOString(),
    verifiedPurchase: true,
    fitFeedback: fitFeedback || 'True to Size',
    helpfulCount: 0,
  };

  reviewsDatabase.unshift(newReview);

  // Recalculate average rating & review count for the product
  const productReviews = reviewsDatabase.filter((r) => r.productId === id);
  const breakdown = calculateRatingBreakdown(productReviews);
  product.rating = breakdown.averageRating;
  product.reviewCount = breakdown.totalReviews;

  res.status(201).json({
    success: true,
    message: 'Thank you! Your review has been published.',
    review: newReview,
    breakdown,
    updatedProduct: product,
  });
});

// POST /api/reviews/:id/helpful - vote review as helpful
app.post('/api/reviews/:id/helpful', (req: Request, res: Response) => {
  const review = reviewsDatabase.find((r) => r.id === req.params.id);
  if (!review) {
    return res.status(404).json({ success: false, error: 'Review not found.' });
  }
  review.helpfulCount = (review.helpfulCount || 0) + 1;
  res.json({ success: true, helpfulCount: review.helpfulCount });
});

// ==========================================
// USER PROFILE & SAVED ADDRESSES API
// ==========================================

// GET /api/user/profile
app.get('/api/user/profile', (_req: Request, res: Response) => {
  res.json({
    success: true,
    profile: userProfileDatabase,
    addresses: savedAddressesDatabase,
  });
});

// PUT /api/user/profile
app.put('/api/user/profile', (req: Request, res: Response) => {
  const validation = validateUserProfile(req.body);
  if (!validation.valid) {
    return res.status(400).json({ success: false, error: validation.error });
  }

  userProfileDatabase = {
    ...userProfileDatabase,
    ...req.body,
  };

  res.json({
    success: true,
    message: 'Profile details updated successfully.',
    profile: userProfileDatabase,
  });
});

// GET /api/user/addresses
app.get('/api/user/addresses', (_req: Request, res: Response) => {
  res.json({ success: true, addresses: savedAddressesDatabase });
});

// POST /api/user/addresses
app.post('/api/user/addresses', (req: Request, res: Response) => {
  const validation = validateAddressInput(req.body);
  if (!validation.valid) {
    return res.status(400).json({ success: false, error: validation.error });
  }

  savedAddressesDatabase = addSavedAddress(savedAddressesDatabase, req.body);
  res.status(201).json({
    success: true,
    message: 'Address saved successfully.',
    addresses: savedAddressesDatabase,
  });
});

// PUT /api/user/addresses/:id
app.put('/api/user/addresses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = savedAddressesDatabase.find((a) => a.id === id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Address not found.' });
  }

  savedAddressesDatabase = updateSavedAddress(savedAddressesDatabase, id, req.body);
  res.json({
    success: true,
    message: 'Address updated successfully.',
    addresses: savedAddressesDatabase,
  });
});

// DELETE /api/user/addresses/:id
app.delete('/api/user/addresses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  savedAddressesDatabase = deleteSavedAddress(savedAddressesDatabase, id);
  res.json({
    success: true,
    message: 'Address removed.',
    addresses: savedAddressesDatabase,
  });
});

// GET /api/inventory - stats & list for inventory management
app.get('/api/inventory', (_req: Request, res: Response) => {
  const totalSkus = productsDatabase.length;
  const totalUnits = productsDatabase.reduce((acc, p) => acc + p.stock, 0);
  const lowStockCount = productsDatabase.filter(
    (p) => p.stock > 0 && p.stock <= p.lowStockThreshold
  ).length;
  const outOfStockCount = productsDatabase.filter((p) => p.stock <= 0).length;
  const totalValue = Number(
    productsDatabase.reduce((acc, p) => acc + p.stock * p.price, 0).toFixed(2)
  );

  res.json({
    success: true,
    stats: {
      totalSkus,
      totalUnits,
      lowStockCount,
      outOfStockCount,
      totalValue,
    },
    inventory: productsDatabase.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      status: p.stock <= 0 ? 'out_of_stock' : p.stock <= p.lowStockThreshold ? 'low_stock' : 'in_stock',
      image: p.images[0],
    })),
  });
});

// POST /api/inventory/update - update product stock / price
app.post('/api/inventory/update', (req: Request, res: Response) => {
  const { productId, stock, lowStockThreshold, price } = req.body;

  const product = productsDatabase.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  if (typeof stock === 'number' && stock >= 0) {
    product.stock = Math.floor(stock);
  }
  if (typeof lowStockThreshold === 'number' && lowStockThreshold >= 1) {
    product.lowStockThreshold = Math.floor(lowStockThreshold);
  }
  if (typeof price === 'number' && price > 0) {
    product.price = Number(price.toFixed(2));
  }

  res.json({
    success: true,
    product,
    message: `Updated inventory for ${product.name} (SKU: ${product.sku}). Stock: ${product.stock}`,
  });
});

// POST /api/inventory/reset - reset demo data
app.post('/api/inventory/reset', (_req: Request, res: Response) => {
  productsDatabase = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
  res.json({ success: true, message: 'Inventory reset to initial factory values.' });
});

// POST /api/checkout - secure payment & order placement
app.post('/api/checkout', (req: Request, res: Response) => {
  const { items, shippingAddress, paymentDetails, promoCode } = req.body as {
    items: CartItem[];
    shippingAddress: ShippingAddress;
    paymentDetails: PaymentDetails;
    promoCode?: string;
  };

  // 1. Validate cart items
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Your cart is empty.' });
  }

  // 2. Validate shipping address
  if (!shippingAddress) {
    return res.status(400).json({ success: false, error: 'Shipping details are missing.' });
  }

  const { fullName, email, addressLine1, city, state, zipCode, shippingMethod = 'standard' } = shippingAddress;
  if (!fullName || !email || !addressLine1 || !city || !state || !zipCode) {
    return res.status(400).json({
      success: false,
      error: 'Please complete all required shipping address fields.',
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
  }

  // 3. Validate payment details
  if (!paymentDetails) {
    return res.status(400).json({ success: false, error: 'Payment details are missing.' });
  }

  const { cardNumber, cardholderName, expiryDate, cvv } = paymentDetails;
  if (!cardNumber || !cardholderName || !expiryDate || !cvv) {
    return res.status(400).json({ success: false, error: 'All payment fields are required.' });
  }

  const sanitizedCard = cardNumber.replace(/\D/g, '');
  if (!validateLuhn(sanitizedCard)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid credit card number. Failed Luhn checksum validation.',
    });
  }

  if (!validateExpiryDate(expiryDate)) {
    return res.status(400).json({
      success: false,
      error: 'Card expiration date is invalid or in the past (format MM/YY).',
    });
  }

  const cardBrand = detectCardBrand(sanitizedCard);
  if (!validateCVV(cvv, cardBrand)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid CVV security code.',
    });
  }

  // 4. Validate and resolve promo code
  const promo = promoCode && VALID_PROMO_CODES[promoCode.toUpperCase()] ? VALID_PROMO_CODES[promoCode.toUpperCase()] : null;

  // 5. Check and decrement live inventory
  const inventoryResult = adjustInventoryAfterOrder(productsDatabase, items);
  if (!inventoryResult.success) {
    return res.status(409).json({
      success: false,
      error: inventoryResult.error || 'One or more items in your cart is currently out of stock.',
    });
  }

  // Update master catalog
  productsDatabase = inventoryResult.updatedProducts;

  // 6. Calculate verified totals
  const summary = calculateOrderSummary(items, promo, shippingMethod);

  // 7. Generate order details
  const orderId = generateOrderId();
  const transactionId = generateTransactionId();
  const last4 = sanitizedCard.slice(-4);
  const now = new Date();
  const deliveryDays = shippingMethod === 'overnight' ? 1 : shippingMethod === 'express' ? 2 : 4;
  const estimatedDelivery = new Date(now.getTime() + deliveryDays * 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const newOrder: Order = {
    id: orderId,
    createdAt: now.toISOString(),
    status: 'confirmed',
    items,
    subtotal: summary.subtotal,
    discount: summary.discount,
    shippingCost: summary.shipping,
    tax: summary.tax,
    total: summary.total,
    shippingAddress,
    paymentSummary: {
      cardBrand,
      last4,
      transactionId,
    },
    trackingNumber: `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`,
    estimatedDelivery,
  };

  ordersDatabase.unshift(newOrder);

  // Simulated gateway confirmation
  res.json({
    success: true,
    order: newOrder,
    message: 'Payment authorized and order confirmed successfully.',
  });
});

// GET /api/orders - past orders
app.get('/api/orders', (_req: Request, res: Response) => {
  res.json({ success: true, count: ordersDatabase.length, orders: ordersDatabase });
});

// GET /api/orders/:id - lookup single order
app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = ordersDatabase.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  res.json({ success: true, order });
});

// ==========================================
// VITE OR STATIC SERVING
// ==========================================
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Trendy Server] Running full stack server on http://0.0.0.0:${PORT}`);
  });
}

startServer();
