import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import type { z } from 'zod';
import { placeOrderSchema } from '../../shared/schemas';
import { AuthPanel } from '../components/AuthPanel';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { useAppContext } from '../hooks/useAppContext';
import { useAuth } from '../hooks/useAuth';
import { useCart, useMe } from '../hooks/useStore';
import { apiClient } from '../lib/apiClient';
import { DELIVERY_SLOTS, DHAKA_AREAS, formatBdt } from '../lib/format';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { usePageTitle } from '../lib/usePageTitle';

type CheckoutFormValues = z.infer<typeof placeOrderSchema>;

export function CheckoutPage() {
  const { lang, t, area, showToast } = useAppContext();
  const { isAuthenticated } = useAuth();
  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: profile } = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [idempotencyKey] = useState(() =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `kk-${Date.now()}`
  );
  const [serverError, setServerError] = useState<string | null>(null);

  usePageTitle('Demonstration Checkout');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(placeOrderSchema),
    defaultValues: {
      delivery_name: '',
      delivery_phone: '',
      delivery_address: '',
      delivery_area: area,
      delivery_slot: DELIVERY_SLOTS[0],
      payment_method: 'cod',
      notes: '',
      idempotency_key: idempotencyKey,
    },
  });

  useEffect(() => {
    if (profile) {
      if (profile.full_name) setValue('delivery_name', profile.full_name);
      if (profile.phone) setValue('delivery_phone', profile.phone);
      if (profile.address_line) setValue('delivery_address', profile.address_line);
      if (profile.area) setValue('delivery_area', profile.area);
    }
  }, [profile, setValue]);

  const paymentMethod = watch('payment_method');

  if (isSupabaseConfigured && !isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Checkout' }]} />
        <div className="bg-white rounded-card ghost-border shadow-card p-6">
          <h1 className="font-display font-bold text-xl text-ink mb-2">Sign in to Checkout</h1>
          <AuthPanel reason="Continue as Guest or sign in so we can attach this demonstration order to your account." />
        </div>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-12">
        <div className="h-64 bg-cream rounded-card animate-pulse" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-10">
        <EmptyState
          title={t('emptyCartTitle')}
          description="Add fresh produce to your basket before proceeding to demonstration checkout."
          actionLabel={t('browseHarvest')}
          actionTo="/shop"
        />
      </div>
    );
  }

  const onSubmit = async (values: CheckoutFormValues) => {
    setServerError(null);
    try {
      const order = await apiClient.placeOrder({
        ...values,
        idempotency_key: idempotencyKey,
      });
      await qc.invalidateQueries({ queryKey: ['cart'] });
      await qc.invalidateQueries({ queryKey: ['orders'] });
      showToast('Demonstration order placed!', 'success');
      navigate(`/order-confirmation/${order.id}`, { state: { order } });
    } catch (err) {
      const msg = (err as Error).message || 'Could not place demonstration order.';
      setServerError(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Basket', to: '/cart' },
          { label: 'Checkout' },
        ]}
      />

      <div className="bg-tertiary-container text-on-tertiary-container border border-tertiary/40 rounded-card p-4 mb-6 flex items-start gap-3">
        <Icon name="info" className="!text-[22px] shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <p className="font-bold">Demonstration Checkout Only</p>
          <p>{t('demoCheckoutNotice')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-card ghost-border shadow-card p-5 sm:p-6 space-y-4">
            <h1 className="font-display font-bold text-xl text-ink">Delivery Details (Dhaka)</h1>

            {serverError && (
              <div role="alert" className="bg-error-container text-on-error-container rounded-btn px-4 py-3 text-sm font-medium">
                {serverError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Full Name *</label>
                <input
                  type="text"
                  {...register('delivery_name')}
                  placeholder="e.g. Nusrat Jahan"
                  className="w-full h-12 px-3.5 rounded-btn ghost-border bg-white text-sm"
                />
                {errors.delivery_name && (
                  <p className="text-xs text-error mt-1">{errors.delivery_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  {...register('delivery_phone')}
                  placeholder="01712345678"
                  className="w-full h-12 px-3.5 rounded-btn ghost-border bg-white text-sm"
                />
                {errors.delivery_phone && (
                  <p className="text-xs text-error mt-1">{errors.delivery_phone.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Dhaka Area *</label>
                <select
                  {...register('delivery_area')}
                  className="w-full h-12 px-3.5 rounded-btn ghost-border bg-white text-sm"
                >
                  {DHAKA_AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                {errors.delivery_area && (
                  <p className="text-xs text-error mt-1">{errors.delivery_area.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Delivery Time Slot *</label>
                <select
                  {...register('delivery_slot')}
                  className="w-full h-12 px-3.5 rounded-btn ghost-border bg-white text-sm"
                >
                  {DELIVERY_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">House / Road / Apartment Address *</label>
              <input
                type="text"
                {...register('delivery_address')}
                placeholder="House 14, Road 11, Block F, Banani"
                className="w-full h-12 px-3.5 rounded-btn ghost-border bg-white text-sm"
              />
              {errors.delivery_address && (
                <p className="text-xs text-error mt-1">{errors.delivery_address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Delivery Notes (Optional)</label>
              <textarea
                rows={2}
                {...register('notes')}
                placeholder="Call on arrival at the gate"
                className="w-full p-3 rounded-btn ghost-border bg-white text-sm"
              />
            </div>
          </div>

          {/* Payment Method Selection (Demo) */}
          <div className="bg-white rounded-card ghost-border shadow-card p-5 sm:p-6 space-y-3">
            <h2 className="font-display font-bold text-lg text-ink">
              Payment Method (Demonstration Preview)
            </h2>
            <p className="text-xs text-on-surface-variant">
              No payment gateway is connected. Your choice is saved as a demonstration selection.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {[
                { id: 'cod', label: 'Cash on Delivery', icon: 'payments' },
                { id: 'bkash', label: 'bKash (Demo)', icon: 'account_balance_wallet' },
                { id: 'nagad', label: 'Nagad (Demo)', icon: 'smartphone' },
                { id: 'card', label: 'Card (Demo)', icon: 'credit_card' },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`rounded-btn p-3 cursor-pointer flex flex-col items-center text-center gap-1.5 transition-colors ${
                    paymentMethod === m.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-cream text-ink ghost-border hover:bg-[#ebe6d7]'
                  }`}
                >
                  <input
                    type="radio"
                    value={m.id}
                    {...register('payment_method')}
                    className="sr-only"
                  />
                  <Icon name={m.icon} className="!text-[20px]" />
                  <span className="text-xs font-semibold">{m.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5 bg-cream/60 rounded-card ghost-border p-5 sm:p-6 space-y-4 sticky top-24">
          <h2 className="font-display font-bold text-lg text-ink">Basket Summary ({cart.item_count} items)</h2>
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-2 text-xs">
                <span className="text-ink">
                  {lang === 'bn' ? item.product_name_bn : item.product_name_en} ({item.variant_label_en}) × {item.quantity}
                </span>
                <span className="font-semibold tabular-nums shrink-0">
                  {formatBdt(item.line_total_bdt, lang)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-primary/10 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-on-surface-variant">
              <span>{t('subtotal')}</span>
              <span className="tabular-nums">{formatBdt(cart.subtotal_bdt, lang)}</span>
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
              <span className="tabular-nums">
                {cart.delivery_fee_bdt === 0 ? t('freeDelivery') : formatBdt(cart.delivery_fee_bdt, lang)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold text-ink pt-2 border-t border-primary/10">
              <span>{t('total')}</span>
              <span className="tabular-nums text-primary">{formatBdt(cart.total_bdt, lang)}</span>
            </div>
          </div>

          <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
            {t('placeDemoOrder')}
          </Button>
        </div>
      </form>
    </div>
  );
}
