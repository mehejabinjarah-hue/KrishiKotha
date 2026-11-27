import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { inquirySchema } from '../../shared/schemas';
import type { InquiryType } from '../../shared/types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { useAppContext } from '../hooks/useAppContext';
import { apiClient } from '../lib/apiClient';
import { usePageTitle } from '../lib/usePageTitle';

type InquiryFormValues = z.infer<typeof inquirySchema>;

function InquiryFormCard({
  type,
  title,
  subtitle,
  extraLabel,
  extraPlaceholder,
}: {
  type: InquiryType;
  title: string;
  subtitle: string;
  extraLabel?: string;
  extraPlaceholder?: string;
}) {
  const { showToast } = useAppContext();
  const [submittedMsg, setSubmittedMsg] = useState<string | null>(null);
  const [extraVal, setExtraVal] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { type, name: '', email: '', phone: '', message: '', extra: {} },
  });

  const onSubmit = async (values: InquiryFormValues) => {
    try {
      const res = await apiClient.submitInquiry({
        ...values,
        type,
        extra: extraLabel && extraVal ? { [extraLabel]: extraVal } : {},
      });
      setSubmittedMsg(res.message);
      showToast('Submitted successfully!', 'success');
      reset({ type, name: '', email: '', phone: '', message: '', extra: {} });
      setExtraVal('');
    } catch (err) {
      showToast((err as Error).message || 'Could not submit form', 'error');
    }
  };

  if (submittedMsg) {
    return (
      <div className="bg-secondary-container text-on-secondary-container rounded-card p-6 space-y-3">
        <div className="flex items-center gap-2 font-display font-bold text-lg">
          <Icon name="check_circle" filled />
          <span>Request Received</span>
        </div>
        <p className="text-sm">{submittedMsg}</p>
        <Button size="sm" variant="outline" onClick={() => setSubmittedMsg(null)}>
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-card ghost-border shadow-card p-6 space-y-4"
    >
      <div>
        <h2 className="font-display font-bold text-xl text-ink">{title}</h2>
        <p className="text-sm text-on-surface-variant mt-1">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-ink mb-1">Full Name *</label>
          <input
            type="text"
            {...register('name')}
            className="w-full h-12 px-3.5 rounded-btn ghost-border bg-white text-sm"
          />
          {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink mb-1">Phone Number *</label>
          <input
            type="tel"
            {...register('phone')}
            placeholder="017XXXXXXXX"
            className="w-full h-12 px-3.5 rounded-btn ghost-border bg-white text-sm"
          />
          {errors.phone && <p className="text-xs text-error mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-ink mb-1">Email (Optional)</label>
        <input
          type="email"
          {...register('email')}
          placeholder="you@example.com"
          className="w-full h-12 px-3.5 rounded-btn ghost-border bg-white text-sm"
        />
        {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
      </div>

      {extraLabel && (
        <div>
          <label className="block text-xs font-semibold text-ink mb-1">{extraLabel}</label>
          <input
            type="text"
            value={extraVal}
            onChange={(e) => setExtraVal(e.target.value)}
            placeholder={extraPlaceholder}
            className="w-full h-12 px-3.5 rounded-btn ghost-border bg-white text-sm"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-ink mb-1">Details / Message</label>
        <textarea
          rows={3}
          {...register('message')}
          className="w-full p-3.5 rounded-btn ghost-border bg-white text-sm"
        />
      </div>

      <Button type="submit" size="lg" loading={isSubmitting}>
        Submit Request
      </Button>
    </form>
  );
}

export function ContactPage() {
  usePageTitle('Contact Us');
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-4">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink">Contact KrishiKotha</h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Have a question about morning dispatch, batch QR traceability, or your Dhaka order? Reach our dispatch team directly.
          </p>
          <div className="bg-cream/60 rounded-card ghost-border p-5 space-y-3 text-sm">
            <p><strong>Hotline:</strong> +880 9612-445566 (6:00 AM – 10:00 PM)</p>
            <p><strong>Tejgaon Hub:</strong> 42 Tejgaon Industrial Area, Dhaka 1208</p>
            <p><strong>Uttara Hub:</strong> Road 14, Sector 7, Uttara, Dhaka 1230</p>
          </div>
        </div>
        <div className="lg:col-span-7">
          <InquiryFormCard
            type="contact"
            title="Send Us a Message"
            subtitle="We respond to household queries within 2 hours during dispatch hours."
          />
        </div>
      </div>
    </div>
  );
}

export function BecomeSellerPage() {
  usePageTitle('Become a Seller');
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Become a Seller' }]} />
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink">
        Partner With KrishiKotha (কৃষক হিসেবে যুক্ত হন)
      </h1>
      <p className="text-sm text-on-surface-variant leading-relaxed">
        Are you a smallholder farmer, orchard grower, or village cooperative in Bangladesh? Sell directly to Dhaka households with guaranteed morning pickup and fair farm-gate payout.
      </p>
      <InquiryFormCard
        type="seller"
        title="Farmer & Cooperative Registration"
        subtitle="Our field agronomist in your district will visit your plot within 5 days."
        extraLabel="District & Primary Crops"
        extraPlaceholder="e.g. Bogura — Deshi Tomato, Lal Shak"
      />
    </div>
  );
}

export function CommunityBuyingPage() {
  usePageTitle('Community Group Buying');
  return (
    <div className="max-w-3xl mx-auto px-4 sm:py-10 px-4 py-6 space-y-6">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Community Buying' }]} />
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink">
        Neighborhood Community Buying
      </h1>
      <p className="text-sm text-on-surface-variant leading-relaxed">
        Organize 5+ families in your apartment building or office in Gulshan, Dhanmondi, Uttara, Banani, or Mirpur to receive bulk morning harvest crates with up to 18% savings and zero delivery fee.
      </p>
      <InquiryFormCard
        type="community_building"
        title="Register Your Apartment or Office Group"
        subtitle="Note: Community coordinator requests are stored for dispatch coordination; group engine runs offline via hub coordinator."
        extraLabel="Apartment / Building & Area"
        extraPlaceholder="e.g. Greenview Apartments, Dhanmondi Road 9A (8 families)"
      />
    </div>
  );
}
