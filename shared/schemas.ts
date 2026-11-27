import { z } from 'zod';

export const uuidSchema = z.string().uuid('Invalid identifier format');

export const productQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(80).optional(),
  district: z.string().trim().max(80).optional(),
  practice: z
    .enum(['organic', 'pesticide_free', 'gap_certified', 'conventional_verified'])
    .optional(),
  harvest: z.enum(['today', '12h', 'preorder']).optional(),
  minPrice: z.coerce.number().int().min(0).max(50000).optional(),
  maxPrice: z.coerce.number().int().min(0).max(50000).optional(),
  sort: z
    .enum(['freshest', 'price_asc', 'price_desc', 'rating', 'popular'])
    .optional()
    .default('freshest'),
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  page: z.coerce.number().int().min(1).max(100).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(48).optional().default(12),
});

export const addCartItemSchema = z
  .object({
    variantId: uuidSchema,
    quantity: z.number().int().min(1).max(50),
  })
  .strict();

export const updateCartItemSchema = z
  .object({
    quantity: z.number().int().min(0).max(50),
  })
  .strict();

export const applyCouponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2, 'Enter a coupon code')
      .max(32, 'Coupon code is too long')
      .transform((v) => v.toUpperCase()),
  })
  .strict();

export const wishlistAddSchema = z
  .object({
    productId: uuidSchema,
  })
  .strict();

export const profileUpdateSchema = z
  .object({
    full_name: z.string().trim().min(1, 'Name is required').max(120),
    phone: z
      .string()
      .trim()
      .min(6, 'Enter a valid phone number')
      .max(24),
    address_line: z.string().trim().max(240).optional(),
    area: z.string().trim().min(1, 'Select delivery area').max(80),
    city: z.string().trim().max(60).optional(),
    postal_code: z.string().trim().max(20).optional(),
    preferred_language: z.enum(['en', 'bn']).optional(),
  })
  .strict();

export const placeOrderSchema = z
  .object({
    delivery_name: z.string().trim().min(2, 'Full name is required').max(120),
    delivery_phone: z
      .string()
      .trim()
      .regex(/^(?:\+?88)?01[3-9]\d{8}$/, 'Enter a valid Bangladesh phone number (e.g. 017XXXXXXXX)'),
    delivery_address: z.string().trim().min(5, 'Full street/house address is required').max(300),
    delivery_area: z.string().trim().min(2, 'Select a Dhaka delivery area').max(80),
    delivery_slot: z.string().trim().min(2, 'Select a delivery time slot').max(80),
    payment_method: z.enum(['cod', 'bkash', 'nagad', 'card']),
    notes: z.string().trim().max(400).optional(),
    idempotency_key: z.string().trim().max(100).optional(),
  })
  .strict();

export const inquirySchema = z
  .object({
    type: z.enum(['contact', 'seller', 'community_building']),
    name: z.string().trim().min(2, 'Name is required').max(120),
    email: z
      .string()
      .trim()
      .email('Enter a valid email address')
      .max(160)
      .optional()
      .or(z.literal('')),
    phone: z
      .string()
      .trim()
      .min(6, 'Phone number is required')
      .max(24),
    message: z.string().trim().max(1500).optional(),
    extra: z.record(z.string(), z.string().max(200)).optional(),
  })
  .strict();
