import type { CartItemDTO, CartPricingSummary } from '../shared/types.js';

export const FREE_DELIVERY_THRESHOLD_BDT = 799;
export const DELIVERY_FEE_BDT = 60;
export const WEEKLY_BASKET_DISCOUNT_PERCENT = 15;
export const WEEKLY_BASKET_MIN_DISTINCT = 4;

export interface CouponInput {
  code: string;
  discount_bdt: number;
}

/**
 * Authoritative server-side pricing engine.
 * All money values are integer Bangladeshi Taka (BDT).
 * Mirrors the PostgreSQL `place_order` RPC exactly so cart, checkout, and order records always match.
 */
export function calculateCartPricing(
  items: Pick<
    CartItemDTO,
    'product_id' | 'unit_price_bdt' | 'quantity' | 'basket_eligible' | 'unit_weight_grams'
  >[],
  coupon: CouponInput | null = null
): CartPricingSummary {
  let subtotal_bdt = 0;
  let eligibleSubtotal = 0;
  let item_count = 0;
  let total_weight_grams = 0;
  const distinctEligibleProducts = new Set<string>();

  for (const item of items) {
    const qty = Math.max(0, Math.floor(item.quantity));
    const unitPrice = Math.max(0, Math.round(item.unit_price_bdt));
    const lineTotal = unitPrice * qty;

    subtotal_bdt += lineTotal;
    item_count += qty;
    total_weight_grams += Math.max(0, item.unit_weight_grams) * qty;

    if (item.basket_eligible && qty > 0) {
      eligibleSubtotal += lineTotal;
      distinctEligibleProducts.add(item.product_id);
    }
  }

  if (subtotal_bdt === 0) {
    return {
      subtotal_bdt: 0,
      basket_discount_bdt: 0,
      distinct_basket_eligible_count: 0,
      coupon_code: coupon?.code ?? null,
      coupon_discount_bdt: 0,
      delivery_fee_bdt: 0,
      total_bdt: 0,
      free_delivery_threshold_bdt: FREE_DELIVERY_THRESHOLD_BDT,
      amount_to_free_delivery_bdt: FREE_DELIVERY_THRESHOLD_BDT,
      item_count: 0,
      total_weight_grams: 0,
    };
  }

  const distinct_basket_eligible_count = distinctEligibleProducts.size;
  const basket_discount_bdt =
    distinct_basket_eligible_count >= WEEKLY_BASKET_MIN_DISTINCT
      ? Math.round((eligibleSubtotal * WEEKLY_BASKET_DISCOUNT_PERCENT) / 100)
      : 0;

  const afterBasket = Math.max(0, subtotal_bdt - basket_discount_bdt);

  const coupon_discount_bdt = coupon
    ? Math.min(afterBasket, Math.max(0, Math.round(coupon.discount_bdt)))
    : 0;

  const afterDiscounts = Math.max(0, afterBasket - coupon_discount_bdt);

  const delivery_fee_bdt =
    afterDiscounts >= FREE_DELIVERY_THRESHOLD_BDT ? 0 : DELIVERY_FEE_BDT;

  const total_bdt = Math.max(0, afterDiscounts + delivery_fee_bdt);
  const amount_to_free_delivery_bdt = Math.max(
    0,
    FREE_DELIVERY_THRESHOLD_BDT - afterDiscounts
  );

  return {
    subtotal_bdt,
    basket_discount_bdt,
    distinct_basket_eligible_count,
    coupon_code: coupon?.code ?? null,
    coupon_discount_bdt,
    delivery_fee_bdt,
    total_bdt,
    free_delivery_threshold_bdt: FREE_DELIVERY_THRESHOLD_BDT,
    amount_to_free_delivery_bdt,
    item_count,
    total_weight_grams,
  };
}
