import { useLocation, useParams } from 'react-router-dom';
import type { OrderDTO } from '../../shared/types';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { ErrorState } from '../components/ErrorState';
import { Icon } from '../components/Icon';
import { useAppContext } from '../hooks/useAppContext';
import { useOrder } from '../hooks/useStore';
import { formatBdt } from '../lib/format';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { usePageTitle } from '../lib/usePageTitle';

export function OrderConfirmationPage() {
  const { id = '' } = useParams();
  const location = useLocation();
  const stateOrder = (location.state as { order?: OrderDTO } | null)?.order;
  const { data: fetchedOrder, isLoading, isError, refetch } = useOrder(stateOrder ? '' : id);
  const { lang, t } = useAppContext();

  const order = stateOrder || fetchedOrder;
  usePageTitle('Order Confirmation');

  if (!order && isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="h-64 bg-cream rounded-card animate-pulse" />
      </div>
    );
  }

  if (!order || isError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <ErrorState message="Could not find this order receipt." onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white rounded-card ghost-border shadow-card p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-secondary-container text-primary flex items-center justify-center mx-auto">
            <Icon name="check_circle" filled className="!text-[34px]" />
          </div>
          <h1 className="font-display font-bold text-2xl text-ink">{t('orderPlacedTitle')}</h1>
          <p className="text-sm text-on-surface-variant">
            Order Number: <strong className="text-primary tabular-nums">{order.order_number}</strong>
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            <Badge tone="organic">Status: {order.status}</Badge>
            <Badge tone="featured">
              {!isSupabaseConfigured ? 'Preview only: stored locally in browser' : 'Demo: No payment charged'}
            </Badge>
          </div>
        </div>

        <div className="bg-cream/60 rounded-card p-4 text-xs sm:text-sm space-y-1">
          <p className="font-semibold text-ink">{order.delivery_name} · {order.delivery_phone}</p>
          <p className="text-on-surface-variant">{order.delivery_address}, {order.delivery_area}, Dhaka</p>
          <p className="text-primary font-medium">Slot: {order.delivery_slot}</p>
          <p className="text-on-surface-variant">Payment selection: {order.payment_method.toUpperCase()}</p>
        </div>

        {order.items && order.items.length > 0 && (
          <div className="space-y-2.5 border-t border-primary/10 pt-4">
            <h2 className="font-display font-semibold text-sm text-ink">Items Ordered</h2>
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-2 text-sm">
                <span className="text-ink">
                  {lang === 'bn' ? item.product_name_bn : item.product_name_en} ({item.variant_label}) × {item.quantity}
                </span>
                <span className="font-semibold tabular-nums">{formatBdt(item.line_total_bdt, lang)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-primary/10 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-on-surface-variant">
            <span>{t('subtotal')}</span>
            <span className="tabular-nums">{formatBdt(order.subtotal_bdt, lang)}</span>
          </div>
          {order.basket_discount_bdt > 0 && (
            <div className="flex justify-between text-primary">
              <span>{t('weeklyBasketSaving')}</span>
              <span className="tabular-nums">−{formatBdt(order.basket_discount_bdt, lang)}</span>
            </div>
          )}
          {order.coupon_discount_bdt > 0 && (
            <div className="flex justify-between text-primary">
              <span>{t('couponDiscount')}</span>
              <span className="tabular-nums">−{formatBdt(order.coupon_discount_bdt, lang)}</span>
            </div>
          )}
          <div className="flex justify-between text-on-surface-variant">
            <span>{t('deliveryFee')}</span>
            <span className="tabular-nums">
              {order.delivery_fee_bdt === 0 ? t('freeDelivery') : formatBdt(order.delivery_fee_bdt, lang)}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold text-ink pt-2 border-t border-primary/10">
            <span>{t('total')}</span>
            <span className="tabular-nums text-primary">{formatBdt(order.total_bdt, lang)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Button to="/account/orders" variant="outline">
            View Order History
          </Button>
          <Button to="/shop">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
