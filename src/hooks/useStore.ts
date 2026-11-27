import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { calculateCartPricing } from '../../server/pricing';
import type { CartDTO, CartItemDTO, ProductSummaryDTO } from '../../shared/types';
import { apiClient, type ProductFilterParams } from '../lib/apiClient';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { useAppContext } from './useAppContext';
import { useAuth } from './useAuth';

function recomputeOptimisticCart(prev: CartDTO, nextItems: CartItemDTO[]): CartDTO {
  const prelim = calculateCartPricing(nextItems, null);
  let couponInput: { code: string; discount_bdt: number } | null = null;

  if (prev.coupon_code && prelim.subtotal_bdt > 0) {
    const afterBasket = Math.max(0, prelim.subtotal_bdt - prelim.basket_discount_bdt);
    // Preserve active coupon optimistically unless KRISHI100 dropped below its ৳799 floor
    if (prev.coupon_code !== 'KRISHI100' || afterBasket >= 799) {
      couponInput = {
        code: prev.coupon_code,
        discount_bdt: prev.coupon_discount_bdt || 100,
      };
    }
  }

  const pricing = calculateCartPricing(nextItems, couponInput);
  return {
    id: prev.id,
    items: nextItems,
    ...pricing,
  };
}

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.getHealth(),
    staleTime: 60_000,
    retry: 1,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
    staleTime: 5 * 60_000,
  });
}

export function useProducts(params: ProductFilterParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => apiClient.getProducts(params),
    staleTime: 60_000,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => apiClient.getProduct(slug),
    enabled: Boolean(slug),
  });
}

export function useFarmers() {
  return useQuery({
    queryKey: ['farmers'],
    queryFn: () => apiClient.getFarmers(),
    staleTime: 5 * 60_000,
  });
}

export function useFarmer(slug: string) {
  return useQuery({
    queryKey: ['farmer', slug],
    queryFn: () => apiClient.getFarmer(slug),
    enabled: Boolean(slug),
  });
}

export function useStandardBasket() {
  return useQuery({
    queryKey: ['standard-basket'],
    queryFn: () => apiClient.getStandardBasket(),
    staleTime: 5 * 60_000,
  });
}

export function useCart() {
  const { isAuthenticated } = useAuth();
  const enabled = !isSupabaseConfigured || isAuthenticated;
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => apiClient.getCart(),
    enabled,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  const { isAuthenticated, openAuthPrompt } = useAuth();
  const { showToast, t } = useAppContext();

  const mutation = useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: string; quantity: number }) =>
      apiClient.addCartItem(variantId, quantity),
    onSuccess: (updatedCart) => {
      qc.setQueryData(['cart'], updatedCart);
      showToast(t('addedToBasket'), 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Could not add item to basket', 'error');
    },
  });

  const addItem = (variantId: string, quantity = 1, onDone?: () => void) => {
    const run = () => {
      mutation.mutate(
        { variantId, quantity },
        {
          onSuccess: () => {
            onDone?.();
          },
        }
      );
    };

    if (isSupabaseConfigured && !isAuthenticated) {
      openAuthPrompt('Continue as Guest in one tap or sign in to save items to your harvest basket.', run);
      return;
    }
    run();
  };

  return { ...mutation, addItem };
}

