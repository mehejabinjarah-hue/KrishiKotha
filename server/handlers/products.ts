import { productQuerySchema } from '../../shared/schemas.js';
import type {
  FarmingPractice,
  HarvestWindow,
  PaginatedProductsDTO,
  ProductDetailDTO,
  ProductReviewDTO,
  ProductSummaryDTO,
  ProductVariantDTO,
  TraceLogEntry,
} from '../../shared/types.js';
import { ApiError } from '../http.js';
import { createPublicSupabaseClient } from '../supabase.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapProductRow(row: any): ProductSummaryDTO {
  const variants: ProductVariantDTO[] = (Array.isArray(row.product_variants) ? row.product_variants : [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((v: any) => v.is_active !== false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((v: any) => ({
      id: v.id as string,
      product_id: v.product_id as string,
      sku: v.sku as string,
      label_en: v.label_en as string,
      label_bn: v.label_bn as string,
      unit_weight_grams: Number(v.unit_weight_grams),
      price_bdt: Number(v.price_bdt),
      compare_at_price_bdt: v.compare_at_price_bdt != null ? Number(v.compare_at_price_bdt) : null,
      stock_qty: Number(v.stock_qty),
      is_default: Boolean(v.is_default),
      sort_order: Number(v.sort_order ?? 0),
    }))
    .sort((a: ProductVariantDTO, b: ProductVariantDTO) => a.sort_order - b.sort_order);

  const traceLog: TraceLogEntry[] = Array.isArray(row.trace_log)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? row.trace_log.map((t: any) => ({
        time: String(t.time ?? ''),
        title: String(t.title ?? ''),
        detail: String(t.detail ?? ''),
      }))
    : [];

  return {
    id: row.id as string,
    slug: row.slug as string,
    category_id: row.category_id as string,
    category: row.categories
      ? {
          id: row.categories.id,
          slug: row.categories.slug,
          name_en: row.categories.name_en,
          name_bn: row.categories.name_bn,
        }
      : undefined,
    farmer_id: row.farmer_id as string,
    farmer: row.farmers
      ? {
          id: row.farmers.id,
          slug: row.farmers.slug,
          name_en: row.farmers.name_en,
          name_bn: row.farmers.name_bn,
          district: row.farmers.district,
          upazila: row.farmers.upazila,
          photo_url: row.farmers.photo_url,
          acres: Number(row.farmers.acres),
          years_farming: Number(row.farmers.years_farming),
        }
      : undefined,
    name_en: row.name_en as string,
    name_bn: row.name_bn as string,
    description_en: row.description_en as string,
    description_bn: row.description_bn as string,
    image_url: row.image_url as string,
    gallery_urls: Array.isArray(row.gallery_urls) && row.gallery_urls.length > 0 ? row.gallery_urls : [row.image_url],
    origin_district: row.origin_district as string,
    origin_hub: row.origin_hub as string,
    harvest_time: row.harvest_time as string,
    harvested_today: Boolean(row.harvested_today),
    harvest_window: (row.harvest_window as HarvestWindow) || 'today',
    harvest_label: row.harvest_label as string,
    farming_practice: (row.farming_practice as FarmingPractice) || 'organic',
    badges: Array.isArray(row.badges) ? row.badges : [],
    trace_id: row.trace_id as string,
    trace_log: traceLog,
    rating_avg: Number(row.rating_avg ?? 4.8),
    rating_count: Number(row.rating_count ?? 0),
    is_featured: Boolean(row.is_featured),
    basket_eligible: Boolean(row.basket_eligible),
    variants,
  };
}

function getDefaultVariantPrice(p: ProductSummaryDTO): number {
  const def = p.variants.find((v) => v.is_default) ?? p.variants[0];
  return def ? def.price_bdt : 0;
}

export async function handleListProducts(rawQuery: Record<string, string | undefined>): Promise<PaginatedProductsDTO> {
  const parsed = productQuerySchema.safeParse(rawQuery);
  if (!parsed.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid product filter parameters', parsed.error.issues);
  }
  const q = parsed.data;
  const client = createPublicSupabaseClient();

  let categoryId: string | null = null;
  if (q.category && q.category !== 'all') {
    const { data: cat } = await client
      .from('categories')
      .select('id')
      .eq('slug', q.category)
      .maybeSingle();
    if (!cat) {
      return { items: [], total: 0, page: q.page, pageSize: q.pageSize, totalPages: 0 };
    }
    categoryId = cat.id as string;
  }

  let query = client
    .from('products')
    .select(`
      *,
      categories (id, slug, name_en, name_bn),
      farmers (id, slug, name_en, name_bn, district, upazila, photo_url, acres, years_farming),
      product_variants (*)
    `)
    .eq('is_active', true);

  if (categoryId) query = query.eq('category_id', categoryId);
  if (q.district && q.district !== 'all') query = query.eq('origin_district', q.district);
  if (q.practice) query = query.eq('farming_practice', q.practice);
  if (q.harvest) query = query.eq('harvest_window', q.harvest);
  if (q.featured !== undefined) query = query.eq('is_featured', q.featured);

  if (q.q && q.q.length > 0) {
    const safeTerm = q.q.replace(/[%_,()\\"*]/g, ' ').trim();
    if (safeTerm.length > 0) {
      query = query.or(`name_en.ilike.%${safeTerm}%,name_bn.ilike.%${safeTerm}%,origin_district.ilike.%${safeTerm}%`);
    }
  }

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, 'DB_ERROR', 'Could not load products');
  }

  let products = (data ?? []).map(mapProductRow).filter((p) => p.variants.length > 0);

  if (q.minPrice !== undefined) {
    products = products.filter((p) => getDefaultVariantPrice(p) >= q.minPrice!);
  }
  if (q.maxPrice !== undefined) {
    products = products.filter((p) => getDefaultVariantPrice(p) <= q.maxPrice!);
  }

  switch (q.sort) {
    case 'price_asc':
      products.sort((a, b) => getDefaultVariantPrice(a) - getDefaultVariantPrice(b));
      break;
    case 'price_desc':
      products.sort((a, b) => getDefaultVariantPrice(b) - getDefaultVariantPrice(a));
      break;
    case 'rating':
      products.sort((a, b) => b.rating_avg - a.rating_avg || b.rating_count - a.rating_count);
      break;
    case 'popular':
      products.sort((a, b) => b.rating_count - a.rating_count);
      break;
    case 'freshest':
    default:
      products.sort((a, b) => {
        if (a.harvested_today !== b.harvested_today) return a.harvested_today ? -1 : 1;
        if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
        return b.rating_count - a.rating_count;
      });
      break;
  }

  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / q.pageSize));
  const safePage = Math.min(q.page, totalPages);
  const start = (safePage - 1) * q.pageSize;
  const paged = products.slice(start, start + q.pageSize);

  return {
    items: paged,
    total,
    page: safePage,
    pageSize: q.pageSize,
    totalPages: total === 0 ? 0 : totalPages,
  };
}

