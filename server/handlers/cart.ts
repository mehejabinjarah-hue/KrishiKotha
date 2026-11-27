import {
  addCartItemSchema,
  applyCouponSchema,
  updateCartItemSchema,
  uuidSchema,
} from '../../shared/schemas.js';
import type { CartDTO, CartItemDTO } from '../../shared/types.js';
import type { AuthContext } from '../auth.js';
import { ApiError } from '../http.js';
import { calculateCartPricing, type CouponInput } from '../pricing.js';

async function ensureUserCart(auth: AuthContext): Promise<{ id: string; coupon_code: string | null }> {
  const { data: existing, error } = await auth.client
    .from('carts')
    .select('id, coupon_code')
    .eq('user_id', auth.userId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, 'DB_ERROR', 'Could not load cart');
  }

  if (existing) {
    return { id: existing.id as string, coupon_code: existing.coupon_code as string | null };
  }

  const { error: upsertErr } = await auth.client
    .from('carts')
    .upsert({ user_id: auth.userId }, { onConflict: 'user_id', ignoreDuplicates: true });

  if (upsertErr) {
    throw new ApiError(500, 'DB_ERROR', 'Could not initialize cart');
  }

  const { data: created, error: fetchErr } = await auth.client
    .from('carts')
    .select('id, coupon_code')
    .eq('user_id', auth.userId)
    .single();

  if (fetchErr || !created) {
    throw new ApiError(500, 'DB_ERROR', 'Could not initialize cart');
  }

  return { id: created.id as string, coupon_code: created.coupon_code as string | null };
}

export async function buildCartDTO(auth: AuthContext): Promise<CartDTO> {
  const cart = await ensureUserCart(auth);

  const { data: rows, error } = await auth.client
    .from('cart_items')
    .select(`
      id,
      quantity,
      variant_id,
      product_variants (
        id,
        label_en,
        label_bn,
        unit_weight_grams,
        price_bdt,
        compare_at_price_bdt,
        stock_qty,
        is_active,
        products (
          id,
          slug,
          name_en,
          name_bn,
          image_url,
          origin_district,
          basket_eligible,
          is_active,
          farmers (name_en)
        )
      )
    `)
    .eq('cart_id', cart.id)
    .order('created_at', { ascending: true });

  if (error) {
    throw new ApiError(500, 'DB_ERROR', 'Could not load cart items');
  }

  const items: CartItemDTO[] = [];
  for (const row of rows ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = row.product_variants as any;
    const p = v?.products;
    if (!v || !p || v.is_active === false || p.is_active === false) {
      continue;
    }

    const unitPrice = Number(v.price_bdt);
    const qty = Number(row.quantity);

    items.push({
      id: row.id as string,
      variant_id: v.id as string,
      product_id: p.id as string,
      product_slug: p.slug as string,
      product_name_en: p.name_en as string,
      product_name_bn: p.name_bn as string,
      variant_label_en: v.label_en as string,
      variant_label_bn: v.label_bn as string,
      unit_weight_grams: Number(v.unit_weight_grams),
      unit_price_bdt: unitPrice,
      compare_at_price_bdt: v.compare_at_price_bdt != null ? Number(v.compare_at_price_bdt) : null,
      quantity: qty,
      line_total_bdt: unitPrice * qty,
      stock_qty: Number(v.stock_qty),
      image_url: p.image_url as string,
      basket_eligible: Boolean(p.basket_eligible),
      farmer_name_en: p.farmers?.name_en ?? 'KrishiKotha Grower',
      origin_district: p.origin_district as string,
    });
  }

  const prelim = calculateCartPricing(items, null);
  let activeCoupon: CouponInput | null = null;

  if (cart.coupon_code && prelim.subtotal_bdt > 0) {
    const afterBasket = Math.max(0, prelim.subtotal_bdt - prelim.basket_discount_bdt);
    const { data: couponRes } = await auth.client.rpc('validate_coupon', {
      p_code: cart.coupon_code,
      p_subtotal_after_basket: afterBasket,
    });
    const first = Array.isArray(couponRes) ? couponRes[0] : couponRes;
    if (first && first.is_valid) {
      activeCoupon = {
        code: String(first.code),
        discount_bdt: Number(first.discount_bdt),
      };
    } else {
      // Clear stale coupon if cart dropped below threshold
      await auth.client
        .from('carts')
        .update({ coupon_code: null })
        .eq('id', cart.id)
        .eq('user_id', auth.userId);
    }
  }

  const pricing = calculateCartPricing(items, activeCoupon);
  return {
    id: cart.id,
    items,
    ...pricing,
  };
}

export async function handleGetCart(auth: AuthContext): Promise<CartDTO> {
  return buildCartDTO(auth);
}

