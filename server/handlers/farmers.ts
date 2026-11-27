import type { FarmerDTO, ProductSummaryDTO } from '../../shared/types.js';
import { ApiError } from '../http.js';
import { createPublicSupabaseClient } from '../supabase.js';
import { mapProductRow } from './products.js';

export async function handleListFarmers(): Promise<FarmerDTO[]> {
  const client = createPublicSupabaseClient();
  const { data, error } = await client
    .from('farmers')
    .select('id, slug, name_en, name_bn, district, upazila, specialty, years_farming, acres, story, quote, photo_url, is_verified')
    .eq('is_active', true)
    .order('years_farming', { ascending: false });

  if (error) {
    throw new ApiError(500, 'DB_ERROR', 'Could not load farmers');
  }

  return (data ?? []).map((f) => ({
    id: f.id as string,
    slug: f.slug as string,
    name_en: f.name_en as string,
    name_bn: f.name_bn as string,
    district: f.district as string,
    upazila: f.upazila as string,
    specialty: f.specialty as string,
    years_farming: Number(f.years_farming),
    acres: Number(f.acres),
    story: f.story as string,
    quote: f.quote as string,
    photo_url: f.photo_url as string,
    is_verified: Boolean(f.is_verified),
  }));
}

export async function handleGetFarmer(slug: string): Promise<{ farmer: FarmerDTO; products: ProductSummaryDTO[] }> {
  const client = createPublicSupabaseClient();
  const { data: f, error } = await client
    .from('farmers')
    .select('id, slug, name_en, name_bn, district, upazila, specialty, years_farming, acres, story, quote, photo_url, is_verified')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, 'DB_ERROR', 'Could not load farmer profile');
  }
  if (!f) {
    throw new ApiError(404, 'NOT_FOUND', 'Farmer not found');
  }

  const { data: prodRows, error: prodErr } = await client
    .from('products')
    .select(`
      *,
      categories (id, slug, name_en, name_bn),
      farmers (id, slug, name_en, name_bn, district, upazila, photo_url, acres, years_farming),
      product_variants (*)
    `)
    .eq('farmer_id', f.id)
    .eq('is_active', true)
    .order('is_featured', { ascending: false });

  if (prodErr) {
    throw new ApiError(500, 'DB_ERROR', 'Could not load farmer harvest items');
  }

  return {
    farmer: {
      id: f.id as string,
      slug: f.slug as string,
      name_en: f.name_en as string,
      name_bn: f.name_bn as string,
      district: f.district as string,
      upazila: f.upazila as string,
      specialty: f.specialty as string,
      years_farming: Number(f.years_farming),
      acres: Number(f.acres),
      story: f.story as string,
      quote: f.quote as string,
      photo_url: f.photo_url as string,
      is_verified: Boolean(f.is_verified),
    },
    products: (prodRows ?? []).map(mapProductRow),
  };
}
