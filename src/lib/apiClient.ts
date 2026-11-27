import type {
  ApiResponse,
  CartDTO,
  CategoryDTO,
  FarmerDTO,
  HealthDTO,
  OrderDTO,
  PaginatedProductsDTO,
  ProductDetailDTO,
  ProductSummaryDTO,
  ProfileDTO,
  StandardBasketDTO,
} from '../../shared/types';
import {
  addDemoCartBatch,
  addDemoCartItem,
  addDemoWishlist,
  applyDemoCoupon,
  clearDemoCart,
  getDemoCart,
  getDemoOrderById,
  getDemoOrders,
  getDemoProfile,
  getDemoWishlist,
  placeDemoOrder,
  removeDemoCartItem,
  removeDemoCoupon,
  removeDemoWishlist,
  updateDemoCartItem,
  updateDemoProfile,
} from '../demo/demoStore';
import {
  DEMO_CATEGORIES,
  DEMO_FARMERS,
  DEMO_PRODUCTS,
  getDemoProductDetail,
  getDemoStandardBasket,
} from '../demo/sampleData';
import { isSupabaseConfigured, supabase } from './supabaseClient';

export class ClientApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function requestApi<T>(path: string, init: RequestInit = {}, requireToken = false): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = await getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  } else if (requireToken) {
    throw new ClientApiError(401, 'UNAUTHORIZED', 'Sign in or continue as guest to continue.');
  }

  const res = await fetch(`/api${path}`, {
    ...init,
    headers,
  });

  let json: ApiResponse<T>;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ClientApiError(res.status, 'INVALID_RESPONSE', 'Unexpected server response. Please try again.');
  }

  if (!json.ok) {
    throw new ClientApiError(res.status, json.error.code, json.error.message);
  }

  return json.data;
}

export interface ProductFilterParams {
  q?: string;
  category?: string;
  district?: string;
  practice?: string;
  harvest?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}