export async function handleAddCartItem(auth: AuthContext, rawBody: unknown): Promise<CartDTO> {
  const parsed = addCartItemSchema.safeParse(rawBody);
  if (!parsed.success) {
    throw new ApiError(422, 'VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid item data', parsed.error.issues);
  }

  const { variantId, quantity } = parsed.data;
  const cart = await ensureUserCart(auth);

  const { data: variant, error: varErr } = await auth.client
    .from('product_variants')
    .select('id, label_en, stock_qty, is_active, products (name_en, is_active)')
    .eq('id', variantId)
    .maybeSingle();

  if (varErr || !variant) {
    throw new ApiError(404, 'NOT_FOUND', 'Product pack option not found');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prod = variant.products as any;
  if (!variant.is_active || !prod?.is_active) {
    throw new ApiError(409, 'UNAVAILABLE_ITEM', 'This produce item is currently unavailable');
  }

  const { data: existingItem } = await auth.client
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cart.id)
    .eq('variant_id', variantId)
    .maybeSingle();

  const targetQty = (existingItem ? Number(existingItem.quantity) : 0) + quantity;
  if (targetQty > 50) {
    throw new ApiError(422, 'MAX_QUANTITY_EXCEEDED', 'Maximum 50 units per item in one basket');
  }

  const stockQty = Number(variant.stock_qty);
  if (stockQty <= 0) {
    throw new ApiError(409, 'OUT_OF_STOCK', `${prod.name_en} (${variant.label_en}) is currently out of stock`);
  }
  if (targetQty > stockQty) {
    throw new ApiError(
      409,
      'OUT_OF_STOCK',
      `Only ${stockQty} left of ${prod.name_en} (${variant.label_en})`
    );
  }

  if (existingItem) {
    const { error: updErr } = await auth.client
      .from('cart_items')
      .update({ quantity: targetQty })
      .eq('id', existingItem.id)
      .eq('cart_id', cart.id);
    if (updErr) throw new ApiError(500, 'DB_ERROR', 'Could not update basket quantity');
  } else {
    const { error: insErr } = await auth.client
      .from('cart_items')
      .insert({ cart_id: cart.id, variant_id: variantId, quantity: targetQty });
    if (insErr) throw new ApiError(500, 'DB_ERROR', 'Could not add item to basket');
  }

  return buildCartDTO(auth);
}

export async function handleUpdateCartItem(
  auth: AuthContext,
  itemId: string,
  rawBody: unknown
): Promise<CartDTO> {
  if (!uuidSchema.safeParse(itemId).success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid cart item identifier');
  }

  const parsed = updateCartItemSchema.safeParse(rawBody);
  if (!parsed.success) {
    throw new ApiError(422, 'VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid quantity', parsed.error.issues);
  }

  const cart = await ensureUserCart(auth);
  const { quantity } = parsed.data;

  const { data: item, error: itemErr } = await auth.client
    .from('cart_items')
    .select('id, variant_id, product_variants (label_en, stock_qty, products (name_en))')
    .eq('id', itemId)
    .eq('cart_id', cart.id)
    .maybeSingle();

  if (itemErr || !item) {
    throw new ApiError(404, 'NOT_FOUND', 'Basket item not found');
  }

  if (quantity === 0) {
    const { error: delErr } = await auth.client
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('cart_id', cart.id);
    if (delErr) throw new ApiError(500, 'DB_ERROR', 'Could not remove item');
    return buildCartDTO(auth);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = item.product_variants as any;
  const stockQty = Number(v?.stock_qty ?? 0);
  if (quantity > stockQty) {
    throw new ApiError(
      409,
      'OUT_OF_STOCK',
      `Only ${stockQty} left of ${v?.products?.name_en ?? 'this item'} (${v?.label_en ?? ''})`
    );
  }

  const { error: updErr } = await auth.client
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)
    .eq('cart_id', cart.id);

  if (updErr) {
    throw new ApiError(500, 'DB_ERROR', 'Could not update quantity');
  }

  return buildCartDTO(auth);
}

export async function handleRemoveCartItem(auth: AuthContext, itemId: string): Promise<CartDTO> {
  if (!uuidSchema.safeParse(itemId).success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid cart item identifier');
  }
  const cart = await ensureUserCart(auth);

  const { error } = await auth.client
    .from('cart_items')
    .delete()
    .eq('id', itemId)
    .eq('cart_id', cart.id);

  if (error) {
    throw new ApiError(500, 'DB_ERROR', 'Could not remove item from basket');
  }

  return buildCartDTO(auth);
}

export async function handleClearCart(auth: AuthContext): Promise<CartDTO> {
  const cart = await ensureUserCart(auth);
  await auth.client.from('cart_items').delete().eq('cart_id', cart.id);
  await auth.client.from('carts').update({ coupon_code: null }).eq('id', cart.id).eq('user_id', auth.userId);
  return buildCartDTO(auth);
}

export async function handleApplyCoupon(auth: AuthContext, rawBody: unknown): Promise<CartDTO> {
  const parsed = applyCouponSchema.safeParse(rawBody);
  if (!parsed.success) {
    throw new ApiError(422, 'VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid coupon code');
  }

  const cartDto = await buildCartDTO(auth);
  if (cartDto.subtotal_bdt === 0) {
    throw new ApiError(400, 'CART_EMPTY', 'Add produce to your basket before applying a coupon');
  }

  const afterBasket = Math.max(0, cartDto.subtotal_bdt - cartDto.basket_discount_bdt);
  const { data: couponRes, error: rpcErr } = await auth.client.rpc('validate_coupon', {
    p_code: parsed.data.code,
    p_subtotal_after_basket: afterBasket,
  });

  if (rpcErr) {
    throw new ApiError(500, 'DB_ERROR', 'Could not validate coupon');
  }

  const first = Array.isArray(couponRes) ? couponRes[0] : couponRes;
  if (!first || !first.is_valid) {
    throw new ApiError(
      422,
      'INVALID_COUPON',
      first?.error_message || 'This coupon code is not valid for your basket'
    );
  }

  const { error: updErr } = await auth.client
    .from('carts')
    .update({ coupon_code: String(first.code) })
    .eq('id', cartDto.id)
    .eq('user_id', auth.userId);

  if (updErr) {
    throw new ApiError(500, 'DB_ERROR', 'Could not apply coupon');
  }

  return buildCartDTO(auth);
}

export async function handleRemoveCoupon(auth: AuthContext): Promise<CartDTO> {
  const cart = await ensureUserCart(auth);
  await auth.client
    .from('carts')
    .update({ coupon_code: null })
    .eq('id', cart.id)
    .eq('user_id', auth.userId);
  return buildCartDTO(auth);
}