export function useAddBatchToCart() {
  const qc = useQueryClient();
  const { isAuthenticated, openAuthPrompt } = useAuth();
  const { showToast } = useAppContext();

  const mutation = useMutation({
    mutationFn: (batch: { variantId: string; quantity: number }[]) => apiClient.addCartBatch(batch),
    onSuccess: (updatedCart) => {
      qc.setQueryData(['cart'], updatedCart);
      showToast('Weekly Basket staples added with 15% savings!', 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Could not add weekly basket items', 'error');
    },
  });

  const addBatch = (batch: { variantId: string; quantity: number }[], onDone?: () => void) => {
    const run = () => {
      mutation.mutate(batch, {
        onSuccess: () => {
          onDone?.();
        },
      });
    };

    if (isSupabaseConfigured && !isAuthenticated) {
      openAuthPrompt('Continue as Guest in one tap or sign in to save your Weekly Basket.', run);
      return;
    }
    run();
  };

  return { ...mutation, addBatch };
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  const { showToast } = useAppContext();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      apiClient.updateCartItem(itemId, quantity),
    onMutate: async ({ itemId, quantity }) => {
      await qc.cancelQueries({ queryKey: ['cart'] });
      const prev = qc.getQueryData<CartDTO>(['cart']);
      if (prev) {
        const nextItems =
          quantity <= 0
            ? prev.items.filter((i) => i.id !== itemId)
            : prev.items.map((i) =>
                i.id === itemId
                  ? { ...i, quantity, line_total_bdt: i.unit_price_bdt * quantity }
                  : i
              );
        qc.setQueryData<CartDTO>(['cart'], recomputeOptimisticCart(prev, nextItems));
      }
      return { prev };
    },
    onError: (err: Error, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['cart'], ctx.prev);
      showToast(err.message || 'Could not update quantity', 'error');
    },
    onSuccess: (updatedCart) => {
      qc.setQueryData(['cart'], updatedCart);
    },
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  const { showToast } = useAppContext();

  return useMutation({
    mutationFn: (itemId: string) => apiClient.removeCartItem(itemId),
    onMutate: async (itemId) => {
      await qc.cancelQueries({ queryKey: ['cart'] });
      const prev = qc.getQueryData<CartDTO>(['cart']);
      if (prev) {
        const nextItems = prev.items.filter((i) => i.id !== itemId);
        qc.setQueryData<CartDTO>(['cart'], recomputeOptimisticCart(prev, nextItems));
      }
      return { prev };
    },
    onSuccess: (updatedCart) => {
      qc.setQueryData(['cart'], updatedCart);
      showToast('Item removed from basket', 'info');
    },
    onError: (err: Error, _itemId, ctx) => {
      if (ctx?.prev) qc.setQueryData(['cart'], ctx.prev);
      showToast(err.message || 'Could not remove item', 'error');
    },
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  const { showToast } = useAppContext();

  return useMutation({
    mutationFn: () => apiClient.clearCart(),
    onSuccess: (emptyCart) => {
      qc.setQueryData(['cart'], emptyCart);
      showToast('Basket cleared', 'info');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Could not clear basket', 'error');
    },
  });
}

export function useApplyCoupon() {
  const qc = useQueryClient();
  const { showToast } = useAppContext();

  return useMutation({
    mutationFn: (code: string) => apiClient.applyCoupon(code),
    onSuccess: (updatedCart) => {
      qc.setQueryData(['cart'], updatedCart);
      showToast('Coupon applied!', 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Coupon could not be applied', 'error');
    },
  });
}

export function useRemoveCoupon() {
  const qc = useQueryClient();
  const { showToast } = useAppContext();
  return useMutation({
    mutationFn: () => apiClient.removeCoupon(),
    onSuccess: (updatedCart) => {
      qc.setQueryData(['cart'], updatedCart);
      showToast('Coupon removed', 'info');
    },
  });
}

export function useWishlist() {
  const { isAuthenticated } = useAuth();
  const enabled = !isSupabaseConfigured || isAuthenticated;
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => apiClient.getWishlist(),
    enabled,
  });
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  const { isAuthenticated, openAuthPrompt } = useAuth();
  const { showToast, t } = useAppContext();

  const mutation = useMutation({
    mutationFn: async ({ product, currentlySaved }: { product: ProductSummaryDTO; currentlySaved: boolean }) => {
      if (currentlySaved) {
        await apiClient.removeWishlist(product.id);
      } else {
        await apiClient.addWishlist(product.id);
      }
      return { product, currentlySaved };
    },
    onMutate: async ({ product, currentlySaved }) => {
      await qc.cancelQueries({ queryKey: ['wishlist'] });
      const prev = qc.getQueryData<ProductSummaryDTO[]>(['wishlist']) ?? [];
      const next = currentlySaved
        ? prev.filter((p) => p.id !== product.id)
        : [product, ...prev.filter((p) => p.id !== product.id)];
      qc.setQueryData(['wishlist'], next);
      return { prev };
    },
    onError: (err: Error, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['wishlist'], ctx.prev);
      showToast(err.message || 'Could not update wishlist', 'error');
    },
    onSuccess: ({ currentlySaved }) => {
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      showToast(currentlySaved ? t('removedFromWishlist') : t('savedToWishlist'), 'success');
    },
  });

  const toggle = (product: ProductSummaryDTO, currentlySaved: boolean) => {
    if (isSupabaseConfigured && !isAuthenticated) {
      openAuthPrompt('Continue as Guest in one tap or sign in to save your favourite produce.', () => {
        mutation.mutate({ product, currentlySaved });
      });
      return;
    }
    mutation.mutate({ product, currentlySaved });
  };

  return { ...mutation, toggle };
}

export function useOrders() {
  const { isAuthenticated } = useAuth();
  const enabled = !isSupabaseConfigured || isAuthenticated;
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => apiClient.getOrders(),
    enabled,
  });
}

export function useOrder(id: string) {
  const { isAuthenticated } = useAuth();
  const enabled = Boolean(id) && (!isSupabaseConfigured || isAuthenticated);
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => apiClient.getOrder(id),
    enabled,
  });
}

export function useMe() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.getMe(),
    enabled: !isSupabaseConfigured || isAuthenticated,
  });
}
