import { uuidSchema, wishlistAddSchema } from '../../shared/schemas.js';
import type { ProductSummaryDTO } from '../../shared/types.js';
import type { AuthContext } from '../auth.js';
import { ApiError } from '../http.js';
import { mapProductRow } from './products.js';

export async function handleListWishlist(auth: AuthContext): Promise<ProductSummaryDTO[]> {
  const { data, error } = await auth.client
    .from('wishlist_items')
    .select(`
      id,
      created_at,
      products (
        *,
        categories (id, slug, name_en, name_bn),
        farmers (id, slug, name_en, name_bn, district, upazila, photo_url, acres, years_farming),
        product_variants (*)
      )
    `)
    .eq('user_id', auth.userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new ApiError(500, 'DB_ERROR', 'Could not load saved items');
  }

  return (data ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((row: any) => row.products && row.products.is_active !== false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((row: any) => mapProductRow(row.products));
}

export async function handleAddWishlist(auth: AuthContext, rawBody: unknown): Promise<{ saved: true; productId: string }> {
  const parsed = wishlistAddSchema.safeParse(rawBody);
  if (!parsed.success) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Invalid product identifier', parsed.error.issues);
  }

  const { productId } = parsed.data;

  const { error } = await auth.client
    .from('wishlist_items')
    .upsert(
      { user_id: auth.userId, product_id: productId },
      { onConflict: 'user_id,product_id', ignoreDuplicates: true }
    );

  if (error) {
    throw new ApiError(500, 'DB_ERROR', 'Could not save item to wishlist');
  }

  return { saved: true, productId };
}

export async function handleRemoveWishlist(auth: AuthContext, productId: string): Promise<{ removed: true; productId: string }> {
  if (!uuidSchema.safeParse(productId).success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid product identifier');
  }

  const { error } = await auth.client
    .from('wishlist_items')
    .delete()
    .eq('user_id', auth.userId)
    .eq('product_id', productId);

  if (error) {
    throw new ApiError(500, 'DB_ERROR', 'Could not remove item from wishlist');
  }

  return { removed: true, productId };
}