export async function handleGetProduct(slug: string): Promise<ProductDetailDTO> {
  const client = createPublicSupabaseClient();
  const { data: row, error } = await client
    .from('products')
    .select(`
      *,
      categories (id, slug, name_en, name_bn),
      farmers (id, slug, name_en, name_bn, district, upazila, photo_url, acres, years_farming),
      product_variants (*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, 'DB_ERROR', 'Could not load product details');
  }
  if (!row) {
    throw new ApiError(404, 'NOT_FOUND', 'Product not found');
  }

  const product = mapProductRow(row);

  const [{ data: reviewRows }, { data: relatedRows }] = await Promise.all([
    client
      .from('product_reviews')
      .select('id, product_id, author_name, area, rating, comment, created_at')
      .eq('product_id', product.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    client
      .from('products')
      .select(`
        *,
        categories (id, slug, name_en, name_bn),
        farmers (id, slug, name_en, name_bn, district, upazila, photo_url, acres, years_farming),
        product_variants (*)
      `)
      .eq('is_active', true)
      .neq('id', product.id)
      .eq('harvested_today', true)
      .limit(4),
  ]);

  const reviews: ProductReviewDTO[] = (reviewRows ?? []).map((r) => ({
    id: r.id as string,
    product_id: r.product_id as string,
    author_name: r.author_name as string,
    area: r.area as string,
    rating: Number(r.rating),
    comment: r.comment as string,
    created_at: r.created_at as string,
  }));

  const related = (relatedRows ?? []).map(mapProductRow);

  return {
    ...product,
    reviews,
    related,
  };
}
