import { useParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ErrorState } from '../components/ErrorState';
import { FarmerCard } from '../components/FarmerCard';
import { Icon } from '../components/Icon';
import { ProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';
import { useAppContext } from '../hooks/useAppContext';
import { useFarmer, useFarmers } from '../hooks/useStore';
import { usePageTitle } from '../lib/usePageTitle';

export function FarmersPage() {
  const { t } = useAppContext();
  const { data: farmers = [], isLoading, isError, refetch } = useFarmers();
  usePageTitle('Meet Our Farmers');

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: t('navFarmers') }]} />
      <div className="max-w-2xl mb-8">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink">
          {t('meetFarmersTitle')}
        </h1>
        <p className="text-sm text-on-surface-variant font-bengali mt-1">
          {t('meetFarmersSub')}
        </p>
        <p className="text-sm text-on-surface-variant mt-3 leading-relaxed">
          Every crop on KrishiKotha traces back to a verified smallholder grower or cooperative in Bogura, Rajshahi, Rangpur, Dinajpur, or Pabna.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-cream rounded-card animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmers.map((f) => (
            <FarmerCard key={f.id} farmer={f} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FarmerDetailPage() {
  const { slug = '' } = useParams();
  const { lang } = useAppContext();
  const { data, isLoading, isError, refetch } = useFarmer(slug);
  usePageTitle(data?.farmer.name_en || 'Farmer Story');

  if (isLoading) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-10">
        <div className="h-64 bg-cream rounded-card animate-pulse" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-10">
        <ErrorState message="Could not find this farmer profile." onRetry={() => refetch()} />
      </div>
    );
  }

  const { farmer, products } = data;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Farmers', to: '/farmers' },
          { label: farmer.name_en },
        ]}
      />

      <div className="bg-cream/60 rounded-card ghost-border p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-4 aspect-square rounded-card overflow-hidden ghost-border bg-white max-w-xs mx-auto w-full">
          <SafeImage src={farmer.photo_url} alt={farmer.name_en} className="w-full h-full object-cover" />
        </div>
        <div className="md:col-span-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="organic">Verified Grower</Badge>
            <Badge tone="cream">
              {farmer.upazila}, {farmer.district}
            </Badge>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink">
            {lang === 'bn' ? farmer.name_bn : farmer.name_en}
          </h1>
          <p className="text-sm font-semibold text-primary">{farmer.specialty}</p>
          <p className="text-sm text-on-surface-variant leading-relaxed">{farmer.story}</p>
          <blockquote className="text-sm italic text-ink bg-white rounded-btn ghost-border p-4">
            “{farmer.quote}”
          </blockquote>
          <div className="flex flex-wrap gap-6 pt-2 text-xs font-semibold text-ink">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="calendar_today" className="!text-[16px] text-primary" />
              {farmer.years_farming} years farming
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="landscape" className="!text-[16px] text-primary" />
              {farmer.acres} acres cultivated
            </span>
          </div>
        </div>
      </div>

      <section>
        <h2 className="font-display font-bold text-xl sm:text-2xl text-ink mb-5">
          Harvest From {farmer.name_en} ({products.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