function filterDemoProducts(params: ProductFilterParams): PaginatedProductsDTO {
  let list = [...DEMO_PRODUCTS];
  if (params.category && params.category !== 'all') {
    list = list.filter((p) => p.category?.slug === params.category);
  }
  if (params.district && params.district !== 'all') {
    list = list.filter((p) => p.origin_district === params.district);
  }
  if (params.practice) {
    list = list.filter((p) => p.farming_practice === params.practice);
  }
  if (params.harvest) {
    list = list.filter((p) => p.harvest_window === params.harvest);
  }
  if (params.featured !== undefined) {
    list = list.filter((p) => p.is_featured === params.featured);
  }
  if (params.q && params.q.trim()) {
    const q = params.q.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.name_en.toLowerCase().includes(q) ||
        p.name_bn.toLowerCase().includes(q) ||
        p.origin_district.toLowerCase().includes(q)
    );
  }
  const getPrice = (p: ProductSummaryDTO) => p.variants[0]?.price_bdt ?? 0;
  if (params.minPrice !== undefined) list = list.filter((p) => getPrice(p) >= params.minPrice!);
  if (params.maxPrice !== undefined) list = list.filter((p) => getPrice(p) <= params.maxPrice!);

  switch (params.sort) {
    case 'price_asc':
      list.sort((a, b) => getPrice(a) - getPrice(b));
      break;
    case 'price_desc':
      list.sort((a, b) => getPrice(b) - getPrice(a));
      break;
    case 'rating':
      list.sort((a, b) => b.rating_avg - a.rating_avg || b.rating_count - a.rating_count);
      break;
    case 'popular':
      list.sort((a, b) => b.rating_count - a.rating_count);
      break;
    default:
      list.sort((a, b) => {
        if (a.harvested_today !== b.harvested_today) return a.harvested_today ? -1 : 1;
        if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
        return b.rating_count - a.rating_count;
      });
      break;
  }

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 12;
  const total = list.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;

  return {
    items: list.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export const apiClient = {
  async getHealth(): Promise<HealthDTO> {
    if (!isSupabaseConfigured) {
      return {
        status: 'demo_mode',
        supabaseConfigured: false,
        databaseReachable: false,
        timestamp: new Date().toISOString(),
      };
    }
    return requestApi<HealthDTO>('/health');
  },

  async getCategories(): Promise<CategoryDTO[]> {
    if (!isSupabaseConfigured) return DEMO_CATEGORIES;
    return requestApi<CategoryDTO[]>('/categories');
  },

  async getProducts(params: ProductFilterParams = {}): Promise<PaginatedProductsDTO> {
    if (!isSupabaseConfigured) return filterDemoProducts(params);
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') sp.set(k, String(v));
    });
    const qs = sp.toString();
    return requestApi<PaginatedProductsDTO>(`/products${qs ? `?${qs}` : ''}`);
  },

  async getProduct(slug: string): Promise<ProductDetailDTO> {
    if (!isSupabaseConfigured) {
      const item = getDemoProductDetail(slug);
      if (!item) throw new ClientApiError(404, 'NOT_FOUND', 'Product not found');
      return item;
    }
    return requestApi<ProductDetailDTO>(`/products/${encodeURIComponent(slug)}`);
  },

  async getFarmers(): Promise<FarmerDTO[]> {
    if (!isSupabaseConfigured) return DEMO_FARMERS;
    return requestApi<FarmerDTO[]>('/farmers');
  },

  async getFarmer(slug: string): Promise<{ farmer: FarmerDTO; products: ProductSummaryDTO[] }> {
    if (!isSupabaseConfigured) {
      const farmer = DEMO_FARMERS.find((f) => f.slug === slug);
      if (!farmer) throw new ClientApiError(404, 'NOT_FOUND', 'Farmer not found');
      return {
        farmer,
        products: DEMO_PRODUCTS.filter((p) => p.farmer?.slug === slug),
      };
    }
    return requestApi<{ farmer: FarmerDTO; products: ProductSummaryDTO[] }>(
      `/farmers/${encodeURIComponent(slug)}`
    );
  },

  async getStandardBasket(): Promise<StandardBasketDTO> {
    if (!isSupabaseConfigured) return getDemoStandardBasket();
    return requestApi<StandardBasketDTO>('/baskets/standard');
  },

  async getMe(): Promise<ProfileDTO> {
    if (!isSupabaseConfigured) return getDemoProfile();
    return requestApi<ProfileDTO>('/me', {}, true);
  },

  async updateMe(payload: Partial<ProfileDTO>): Promise<ProfileDTO> {
    if (!isSupabaseConfigured) return updateDemoProfile(payload);
    return requestApi<ProfileDTO>(
      '/me',
      { method: 'PATCH', body: JSON.stringify(payload) },
      true
    );
  },

  async getCart(): Promise<CartDTO> {
    if (!isSupabaseConfigured) return getDemoCart();
    return requestApi<CartDTO>('/cart', {}, true);
  },

  async addCartItem(variantId: string, quantity: number): Promise<CartDTO> {
    if (!isSupabaseConfigured) {
      try {
        return addDemoCartItem(variantId, quantity);
      } catch (e) {
        throw new ClientApiError(409, 'CART_ERROR', (e as Error).message);
      }
    }
    return requestApi<CartDTO>(
      '/cart/items',
      { method: 'POST', body: JSON.stringify({ variantId, quantity }) },
      true
    );
  },

  async addCartBatch(batch: { variantId: string; quantity: number }[]): Promise<CartDTO> {
    if (!isSupabaseConfigured) {
      try {
        return addDemoCartBatch(batch);
      } catch (e) {
        throw new ClientApiError(409, 'CART_ERROR', (e as Error).message);
      }
    }
    let latest: CartDTO | null = null;
    for (const item of batch) {
      latest = await requestApi<CartDTO>(
        '/cart/items',
        { method: 'POST', body: JSON.stringify({ variantId: item.variantId, quantity: item.quantity }) },
        true
      );
    }
    return latest ?? (await requestApi<CartDTO>('/cart', {}, true));
  },

  async updateCartItem(itemId: string, quantity: number): Promise<CartDTO> {
    if (!isSupabaseConfigured) {
      try {
        return updateDemoCartItem(itemId, quantity);
      } catch (e) {
        throw new ClientApiError(409, 'CART_ERROR', (e as Error).message);
      }
    }
    return requestApi<CartDTO>(
      `/cart/items/${encodeURIComponent(itemId)}`,
      { method: 'PATCH', body: JSON.stringify({ quantity }) },
      true
    );
  },

  async removeCartItem(itemId: string): Promise<CartDTO> {
    if (!isSupabaseConfigured) return removeDemoCartItem(itemId);
    return requestApi<CartDTO>(
      `/cart/items/${encodeURIComponent(itemId)}`,
      { method: 'DELETE' },
      true
    );
  },

  async clearCart(): Promise<CartDTO> {
    if (!isSupabaseConfigured) return clearDemoCart();
    return requestApi<CartDTO>('/cart', { method: 'DELETE' }, true);
  },

  async applyCoupon(code: string): Promise<CartDTO> {
    if (!isSupabaseConfigured) {
      try {
        return applyDemoCoupon(code);
      } catch (e) {
        throw new ClientApiError(422, 'INVALID_COUPON', (e as Error).message);
      }
    }
    return requestApi<CartDTO>(
      '/cart/coupon',
      { method: 'POST', body: JSON.stringify({ code }) },
      true
    );
  },

  async removeCoupon(): Promise<CartDTO> {
    if (!isSupabaseConfigured) return removeDemoCoupon();
    return requestApi<CartDTO>('/cart/coupon', { method: 'DELETE' }, true);
  },

  async getWishlist(): Promise<ProductSummaryDTO[]> {
    if (!isSupabaseConfigured) return getDemoWishlist();
    return requestApi<ProductSummaryDTO[]>('/wishlist', {}, true);
  },

  async addWishlist(productId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      addDemoWishlist(productId);
      return;
    }
    await requestApi('/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }, true);
  },

  async removeWishlist(productId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      removeDemoWishlist(productId);
      return;
    }
    await requestApi(`/wishlist/${encodeURIComponent(productId)}`, { method: 'DELETE' }, true);
  },

  async placeOrder(payload: {
    delivery_name: string;
    delivery_phone: string;
    delivery_address: string;
    delivery_area: string;
    delivery_slot: string;
    payment_method: 'cod' | 'bkash' | 'nagad' | 'card';
    notes?: string;
    idempotency_key?: string;
  }): Promise<OrderDTO> {
    if (!isSupabaseConfigured) {
      try {
        return placeDemoOrder(payload);
      } catch (e) {
        throw new ClientApiError(400, 'DEMO_CHECKOUT', (e as Error).message);
      }
    }
    return requestApi<OrderDTO>('/orders', { method: 'POST', body: JSON.stringify(payload) }, true);
  },

  async getOrders(): Promise<OrderDTO[]> {
    if (!isSupabaseConfigured) return getDemoOrders();
    return requestApi<OrderDTO[]>('/orders', {}, true);
  },

  async getOrder(id: string): Promise<OrderDTO> {
    if (!isSupabaseConfigured) {
      const ord = getDemoOrderById(id);
      if (!ord) throw new ClientApiError(404, 'NOT_FOUND', 'Order not found');
      return ord;
    }
    return requestApi<OrderDTO>(`/orders/${encodeURIComponent(id)}`, {}, true);
  },

  async submitInquiry(payload: {
    type: 'contact' | 'seller' | 'community_building';
    name: string;
    email?: string;
    phone: string;
    message?: string;
    extra?: Record<string, string>;
  }): Promise<{ submitted: true; message: string }> {
    if (!isSupabaseConfigured) {
      return {
        submitted: true,
        message: 'Preview only: request validated locally (connect Supabase to save inquiries to database).',
      };
    }
    return requestApi<{ submitted: true; message: string }>('/inquiries', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
