import { calculateCartPricing } from '../../server/pricing';
import type { CartDTO, CartItemDTO, OrderDTO, ProductSummaryDTO, ProfileDTO } from '../../shared/types';
import { DEMO_PRODUCTS } from './sampleData';

const CART_KEY = 'kk_demo_cart_v1';
const WISHLIST_KEY = 'kk_demo_wishlist_v1';
const ORDERS_KEY = 'kk_demo_orders_v1';
const PROFILE_KEY = 'kk_demo_profile_v1';

interface StoredCart {
  items: { id: string; variantId: string; quantity: number }[];
  couponCode: string | null;
}

// In-memory mirror guarantees cart/wishlist/orders work even if localStorage is blocked in a sandboxed iframe
const memoryStore = new Map<string, unknown>();

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as T;
      memoryStore.set(key, parsed);
      return parsed;
    }
  } catch {
    // Fall back to in-memory mirror
  }
  if (memoryStore.has(key)) {
    return memoryStore.get(key) as T;
  }
  return fallback;
}

function writeJson(key: string, val: unknown): void {
  memoryStore.set(key, val);
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(val));
    }
  } catch {
    // Ignore storage quota / iframe security errors; memoryStore keeps state active
  }
}

function findVariant(variantId: string) {
  for (const p of DEMO_PRODUCTS) {
    const v = p.variants.find((x) => x.id === variantId);
    if (v) return { product: p, variant: v };
  }
  return null;
}

export function getDemoCart(): CartDTO {
  const stored = readJson<StoredCart>(CART_KEY, { items: [], couponCode: null });
  const items: CartItemDTO[] = [];

  for (const row of stored.items) {
    const match = findVariant(row.variantId);
    if (!match) continue;
    const { product, variant } = match;
    const clampedQty = Math.max(1, Math.min(50, Math.min(variant.stock_qty || 50, row.quantity)));
    items.push({
      id: row.id,
      variant_id: variant.id,
      product_id: product.id,
      product_slug: product.slug,
      product_name_en: product.name_en,
      product_name_bn: product.name_bn,
      variant_label_en: variant.label_en,
      variant_label_bn: variant.label_bn,
      unit_weight_grams: variant.unit_weight_grams,
      unit_price_bdt: variant.price_bdt,
      compare_at_price_bdt: variant.compare_at_price_bdt,
      quantity: clampedQty,
      line_total_bdt: variant.price_bdt * clampedQty,
      stock_qty: variant.stock_qty,
      image_url: product.image_url,
      basket_eligible: product.basket_eligible,
      farmer_name_en: product.farmer?.name_en ?? 'KrishiKotha Grower',
      origin_district: product.origin_district,
    });
  }

  const prelim = calculateCartPricing(items, null);
  let couponInput = null;
  if (stored.couponCode === 'KRISHI100' && prelim.subtotal_bdt - prelim.basket_discount_bdt >= 799) {
    couponInput = { code: 'KRISHI100', discount_bdt: 100 };
  } else if (stored.couponCode) {
    writeJson(CART_KEY, { items: stored.items, couponCode: null });
  }

  const pricing = calculateCartPricing(items, couponInput);
  return { id: 'demo-cart', items, ...pricing };
}

export function addDemoCartItem(variantId: string, quantity: number): CartDTO {
  const match = findVariant(variantId);
  if (!match) {
    throw new Error('Selected produce pack could not be found.');
  }
  const { product, variant } = match;
  if (variant.stock_qty <= 0) {
    throw new Error(`${product.name_en} (${variant.label_en}) is currently out of stock.`);
  }

  const stored = readJson<StoredCart>(CART_KEY, { items: [], couponCode: null });
  const nextItems = stored.items.map((i) => ({ ...i }));
  const existing = nextItems.find((i) => i.variantId === variantId);
  const nextQty = (existing ? existing.quantity : 0) + Math.max(1, Math.floor(quantity));

  if (nextQty > 50) {
    throw new Error('Maximum 50 units per item in one basket.');
  }
  if (nextQty > variant.stock_qty) {
    throw new Error(`Only ${variant.stock_qty} left of ${product.name_en} (${variant.label_en}).`);
  }

  if (existing) {
    existing.quantity = nextQty;
  } else {
    nextItems.push({
      id: `demo-ci-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      variantId,
      quantity: nextQty,
    });
  }
  writeJson(CART_KEY, { items: nextItems, couponCode: stored.couponCode });
  return getDemoCart();
}

export function addDemoCartBatch(batch: { variantId: string; quantity: number }[]): CartDTO {
  for (const entry of batch) {
    addDemoCartItem(entry.variantId, entry.quantity);
  }
  return getDemoCart();
}

export function updateDemoCartItem(itemId: string, quantity: number): CartDTO {
  const stored = readJson<StoredCart>(CART_KEY, { items: [], couponCode: null });
  let nextItems = stored.items.map((i) => ({ ...i }));

  if (quantity <= 0) {
    nextItems = nextItems.filter((i) => i.id !== itemId);
  } else {
    const item = nextItems.find((i) => i.id === itemId);
    if (item) {
      const match = findVariant(item.variantId);
      const maxStock = match?.variant.stock_qty ?? 50;
      if (quantity > maxStock) {
        throw new Error(`Only ${maxStock} left in today's harvest.`);
      }
      item.quantity = Math.min(50, Math.floor(quantity));
    }
  }
  writeJson(CART_KEY, { items: nextItems, couponCode: stored.couponCode });
  return getDemoCart();
}

