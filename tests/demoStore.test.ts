import { beforeEach, describe, expect, it } from 'vitest';
import {
  addDemoCartBatch,
  addDemoCartItem,
  addDemoWishlist,
  applyDemoCoupon,
  clearDemoCart,
  getDemoCart,
  getDemoOrders,
  getDemoProfile,
  getDemoWishlist,
  placeDemoOrder,
  removeDemoCartItem,
  removeDemoCoupon,
  removeDemoWishlist,
  updateDemoCartItem,
  updateDemoProfile,
} from '../src/demo/demoStore';
import { DEMO_PRODUCTS, getDemoStandardBasket } from '../src/demo/sampleData';

describe('demoStore cart, wishlist, profile & checkout flows', () => {
  beforeEach(() => {
    clearDemoCart();
  });

  it('adds, updates, and removes items cleanly in memory without window.localStorage', () => {
    const product = DEMO_PRODUCTS[0];
    const variant = product.variants[0];

    const added = addDemoCartItem(variant.id, 2);
    expect(added.items).toHaveLength(1);
    expect(added.item_count).toBe(2);
    expect(added.subtotal_bdt).toBe(variant.price_bdt * 2);

    const itemId = added.items[0].id;
    const updated = updateDemoCartItem(itemId, 4);
    expect(updated.item_count).toBe(4);
    expect(updated.subtotal_bdt).toBe(variant.price_bdt * 4);

    const removed = removeDemoCartItem(itemId);
    expect(removed.items).toHaveLength(0);
    expect(removed.total_bdt).toBe(0);
  });

  it('adds the full standard weekly basket batch and unlocks the 15% discount', () => {
    const standardBasket = getDemoStandardBasket();
    const cart = addDemoCartBatch(
      standardBasket.items.map((item) => ({
        variantId: item.variant_id,
        quantity: 1,
      }))
    );

    expect(cart.items.length).toBe(standardBasket.items.length);
    expect(cart.distinct_basket_eligible_count).toBeGreaterThanOrEqual(4);
    expect(cart.basket_discount_bdt).toBeGreaterThan(0);
    expect(cart.subtotal_bdt - cart.basket_discount_bdt).toBe(standardBasket.final_price_bdt);
  });

  it('validates KRISHI100 coupon minimum (৳799) and auto-clears coupon if cart drops below floor', () => {
    const cheapVariant = DEMO_PRODUCTS[0].variants[0];
    addDemoCartItem(cheapVariant.id, 1);

    expect(() => applyDemoCoupon('KRISHI100')).toThrow(/799/);

    // Push cart above ৳799 using a higher-priced pack
    const highValueProduct = DEMO_PRODUCTS.find((p) => p.variants[0].price_bdt >= 250)!;
    const highVariant = highValueProduct.variants[0];
    addDemoCartItem(highVariant.id, 4);

    const withCoupon = applyDemoCoupon('krishi100');
    expect(withCoupon.coupon_code).toBe('KRISHI100');
    expect(withCoupon.coupon_discount_bdt).toBe(100);

    // Reduce back down so total after basket discount drops below ৳799
    const bigItem = withCoupon.items.find((i) => i.variant_id === highVariant.id)!;
    const reduced = removeDemoCartItem(bigItem.id);
    expect(reduced.coupon_code).toBeNull();
    expect(reduced.coupon_discount_bdt).toBe(0);

    // Removing coupon directly is idempotent
    const afterRemove = removeDemoCoupon();
    expect(afterRemove.coupon_code).toBeNull();
  });

  it('enforces stock limits and maximum 50-unit basket cap', () => {
    const variant = DEMO_PRODUCTS[0].variants[0];
    expect(() => addDemoCartItem(variant.id, 51)).toThrow(/50/);
  });

  it('manages demo wishlist, profile persistence, and demonstration order placement', () => {
    const prod = DEMO_PRODUCTS[0];
    addDemoWishlist(prod.id);
    expect(getDemoWishlist().some((p) => p.id === prod.id)).toBe(true);
    removeDemoWishlist(prod.id);
    expect(getDemoWishlist().some((p) => p.id === prod.id)).toBe(false);

    const updatedProfile = updateDemoProfile({ full_name: 'Nusrat Jahan', area: 'Banani' });
    expect(updatedProfile.full_name).toBe('Nusrat Jahan');
    expect(getDemoProfile().area).toBe('Banani');

    addDemoCartItem(prod.variants[0].id, 2);
    const order = placeDemoOrder({
      delivery_name: 'Nusrat Jahan',
      delivery_phone: '01712345678',
      delivery_address: 'House 14, Road 11, Banani',
      delivery_area: 'Banani',
      delivery_slot: 'Today · 3:00 PM – 6:00 PM',
      payment_method: 'cod',
    });

    expect(order.order_number).toMatch(/^DEMO-/);
    expect(getDemoCart().items).toHaveLength(0);
    expect(getDemoOrders()[0].id).toBe(order.id);
  });
});
