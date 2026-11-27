import type { CategoryDTO } from '../../shared/types.js';
import { ApiError } from '../http.js';
import { createPublicSupabaseClient } from '../supabase.js';

export async function handleListCategories(): Promise<CategoryDTO[]> {
  const client = createPublicSupabaseClient();

  const { data: cats, error: catErr } = await client
    .from('categories')
    .select('id, slug, name_en, name_bn, icon, sort_order, image_url')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (catErr) {
    throw new ApiError(500, 'DB_ERROR', 'Could not load categories');
  }

  const { data: prods } = await client
    .from('products')
    .select('category_id')
    .eq('is_active', true);

  const countMap = new Map<string, number>();
  for (const row of prods ?? []) {
    const cid = row.category_id as string;
    countMap.set(cid, (countMap.get(cid) ?? 0) + 1);
  }

  return (cats ?? []).map((c) => ({
    id: c.id as string,
    slug: c.slug as string,
    name_en: c.name_en as string,
    name_bn: c.name_bn as string,
    icon: c.icon as string,
    sort_order: Number(c.sort_order),
    image_url: c.image_url as string,
    product_count: countMap.get(c.id as string) ?? 0,
  }));
}
