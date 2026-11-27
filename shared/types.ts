export type Language = 'en' | 'bn';

export type FarmingPractice =
  | 'organic'
  | 'pesticide_free'
  | 'gap_certified'
  | 'conventional_verified';

export type HarvestWindow = 'today' | '12h' | 'preorder';

export type OrderStatus = 'placed' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'card';

export type InquiryType = 'contact' | 'seller' | 'community_building';

export type SortOption = 'freshest' | 'price_asc' | 'price_desc' | 'rating' | 'popular';

export interface TraceLogEntry {
  time: string;
  title: string;
  detail: string;
}

export interface CategoryDTO {
  id: string;
  slug: string;
  name_en: string;
  name_bn: string;
  icon: string;
  sort_order: number;
  image_url: string;
  product_count?: number;
}

export interface FarmerDTO {
  id: string;
  slug: string;
  name_en: string;
  name_bn: string;
  district: string;
  upazila: string;
  specialty: string;
  years_farming: number;
  acres: number;
  story: string;
  quote: string;
  photo_url: string;
  is_verified: boolean;
}

export interface ProductVariantDTO {
  id: string;
  product_id: string;
  sku: string;
  label_en: string;
  label_bn: string;
  unit_weight_grams: number;
  price_bdt: number;
  compare_at_price_bdt: number | null;
  stock_qty: number;
  is_default: boolean;
  sort_order: number;
}

export interface ProductReviewDTO {
  id: string;
  product_id: string;
  author_name: string;
  area: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ProductSummaryDTO {
  id: string;
  slug: string;
  category_id: string;
  category?: Pick<CategoryDTO, 'id' | 'slug' | 'name_en' | 'name_bn'>;
  farmer_id: string;
  farmer?: Pick<FarmerDTO, 'id' | 'slug' | 'name_en' | 'name_bn' | 'district' | 'upazila' | 'photo_url' | 'acres' | 'years_farming'>;
  name_en: string;
  name_bn: string;
  description_en: string;
  description_bn: string;
  image_url: string;
  gallery_urls: string[];
  origin_district: string;
  origin_hub: string;
  harvest_time: string;
  harvested_today: boolean;
  harvest_window: HarvestWindow;
  harvest_label: string;
  farming_practice: FarmingPractice;
  badges: string[];
  trace_id: string;
  trace_log: TraceLogEntry[];
  rating_avg: number;
  rating_count: number;
  is_featured: boolean;
  basket_eligible: boolean;
  variants: ProductVariantDTO[];
}

export interface ProductDetailDTO extends ProductSummaryDTO {
  reviews: ProductReviewDTO[];
  related: ProductSummaryDTO[];
}

export interface PaginatedProductsDTO {
  items: ProductSummaryDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProfileDTO {
  id: string;
  full_name: string;
  phone: string;
  address_line: string;
  area: string;
  city: string;
  postal_code: string;
  preferred_language: Language;
  avatar_url: string | null;
  is_guest: boolean;
}

export interface CartItemDTO {
  id: string;
  variant_id: string;
  product_id: string;
  product_slug: string;
  product_name_en: string;
  product_name_bn: string;
  variant_label_en: string;
  variant_label_bn: string;
  unit_weight_grams: number;
  unit_price_bdt: number;
  compare_at_price_bdt: number | null;
  quantity: number;
  line_total_bdt: number;
  stock_qty: number;
  image_url: string;
  basket_eligible: boolean;
  farmer_name_en: string;
  origin_district: string;
}

export interface CartPricingSummary {
  subtotal_bdt: number;
  basket_discount_bdt: number;
  distinct_basket_eligible_count: number;
  coupon_code: string | null;
  coupon_discount_bdt: number;
  delivery_fee_bdt: number;
  total_bdt: number;
  free_delivery_threshold_bdt: number;
  amount_to_free_delivery_bdt: number;
  item_count: number;
  total_weight_grams: number;
}

export interface CartDTO extends CartPricingSummary {
  id: string;
  items: CartItemDTO[];
}

export interface OrderItemDTO {
  id: string;
  product_id: string;
  variant_id: string;
  product_name_en: string;
  product_name_bn: string;
  variant_label: string;
  unit_price_bdt: number;
  quantity: number;
  line_total_bdt: number;
  image_url: string;
}

export interface OrderDTO {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: string;
  subtotal_bdt: number;
  basket_discount_bdt: number;
  coupon_code: string | null;
  coupon_discount_bdt: number;
  delivery_fee_bdt: number;
  total_bdt: number;
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_area: string;
  delivery_slot: string;
  notes: string;
  created_at: string;
  items?: OrderItemDTO[];
}

export interface StandardBasketItemDTO {
  product_id: string;
  slug: string;
  variant_id: string;
  name_en: string;
  name_bn: string;
  variant_label_en: string;
  variant_label_bn: string;
  unit_price_bdt: number;
  unit_weight_grams: number;
  image_url: string;
  farmer_name_en: string;
  origin_district: string;
}

export interface StandardBasketDTO {
  title_en: string;
  title_bn: string;
  discount_percent: number;
  listed_total_bdt: number;
  basket_discount_bdt: number;
  final_price_bdt: number;
  total_weight_grams: number;
  items: StandardBasketItemDTO[];
}

export interface HealthDTO {
  status: 'connected' | 'demo_mode' | 'degraded';
  supabaseConfigured: boolean;
  databaseReachable: boolean;
  timestamp: string;
}

export interface ApiSuccessEnvelope<T> {
  ok: true;
  data: T;
}

export interface ApiErrorEnvelope {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export type ApiResponse<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;
