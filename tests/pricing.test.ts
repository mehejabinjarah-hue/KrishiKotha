import { describe, expect, it } from 'vitest';
import {
  calculateCartPricing,
  DELIVERY_FEE_BDT,
  FREE_DELIVERY_THRESHOLD_BDT,
} from '../server/pricing.js';

describe('calculateCartPricing', () => {
  it('returns zeroes for an empty cart', () => {
    const res = calculateCartPricing([]);
    expect(res.subtotal_bdt).toBe(0);
    expect(res.basket_discount_bdt).toBe(0);
    expect(res.coupon_discount_bdt).toBe(0);
    expect(res.delivery_fee_bdt).toBe(0);
    expect(res.total_bdt).toBe(0);
    expect(res.amount_to_free_delivery_bdt).toBe(FREE_DELIVERY_THRESHOLD_BDT);
  });

  it('computes line totals and adds delivery fee below ৳799', () => {
    const res = calculateCartPricing([
      {
        product_id: 'p1',
        unit_price_bdt: 65,
        quantity: 2,
        basket_eligible: true,
        unit_weight_grams: 500,
      },
      {
        product_id: 'p2',
        unit_price_bdt: 130,
        quantity: 1,
        basket_eligible: false,
        unit_weight_grams: 1000,
      },
    ]);

    expect(res.subtotal_bdt).toBe(260);
    expect(res.basket_discount_bdt).toBe(0);
    expect(res.delivery_fee_bdt).toBe(DELIVERY_FEE_BDT);
    expect(res.total_bdt).toBe(320);
    expect(res.amount_to_free_delivery_bdt).toBe(799 - 260);
    expect(res.item_count).toBe(3);
    expect(res.total_weight_grams).toBe(2000);
  });

  it('enforces exact free delivery boundary at ৳798 vs ৳799', () => {
    const under = calculateCartPricing([
      {
        product_id: 'p1',
        unit_price_bdt: 798,
        quantity: 1,
        basket_eligible: false,
        unit_weight_grams: 1000,
      },
    ]);
    expect(under.delivery_fee_bdt).toBe(60);
    expect(under.total_bdt).toBe(858);

    const atThreshold = calculateCartPricing([
      {
        product_id: 'p1',
        unit_price_bdt: 799,
        quantity: 1,
        basket_eligible: false,
        unit_weight_grams: 1000,
      },
    ]);
    expect(atThreshold.delivery_fee_bdt).toBe(0);
    expect(atThreshold.total_bdt).toBe(799);
    expect(atThreshold.amount_to_free_delivery_bdt).toBe(0);
  });

  it('applies 15% weekly basket saving when 4+ distinct basket-eligible products are present', () => {
    const res = calculateCartPricing([
      { product_id: 'p1', unit_price_bdt: 80, quantity: 1, basket_eligible: true, unit_weight_grams: 2000 },
      { product_id: 'p2', unit_price_bdt: 110, quantity: 1, basket_eligible: true, unit_weight_grams: 1500 },
      { product_id: 'p3', unit_price_bdt: 120, quantity: 1, basket_eligible: true, unit_weight_grams: 1000 },
      { product_id: 'p4', unit_price_bdt: 55, quantity: 1, basket_eligible: true, unit_weight_grams: 1100 },
      { product_id: 'p5', unit_price_bdt: 145, quantity: 1, basket_eligible: false, unit_weight_grams: 1000 },
    ]);

    // Eligible subtotal = 80+110+120+55 = 365 -> 15% = 54.75 -> rounds to 55
    expect(res.distinct_basket_eligible_count).toBe(4);
    expect(res.subtotal_bdt).toBe(510);
    expect(res.basket_discount_bdt).toBe(55);
    expect(res.delivery_fee_bdt).toBe(60);
    expect(res.total_bdt).toBe(510 - 55 + 60);
  });

  it('does not apply basket discount for 4 line items of fewer than 4 distinct products', () => {
    const res = calculateCartPricing([
      { product_id: 'p1', unit_price_bdt: 100, quantity: 4, basket_eligible: true, unit_weight_grams: 500 },
    ]);
    expect(res.distinct_basket_eligible_count).toBe(1);
    expect(res.basket_discount_bdt).toBe(0);
  });

  it('applies coupon discount cleanly and never goes below zero', () => {
    const res = calculateCartPricing(
      [
        { product_id: 'p1', unit_price_bdt: 850, quantity: 1, basket_eligible: false, unit_weight_grams: 2000 },
      ],
      { code: 'KRISHI100', discount_bdt: 100 }
    );
    // After 100 coupon = 750 (< 799) -> delivery fee 60 applies
    expect(res.coupon_code).toBe('KRISHI100');
    expect(res.coupon_discount_bdt).toBe(100);
    expect(res.delivery_fee_bdt).toBe(60);
    expect(res.total_bdt).toBe(810);

    const capped = calculateCartPricing(
      [{ product_id: 'p1', unit_price_bdt: 50, quantity: 1, basket_eligible: false, unit_weight_grams: 500 }],
      { code: 'BIG', discount_bdt: 500 }
    );
    expect(capped.coupon_discount_bdt).toBe(50);
    expect(capped.total_bdt).toBe(60);
  });
});
