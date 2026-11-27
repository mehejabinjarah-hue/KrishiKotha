import type { StandardBasketDTO, StandardBasketItemDTO } from '../../shared/types.js';
import { ApiError } from '../http.js';
import { WEEKLY_BASKET_DISCOUNT_PERCENT } from '../pricing.js';
import { createPublicSupabaseClient } from '../supabase.js';

const STANDARD_SLUGS = [
  'bogura-red-potatoes',
  'pabna-country-onions',
  'deshi-tomato',
  'tender-bottle-gourd-lau',
  'green-chili-cilantro-combo',
];

export async function handleStandardBasket(): Promise<StandardBasketDTO> {
  const client = createPublicSupabaseClient();
  const { data, error } = await client
    .from('products')
    .select(`
      id, slug, name_en, name_bn, image_url, origin_district,
      farmers (name_en),
      product_variants (id, label_en, label_bn, unit_weight_grams, price_bdt, is_default, sort_order)
    `)
    .in('slug', STANDARD_SLUGS)
    .eq('is_active', true);

  if (error) {
    throw new ApiError(500, 'DB_ERROR', 'Could not load weekly basket');
  }

  const items: StandardBasketItemDTO[] = [];
  for (const slug of STANDARD_SLUGS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prod = (data ?? []).find((p: any) => p.slug === slug) as any;
    if (!prod || !Array.isArray(prod.product_variants) || prod.product_variants.length === 0) continue;

    // Pick 1kg pack for Deshi Tomato in standard basket, otherwise default variant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let chosen = prod.product_variants.find((v: any) => v.is_default) ?? prod.product_variants[0];
    if (slug === 'deshi-tomato') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const oneKg = prod.product_variants.find((v: any) => v.unit_weight_grams === 1000);
      if (oneKg) chosen = oneKg;
    }

    items.push({
      product_id: prod.id,
      slug: prod.slug,
      variant_id: chosen.id,
      name_en: prod.name_en,
      name_bn: prod.name_bn,
      variant_label_en: chosen.label_en,
      variant_label_bn: chosen.label_bn,
      unit_price_bdt: Number(chosen.price_bdt),
      unit_weight_grams: Number(chosen.unit_weight_grams),
      image_url: prod.image_url,
      farmer_name_en: prod.farmers?.name_en ?? 'KrishiKotha Grower',
      origin_district: prod.origin_district,
    });
  }

  const listed_total_bdt = items.reduce((sum, i) => sum + i.unit_price_bdt, 0);
  const basket_discount_bdt = Math.round((listed_total_bdt * WEEKLY_BASKET_DISCOUNT_PERCENT) / 100);
  const final_price_bdt = Math.max(0, listed_total_bdt - basket_discount_bdt);
  const total_weight_grams = items.reduce((sum, i) => sum + i.unit_weight_grams, 0);

  return {
    title_en: 'Standard 4-Person Weekly Basket',
    title_bn: 'সাপ্তাহিক পারিবারিক সবজি ঝুড়ি',
    discount_percent: WEEKLY_BASKET_DISCOUNT_PERCENT,
    listed_total_bdt,
    basket_discount_bdt,
    final_price_bdt,
    total_weight_grams,
    items,
  };
}
