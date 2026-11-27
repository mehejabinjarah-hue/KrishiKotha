import { describe, expect, it } from 'vitest';
import {
  addCartItemSchema,
  applyCouponSchema,
  placeOrderSchema,
  productQuerySchema,
} from '../shared/schemas.js';

describe('shared Zod schemas', () => {
  it('validates addCartItemSchema quantities 1..50 and rejects extra fields', () => {
    expect(
      addCartItemSchema.safeParse({
        variantId: '550e8400-e29b-41d4-a716-446655440000',
        quantity: 2,
      }).success
    ).toBe(true);

    expect(
      addCartItemSchema.safeParse({
        variantId: '550e8400-e29b-41d4-a716-446655440000',
        quantity: 51,
      }).success
    ).toBe(false);

    expect(
      addCartItemSchema.safeParse({
        variantId: '550e8400-e29b-41d4-a716-446655440000',
        quantity: 1,
        price_bdt: 1,
      }).success
    ).toBe(false);
  });

  it('rejects tampered price/total fields on placeOrderSchema', () => {
    const valid = placeOrderSchema.safeParse({
      delivery_name: 'Nusrat Jahan',
      delivery_phone: '01712345678',
      delivery_address: 'House 14, Road 11, Banani',
      delivery_area: 'Banani',
      delivery_slot: 'Today, 11:00 AM - 2:00 PM',
      payment_method: 'cod',
    });
    expect(valid.success).toBe(true);

    const tampered = placeOrderSchema.safeParse({
      delivery_name: 'Nusrat Jahan',
      delivery_phone: '01712345678',
      delivery_address: 'House 14, Road 11, Banani',
      delivery_area: 'Banani',
      delivery_slot: 'Today, 11:00 AM - 2:00 PM',
      payment_method: 'cod',
      total_bdt: 1,
    });
    expect(tampered.success).toBe(false);
  });

  it('normalizes coupon codes to uppercase', () => {
    const parsed = applyCouponSchema.parse({ code: '  krishi100 ' });
    expect(parsed.code).toBe('KRISHI100');
  });

  it('parses product query defaults safely', () => {
    const q = productQuerySchema.parse({});
    expect(q.page).toBe(1);
    expect(q.pageSize).toBe(12);
    expect(q.sort).toBe('freshest');
  });
});
