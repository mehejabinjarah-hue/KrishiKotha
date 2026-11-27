import { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { useApplyCoupon, useCart, useClearCart, useRemoveCoupon } from '../hooks/useStore';
import { formatBdt, formatNumber } from '../lib/format';
import { Button } from './Button';
import { CartItemRow } from './CartItemRow';
import { EmptyState } from './EmptyState';
import { Icon } from './Icon';

export function CartDrawer() {
  const { isCartDrawerOpen, closeCartDrawer, lang, t } = useAppContext();
  const { data: cart, isLoading } = useCart();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();
  const clearCart = useClearCart();
  const [couponCode, setCouponCode] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isCartDrawerOpen) return null;

  const items = cart?.items ?? [];
  const threshold = cart?.free_delivery_threshold_bdt ?? 799;
  const remaining = cart?.amount_to_free_delivery_bdt ?? threshold;
  const progressPct = Math.min(100, Math.max(0, Math.round(((threshold - remaining) / threshold) * 100)));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mini cart drawer"
      className="fixed inset-0 z-50 flex justify-end bg-ink/45 backdrop-blur-[2px]"
      onClick={closeCartDrawer}
    >
      <aside
        className="bg-white w-full max-w-md h-full flex flex-col shadow-card-hover rounded-l-modal overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-primary/10 flex items-center justify-between bg-cream/70">
          <div className="flex items-center gap-2.5">
            <Icon name="shopping_basket" className="text-primary" />
            <div>
              <h2 className="font-display font-bold text-base text-ink leading-tight">{t('cartTitle')}</h2>
              {items.length > 0 && cart && (
                <p className="text-[11px] text-on-surface-variant tabular-nums">
                  {formatNumber(cart.item_count, lang)} {lang === 'bn' ? 'টি আইটেম' : 'items'}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {items.length > 0 && !confirmClear && (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="text-xs font-medium text-on-surface-variant hover:text-error px-2.5 py-1.5 rounded-btn hover:bg-cream cursor-pointer transition-colors"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              aria-label="Close basket"
              onClick={closeCartDrawer}
              className="w-9 h-9 rounded-full hover:bg-cream flex items-center justify-center cursor-pointer transition-colors"
            >
              <Icon name="close" />
            </button>
          </div>
        </div>

        {confirmClear && items.length > 0 && (
          <div className="px-5 py-2.5 bg-error-container/60 border-b border-error/15 flex items-center justify-between gap-2 text-xs">
            <span className="font-medium text-on-error-container">Empty your basket?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="px-2.5 py-1 rounded-btn bg-white text-ink font-semibold cursor-pointer"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={() => {
                  clearCart.mutate();
                  setConfirmClear(false);
                }}
                className="px-2.5 py-1 rounded-btn bg-error text-white font-semibold cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {isLoading ? (
            <div className="space-y-3 py-4">
              <div className="h-20 bg-cream rounded-card animate-pulse" />
              <div className="h-20 bg-cream rounded-card animate-pulse" />
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title={t('emptyCartTitle')}
              description={t('emptyCartDesc')}
              actionLabel={t('browseHarvest')}
              actionTo="/shop"
              onAction={closeCartDrawer}
            />
          ) : (
            <div>
              {cart && (
                <div className="bg-cream/85 rounded-card p-3 mb-3 space-y-2 ghost-border">
                  <div className="flex items-center justify-between gap-2 text-xs font-medium text-primary">
                    <span className="inline-flex items-center gap-1.5">
                      <Icon
                        name={remaining > 0 ? 'local_shipping' : 'check_circle'}
                        className="!text-[16px]"
                      />
                      {remaining > 0
                        ? `Add ${formatBdt(remaining, lang)} more for free Dhaka delivery`
                        : 'Free Dhaka delivery unlocked!'}
                    </span>
                    <span className="tabular-nums font-bold">{progressPct}%</span>
                  </div>
                  <div className="h-1.5 bg-primary/15 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}

              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && cart && (
          <div className="p-5 border-t border-primary/10 bg-cream/50 space-y-3.5">
            {/* Compact coupon form inside drawer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (couponCode.trim()) {
                  applyCoupon.mutate(couponCode.trim(), {
                    onSuccess: () => setCouponCode(''),
                  });
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Promo code (try KRISHI100)"
                aria-label="Promo coupon code"
                className="flex-1 h-10 px-3 rounded-btn ghost-border bg-white text-xs uppercase focus:border-primary focus:outline-none"
              />
              <Button type="submit" size="sm" variant="outline" loading={applyCoupon.isPending}>
                Apply
              </Button>
            </form>

            {cart.coupon_code && (
              <div className="flex items-center justify-between text-xs bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-btn">
                <span>
                  Coupon applied: <strong>{cart.coupon_code}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => removeCoupon.mutate()}
                  className="font-semibold underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>{t('subtotal')}</span>
                <span className="tabular-nums font-medium">{formatBdt(cart.subtotal_bdt, lang)}</span>
              </div>
              {cart.basket_discount_bdt > 0 && (
                <div className="flex justify-between text-primary font-medium">
                  <span>{t('weeklyBasketSaving')}</span>
                  <span className="tabular-nums">−{formatBdt(cart.basket_discount_bdt, lang)}</span>
                </div>
              )}
              {cart.coupon_discount_bdt > 0 && (
                <div className="flex justify-between text-primary font-medium">
                  <span>{t('couponDiscount')} ({cart.coupon_code})</span>
                  <span className="tabular-nums">−{formatBdt(cart.coupon_discount_bdt, lang)}</span>
                </div>
              )}
              <div className="flex justify-between text-on-surface-variant">
                <span>{t('deliveryFee')}</span>
                <span className="tabular-nums font-medium">
                  {cart.delivery_fee_bdt === 0 ? t('freeDelivery') : formatBdt(cart.delivery_fee_bdt, lang)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-ink pt-2 border-t border-primary/10">
                <span>{t('total')}</span>
                <span className="tabular-nums text-primary">{formatBdt(cart.total_bdt, lang)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Button to="/cart" variant="outline" fullWidth onClick={closeCartDrawer}>
                View Basket
              </Button>
              <Button to="/checkout" fullWidth onClick={closeCartDrawer}>
                {t('proceedToCheckout')}
              </Button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
