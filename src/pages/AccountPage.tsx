import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { z } from 'zod';
import { profileUpdateSchema } from '../../shared/schemas';
import { AuthPanel } from '../components/AuthPanel';
import { Badge } from '../components/Badge';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { Modal } from '../components/Modal';
import { useAppContext } from '../hooks/useAppContext';
import { useAuth } from '../hooks/useAuth';
import { useMe, useOrder, useOrders } from '../hooks/useStore';
import { apiClient } from '../lib/apiClient';
import { DHAKA_AREAS, formatBdt } from '../lib/format';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { usePageTitle } from '../lib/usePageTitle';

type ProfileForm = z.infer<typeof profileUpdateSchema>;

export function AccountPage() {
  const { isAuthenticated, isGuest, signOut } = useAuth();
  const { lang, setLang, setArea, showToast, t } = useAppContext();
  const { data: profile } = useMe();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const [confirmGuestSignOut, setConfirmGuestSignOut] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  usePageTitle('My Account & Orders');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      address_line: '',
      area: 'Gulshan',
      city: 'Dhaka',
      postal_code: '',
      preferred_language: lang,
    },
  });

  useEffect(() => {
    if (profile) {
      setValue('full_name', profile.full_name || '');
      setValue('phone', profile.phone || '');
      setValue('address_line', profile.address_line || '');
      setValue('area', profile.area || 'Gulshan');
      setValue('city', profile.city || 'Dhaka');
      setValue('postal_code', profile.postal_code || '');
      setValue('preferred_language', profile.preferred_language || lang);
    }
  }, [lang, profile, setValue]);

  if (isSupabaseConfigured && !isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Account' }]} />
        <div className="bg-white rounded-card ghost-border shadow-card p-6">
          <h1 className="font-display font-bold text-xl text-ink mb-2">Account &amp; Order History</h1>
          <AuthPanel reason="Sign in or continue as guest to view your profile and past orders." />
        </div>
      </div>
    );
  }

  const onSaveProfile = async (values: ProfileForm) => {
    try {
      const updated = await apiClient.updateMe(values);
      qc.setQueryData(['me'], updated);
      if (values.preferred_language) setLang(values.preferred_language);
      if (values.area) setArea(values.area);
      showToast('Delivery profile saved!', 'success');
    } catch (err) {
      showToast((err as Error).message || 'Could not save profile', 'error');
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Account' }]} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink">My Account</h1>
          {isGuest && <Badge tone="featured">Guest Session</Badge>}
        </div>
        {isAuthenticated && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isGuest) {
                setConfirmGuestSignOut(true);
                return;
              }
              signOut().then(() => navigate('/'));
            }}
          >
            {t('signOut')}
          </Button>
        )}
      </div>

      {isGuest && (
        <div className="bg-cream ghost-border rounded-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-base text-ink">Keep your orders permanently</h2>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              {isSupabaseConfigured
                ? 'Upgrade your guest session with an email or Google account so your basket and order history stay safe.'
                : 'You are exploring as a Guest in Demo Preview. Connect Supabase to sync orders across devices.'}
            </p>
          </div>
          {isSupabaseConfigured && (
            <Button to="/login" size="sm" className="shrink-0">
              Upgrade Guest Account
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Form */}
        <form
          onSubmit={handleSubmit(onSaveProfile)}
          className="lg:col-span-5 bg-white rounded-card ghost-border shadow-card p-5 sm:p-6 space-y-4"
        >
          <h2 className="font-display font-bold text-lg text-ink">Delivery Profile</h2>

          <div>
            <label htmlFor="profile-name" className="block text-xs font-semibold text-ink mb-1">
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              {...register('full_name')}
              className="w-full h-11 px-3 rounded-btn ghost-border bg-white text-sm"
            />
            {errors.full_name && <p className="text-xs text-error mt-1">{errors.full_name.message}</p>}
          </div>

          <div>
            <label htmlFor="profile-phone" className="block text-xs font-semibold text-ink mb-1">
              Phone Number
            </label>
            <input
              id="profile-phone"
              type="tel"
              {...register('phone')}
              placeholder="017XXXXXXXX"
              className="w-full h-11 px-3 rounded-btn ghost-border bg-white text-sm"
            />
            {errors.phone && <p className="text-xs text-error mt-1">{errors.phone.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="profile-area" className="block text-xs font-semibold text-ink mb-1">
                Dhaka Area
              </label>
              <select
                id="profile-area"
                {...register('area')}
                className="w-full h-11 px-3 rounded-btn ghost-border bg-white text-sm"
              >
                {DHAKA_AREAS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="profile-lang" className="block text-xs font-semibold text-ink mb-1">
                Language
              </label>
              <select
                id="profile-lang"
                {...register('preferred_language')}
                className="w-full h-11 px-3 rounded-btn ghost-border bg-white text-sm"
              >
                <option value="en">English</option>
                <option value="bn">বাংলা</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="profile-address" className="block text-xs font-semibold text-ink mb-1">
              Default Address
            </label>
            <input
              id="profile-address"
              type="text"
              {...register('address_line')}
              placeholder="House, Road, Block"
              className="w-full h-11 px-3 rounded-btn ghost-border bg-white text-sm"
            />
          </div>

          <Button type="submit" loading={isSubmitting}>
            Save Profile
          </Button>
        </form>

        {/* Order History */}
        <div className="lg:col-span-7 bg-white rounded-card ghost-border shadow-card p-5 sm:p-6">
          <h2 className="font-display font-bold text-lg text-ink mb-4">Order History</h2>
          {ordersLoading ? (
            <div className="h-32 bg-cream rounded animate-pulse" />
          ) : orders.length === 0 ? (
            <EmptyState
              icon="receipt_long"
              title="No orders yet"
              description="Once you place a demonstration order, it will appear here with full line-item receipts."
              actionLabel="Shop Fresh Harvest"
              actionTo="/shop"
            />
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <Link
                  key={ord.id}
                  to={`/account/orders/${ord.id}`}
                  className="block rounded-card ghost-border p-4 hover:bg-cream/50 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-display font-bold text-sm text-primary tabular-nums">
                        {ord.order_number}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {new Date(ord.created_at).toLocaleDateString()} · {ord.delivery_area}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone="organic">{ord.status}</Badge>
                      <span className="font-bold text-sm text-ink tabular-nums">
                        {formatBdt(ord.total_bdt, lang)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={confirmGuestSignOut}
        onClose={() => setConfirmGuestSignOut(false)}
        title="Leave Guest Session?"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Signing out of a guest session will clear access to this guest basket unless you link an email or Google account first.
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmGuestSignOut(false)}>
              Stay Signed In
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setConfirmGuestSignOut(false);
                signOut().then(() => navigate('/'));
              }}
            >
              Sign Out Anyway
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function OrderDetailPage() {
  const { id = '' } = useParams();
  const { data: order, isLoading, isError, refetch } = useOrder(id);
  const { lang } = useAppContext();
  usePageTitle('Order Details');

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="h-64 bg-cream rounded-card animate-pulse" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <ErrorState message="Order not found." onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Account', to: '/account' },
          { label: order.order_number },
        ]}
      />
      <div className="bg-white rounded-card ghost-border shadow-card p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-bold text-xl text-ink tabular-nums">
              Order {order.order_number}
            </h1>
            <p className="text-xs text-on-surface-variant">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <Badge tone="organic">{order.status}</Badge>
        </div>

        <div className="bg-cream/60 rounded-card p-4 text-xs sm:text-sm space-y-1">
          <p className="font-semibold text-ink">{order.delivery_name} · {order.delivery_phone}</p>
          <p className="text-on-surface-variant">{order.delivery_address}, {order.delivery_area}</p>
          <p className="text-primary font-medium">{order.delivery_slot}</p>
        </div>

        <div className="space-y-2.5 border-t border-primary/10 pt-4">
          {(order.items ?? []).map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {lang === 'bn' ? item.product_name_bn : item.product_name_en} ({item.variant_label}) × {item.quantity}
              </span>
              <span className="font-semibold tabular-nums">{formatBdt(item.line_total_bdt, lang)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-primary/10 pt-4 flex justify-between text-base font-bold">
          <span>Total Paid (Demo: {order.payment_method.toUpperCase()})</span>
          <span className="text-primary tabular-nums">{formatBdt(order.total_bdt, lang)}</span>
        </div>
      </div>
    </div>
  );
}
