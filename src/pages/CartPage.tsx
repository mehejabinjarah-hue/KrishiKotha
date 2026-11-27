import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthPanel } from '../components/AuthPanel';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Button } from '../components/Button';
import { CartItemRow } from '../components/CartItemRow';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Icon } from '../components/Icon';
import { useAppContext } from '../hooks/useAppContext';
import { useAuth } from '../hooks/useAuth';
import {
  useApplyCoupon,
  useCart,
  useClearCart,
  useRemoveCoupon,
} from '../hooks/useStore';
import { formatBdt, formatNumber, formatWeight } from '../lib/format';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { usePageTitle } from '../lib/usePageTitle';

export function CartPage() {
  const { lang, t } = useAppContext();
  const { isAuthenticated, isGuest } = useAuth();
  const { data: cart, isLoading, isError, refetch } = useCart();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();
  const clearCart = useClearCart();
  const [couponInput, setCouponInput] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  usePageTitle('Your Basket');

  if (isSupabaseConfigured && !isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: t('navCart') }]} />
        <div className="bg-white rounded-card ghost-border shadow-card p-6">
          <h1 className="font-display font-bold text-xl text-ink mb-2">{t('cartTitle')}</h1>
          <AuthPanel reason="Continue as a Guest in one click, or sign in to save your harvest basket across sessions." />
        </div>
      </div>
    );
  }

  const freeDeliveryThreshold = 799;
  const deliveryProgress = cart
    ? Math.min(
        100,
        Math.round(((freeDeliveryThreshold - cart.amount_to_free_delivery_bdt) / freeDeliveryThreshold) * 100)
      )
    : 0;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: t('navCart') }]} />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink">{t('cartTitle')}</h1>
          {cart && cart.items.length > 0 && (
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 tabular-nums">
              {formatNumber(cart.item_count, lang)} items · {formatWeight(cart.total_weight_grams, lang)}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isGuest && isSupabaseConfigured && (
            <Link
              to="/login"
              className="text-xs font-semibold text-primary bg-cream px-3 py-1.5 rounded-btn ghost-border hover:bg-[#ebe6d7]"
            >
              {t('guestBanner')}
            </Link>
          )}

          {cart && cart.items.length > 0 && !confirmClear && (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="text-xs font-semibold text-on-surface-variant hover:text-error px-3 py-1.5 rounded-btn ghost-border bg-white cursor-pointer transition-colors"
            >
              Clear Basket
            </button>
          )}

          {confirmClear && (
            <div className="flex items-center gap-2 bg-error-container/70 px-3 py-1.5 rounded-btn">
              <span className="text-xs font-semibold text-on-error-container">Empty basket?</span>
              <button
                type="button"
                disabled={clearCart.isPending}
                onClick={() => {
                  clearCart.mutate(undefined, {
                    onSuccess: () => setConfirmClear(false),
                  });
                }}
                className="text-xs font-bold text-error hover:underline cursor-pointer"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="text-xs font-semibold text-ink hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 bg-cream/60 rounded-card animate-pulse" />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !cart || cart.items.length === 0 ? (
        <EmptyState
          title={t('emptyCartTitle')}
          description={t('emptyCartDesc')}
          actionLabel={t('browseHarvest')}
          actionTo="/shop"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List */}
          <div className="lg:col-span-8 bg-white rounded-card ghost-border shadow-card p-4 sm:p-6">
            {cart.amount_to_free_delivery_bdt > 0 ? (
              <div className="bg-cream rounded-btn px-4 py-3 text-xs sm:text-sm text-primary font-medium mb-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Icon name="local_shipping" className="!text-[18px] shrink-0" />
                  <span>
                    Add <strong>{formatBdt(cart.amount_to_free_delivery_bdt, lang)}</strong> more for free Dhaka delivery (above {formatBdt(freeDeliveryThreshold, lang)}).
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-primary/15 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${deliveryProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-secondary-container text-on-secondary-container rounded-btn px-4 py-3 text-xs sm:text-sm font-medium mb-4 flex items-center gap-2">
                <Icon name="check_circle" className="!text-[18px] shrink-0" />
                <span>You unlocked FREE Dhaka delivery!</span>
              </div>
            )}

            {cart.distinct_basket_eligible_count > 0 && cart.distinct_basket_eligible_count < 4 && (
              <p className="text-xs text-on-surface-variant mb-3">
                Tip: Add {4 - cart.distinct_basket_eligible_count} more distinct basket-eligible vegetable/green item(s) to unlock an automatic <strong>15% Weekly Basket Saving</strong>!
              </p>
            )}

            <div>
              {cart.items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4 bg-cream/60 rounded-card ghost-border p-5 sm:p-6 space-y-5 sticky top-24">
            <h2 className="font-display font-bold text-lg text-ink">Order Summary</h2>

            {/* Coupon Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = couponInput.trim();
                if (!trimmed) return;
                applyCoupon.mutate(trimmed, {
                  onSuccess: () => setCouponInput(''),
                });
              }}
              className="space-y-2"
            >
              <label htmlFor="cart-page-coupon" className="block text-xs font-semibold text-ink">
                Promo Coupon (try <span className="text-primary">KRISHI100</span> on ৳799+)
              </label>
              <div className="flex gap-2">
                <input
                  id="cart-page-coupon"
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="KRISHI100"
                  className="flex-1 h-11 px-3 rounded-btn ghost-border bg-white text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  type="submit"
                  variant="outline"
                  loading={applyCoupon.isPending}
                >
                  Apply
                </Button>
              </div>
              {cart.coupon_code && (
                <div className="flex items-center justify-between text-xs bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-btn">
                  <span>Applied: <strong>{cart.coupon_code}</strong></span>
                  <button
                    type="button"
                    onClick={() => removeCoupon.mutate()}
                    className="font-semibold underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </form>

            <div className="space-y-2 text-sm border-t border-primary/10 pt-4">
              <div className="flex justify-between text-on-surface-variant">
                <span>Estimated Weight</span>
                <span className="tabular-nums font-medium">
                  {formatWeight(cart.total_weight_grams, lang)}
                </span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>{t('subtotal')}</span>
                <span className="tabular-nums font-medium">{formatBdt(cart.subtotal_bdt, lang)}</span>
              </div>
              {cart.basket_discount_bdt > 0 && (
                <div className="flex justify-between text-primary font-semibold">
                  <span>{t('weeklyBasketSaving')}</span>
                  <span className="tabular-nums">−{formatBdt(cart.basket_discount_bdt, lang)}</span>
                </div>
              )}
              {cart.coupon_discount_bdt > 0 && (
                <div className="flex justify-between text-primary font-semibold">
                  <span>{t('couponDiscount')}</span>
                  <span className="tabular-nums">−{formatBdt(cart.coupon_discount_bdt, lang)}</span>
                </div>
              )}
              <div className="flex justify-between text-on-surface-variant">
                <span>{t('deliveryFee')}</span>
                <span className="tabular-nums font-medium">
                  {cart.delivery_fee_bdt === 0 ? t('freeDelivery') : formatBdt(cart.delivery_fee_bdt, lang)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-ink pt-3 border-t border-primary/10">
                <span>{t('total')}</span>
                <span className="tabular-nums text-primary">{formatBdt(cart.total_bdt, lang)}</span>
              </div>
            </div>

            <Button to="/checkout" fullWidth size="lg">
              <span>{t('proceedToCheckout')}</span>
              <Icon name="arrow_forward" className="!text-[18px]" />
            </Button>

            <Button to="/shop" variant="outline" fullWidth>
              Continue Browsing Harvest
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