export function removeDemoCartItem(itemId: string): CartDTO {
  return updateDemoCartItem(itemId, 0);
}

export function clearDemoCart(): CartDTO {
  writeJson(CART_KEY, { items: [], couponCode: null });
  return getDemoCart();
}

export function applyDemoCoupon(code: string): CartDTO {
  const normalized = code.trim().toUpperCase();
  const cart = getDemoCart();
  if (cart.subtotal_bdt === 0) {
    throw new Error('Add produce to your basket before applying a coupon.');
  }
  const afterBasket = cart.subtotal_bdt - cart.basket_discount_bdt;
  if (normalized !== 'KRISHI100') {
    throw new Error('Invalid coupon code. Try KRISHI100 on orders of ৳799 or more.');
  }
  if (afterBasket < 799) {
    throw new Error('Minimum order of ৳799 required for coupon KRISHI100.');
  }
  const stored = readJson<StoredCart>(CART_KEY, { items: [], couponCode: null });
  writeJson(CART_KEY, { items: stored.items, couponCode: 'KRISHI100' });
  return getDemoCart();
}

export function removeDemoCoupon(): CartDTO {
  const stored = readJson<StoredCart>(CART_KEY, { items: [], couponCode: null });
  writeJson(CART_KEY, { items: stored.items, couponCode: null });
  return getDemoCart();
}

export function getDemoWishlist(): ProductSummaryDTO[] {
  const ids = readJson<string[]>(WISHLIST_KEY, []);
  return DEMO_PRODUCTS.filter((p) => ids.includes(p.id));
}

export function addDemoWishlist(productId: string): void {
  const ids = [...readJson<string[]>(WISHLIST_KEY, [])];
  if (!ids.includes(productId)) {
    ids.unshift(productId);
    writeJson(WISHLIST_KEY, ids);
  }
}

export function removeDemoWishlist(productId: string): void {
  const ids = readJson<string[]>(WISHLIST_KEY, []).filter((id) => id !== productId);
  writeJson(WISHLIST_KEY, ids);
}

const DEFAULT_DEMO_PROFILE: ProfileDTO = {
  id: 'demo-preview-user',
  full_name: 'Guest Shopper',
  phone: '',
  address_line: '',
  area: 'Gulshan',
  city: 'Dhaka',
  postal_code: '',
  preferred_language: 'en',
  avatar_url: null,
  is_guest: true,
};

export function getDemoProfile(): ProfileDTO {
  return readJson<ProfileDTO>(PROFILE_KEY, DEFAULT_DEMO_PROFILE);
}

export function updateDemoProfile(patch: Partial<ProfileDTO>): ProfileDTO {
  const current = getDemoProfile();
  const next: ProfileDTO = {
    ...current,
    ...patch,
    id: current.id,
    is_guest: current.is_guest,
  };
  writeJson(PROFILE_KEY, next);
  return next;
}

export function placeDemoOrder(payload: {
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_area: string;
  delivery_slot: string;
  payment_method: 'cod' | 'bkash' | 'nagad' | 'card';
  notes?: string;
}): OrderDTO {
  const cart = getDemoCart();
  if (cart.items.length === 0) {
    throw new Error('Your basket is empty.');
  }

  const order: OrderDTO = {
    id: `demo-order-${Date.now()}`,
    order_number: `DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
    user_id: 'demo-preview-user',
    status: 'placed',
    payment_method: payload.payment_method,
    payment_status: 'demo_preview_not_saved',
    subtotal_bdt: cart.subtotal_bdt,
    basket_discount_bdt: cart.basket_discount_bdt,
    coupon_code: cart.coupon_code,
    coupon_discount_bdt: cart.coupon_discount_bdt,
    delivery_fee_bdt: cart.delivery_fee_bdt,
    total_bdt: cart.total_bdt,
    delivery_name: payload.delivery_name,
    delivery_phone: payload.delivery_phone,
    delivery_address: payload.delivery_address,
    delivery_area: payload.delivery_area,
    delivery_slot: payload.delivery_slot,
    notes: payload.notes ?? '',
    created_at: new Date().toISOString(),
    items: cart.items.map((i, idx) => ({
      id: `demo-oi-${idx}`,
      product_id: i.product_id,
      variant_id: i.variant_id,
      product_name_en: i.product_name_en,
      product_name_bn: i.product_name_bn,
      variant_label: i.variant_label_en,
      unit_price_bdt: i.unit_price_bdt,
      quantity: i.quantity,
      line_total_bdt: i.line_total_bdt,
      image_url: i.image_url,
    })),
  };

  const existing = [...readJson<OrderDTO[]>(ORDERS_KEY, [])];
  existing.unshift(order);
  writeJson(ORDERS_KEY, existing);
  clearDemoCart();
  return order;
}

export function getDemoOrders(): OrderDTO[] {
  return readJson<OrderDTO[]>(ORDERS_KEY, []);
}

export function getDemoOrderById(id: string): OrderDTO | null {
  return getDemoOrders().find((o) => o.id === id) ?? null;
}
