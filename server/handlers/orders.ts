import { placeOrderSchema, uuidSchema } from '../../shared/schemas.js';
import type { OrderDTO } from '../../shared/types.js';
import type { AuthContext } from '../auth.js';
import { ApiError } from '../http.js';

export async function handlePlaceOrder(auth: AuthContext, rawBody: unknown): Promise<OrderDTO> {
  // Reject any attempt to send price/total fields explicitly by strict Zod schema
  const parsed = placeOrderSchema.safeParse(rawBody);
  if (!parsed.success) {
    throw new ApiError(
      422,
      'VALIDATION_ERROR',
      parsed.error.issues[0]?.message || 'Please check your delivery details',
      parsed.error.issues
    );
  }

  const input = parsed.data;
  const { data, error } = await auth.client.rpc('place_order', {
    p_delivery_name: input.delivery_name,
    p_delivery_phone: input.delivery_phone,
    p_delivery_address: input.delivery_address,
    p_delivery_area: input.delivery_area,
    p_delivery_slot: input.delivery_slot,
    p_payment_method: input.payment_method,
    p_notes: input.notes ?? '',
    p_idempotency_key: input.idempotency_key ?? null,
  });

  if (error) {
    const msg = error.message || 'Could not place order';
    if (msg.startsWith('CART_EMPTY:')) {
      throw new ApiError(400, 'CART_EMPTY', msg.replace('CART_EMPTY:', '').trim());
    }
    if (msg.startsWith('OUT_OF_STOCK:') || msg.startsWith('UNAVAILABLE_ITEM:')) {
      throw new ApiError(409, 'OUT_OF_STOCK', msg.split(':').slice(1).join(':').trim());
    }
    if (msg.startsWith('INVALID_COUPON:')) {
      throw new ApiError(422, 'INVALID_COUPON', msg.replace('INVALID_COUPON:', '').trim());
    }
    if (msg.startsWith('VALIDATION_ERROR:')) {
      throw new ApiError(422, 'VALIDATION_ERROR', msg.replace('VALIDATION_ERROR:', '').trim());
    }
    if (msg.startsWith('UNAUTHORIZED:')) {
      throw new ApiError(401, 'UNAUTHORIZED', msg.replace('UNAUTHORIZED:', '').trim());
    }
    throw new ApiError(500, 'ORDER_ERROR', 'Unable to place your demonstration order right now');
  }

  const order = data as OrderDTO;
  // Fetch line items so confirmation page gets complete receipt
  const { data: items } = await auth.client
    .from('order_items')
    .select('id, product_id, variant_id, product_name_en, product_name_bn, variant_label, unit_price_bdt, quantity, line_total_bdt, image_url')
    .eq('order_id', order.id);

  return {
    ...order,
    items: (items ?? []) as OrderDTO['items'],
  };
}

export async function handleListOrders(auth: AuthContext): Promise<OrderDTO[]> {
  const { data, error } = await auth.client
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', auth.userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new ApiError(500, 'DB_ERROR', 'Could not load order history');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((o: any) => ({
    ...o,
    items: o.order_items ?? [],
  })) as OrderDTO[];
}

export async function handleGetOrder(auth: AuthContext, orderId: string): Promise<OrderDTO> {
  if (!uuidSchema.safeParse(orderId).success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid order identifier');
  }

  const { data, error } = await auth.client
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .eq('user_id', auth.userId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, 'DB_ERROR', 'Could not load order details');
  }
  if (!data) {
    throw new ApiError(404, 'NOT_FOUND', 'Order not found');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any;
  return {
    ...row,
    items: row.order_items ?? [],
  } as OrderDTO;
}
