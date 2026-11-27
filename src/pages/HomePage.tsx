import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { CategoryTile } from '../components/CategoryTile';
import { ErrorState } from '../components/ErrorState';
import { FarmerCard } from '../components/FarmerCard';
import { Icon } from '../components/Icon';
import { ProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';
import { SectionHeader } from '../components/SectionHeader';
import { ProductGridSkeleton } from '../components/Skeleton';
import { TrustBadgeStrip } from '../components/TrustBadgeStrip';
import { useAppContext } from '../hooks/useAppContext';
import {
  useAddBatchToCart,
  useAddToCart,
  useCategories,
  useFarmers,
  useProducts,
  useStandardBasket,
} from '../hooks/useStore';
import {
  formatBdt,
  formatWeight,
  getDhakaDispatchCountdown,
  toBanglaDigits,
} from '../lib/format';
import { usePageTitle } from '../lib/usePageTitle';

export function HomePage() {
  const { lang, t, openCartDrawer } = useAppContext();
  usePageTitle(
    'From Farmers Hands to Your Home',
    'Same-day morning harvest from verified Bangladeshi smallholder farmers straight to Dhaka households.'
  );

  const [countdown, setCountdown] = useState(() => getDhakaDispatchCountdown());
  const {
    data: harvestData,
    isLoading: harvestLoading,
    isError: harvestError,
    refetch: refetchHarvest,
  } = useProducts({ harvest: 'today', featured: true, pageSize: 8 });
  const { data: categories = [] } = useCategories();
  const { data: farmers = [] } = useFarmers();
  const { data: standardBasket } = useStandardBasket();
  const { addItem, isPending: addingSingle } = useAddToCart();
  const { addBatch, isPending: addingBatch } = useAddBatchToCart();

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(getDhakaDispatchCountdown());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const countdownStr = `${countdown.hours}:${countdown.minutes}:${countdown.seconds}`;
  const formattedCountdown = lang === 'bn' ? toBanglaDigits(countdownStr) : countdownStr;

  const basketProduct = harvestData?.items.find((p) => p.slug === 'standard-weekly-basket');
  const addingBasket = addingBatch || addingSingle;

  const handleAddWeeklyBasket = () => {
    const onDone = () => {
      if (window.innerWidth >= 1024) {
        openCartDrawer();
      }
    };

    if (standardBasket && standardBasket.items.length > 0) {
      addBatch(
        standardBasket.items.map((item) => ({
          variantId: item.variant_id,
          quantity: 1,
        })),
        onDone
      );
      return;
    }

    if (basketProduct?.variants[0]) {
      addItem(basketProduct.variants[0].id, 1, onDone);
    }
  };

  return (
    <div className="space-y-10 sm:space-y-14 pb-8">
      {/* Hero Section */}
      <section className="bg-cream/65 border-b border-primary/10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-11 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-center">
            {/* Hero Copy */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-3">
                <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
                <span>{t('heroPill')}</span>
              </div>
              <h1 className="font-display font-extrabold text-[28px] leading-[34px] sm:text-4xl sm:leading-[44px] lg:text-[42px] lg:leading-[50px] text-ink max-w-xl [text-wrap:balance]">
                {t('heroHeadline')}
              </h1>
              <p className="text-sm sm:text-base text-on-surface-variant mt-3.5 max-w-xl leading-relaxed">
                {t('heroSubcopy')}
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <Button to="/shop" size="lg">
                  <span>{t('shopFreshHarvest')}</span>
                  <Icon name="arrow_forward" className="!text-[18px]" />
                </Button>
                <Button to="/basket-builder" variant="outline" size="lg">
                  <Icon name="shopping_basket" className="!text-[18px]" />
                  <span>{t('buildYourBasket')}</span>
                </Button>
              </div>

              {/* Hero Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-primary/15">
                <div>
                  <p className="font-display font-bold text-lg text-primary tabular-nums">1,400+</p>
                  <p className="text-[11px] text-on-surface-variant">Verified Farmers</p>
                </div>
                <div>
                  <p className="font-display font-bold text-lg text-primary tabular-nums">78%</p>
                  <p className="text-[11px] text-on-surface-variant">Paid to Growers</p>
                </div>
                <div>
                  <p className="font-display font-bold text-lg text-primary tabular-nums">5:30 AM</p>
                  <p className="text-[11px] text-on-surface-variant">Same-Day Harvest</p>
                </div>
                <div>
                  <p className="font-display font-bold text-lg text-primary tabular-nums">4.9 ★</p>
                  <p className="text-[11px] text-on-surface-variant">12k+ Dhaka Families</p>
                </div>
              </div>
            </div>

            {/* Hero Photo + Traceability Overlay */}
            <div className="lg:col-span-6 relative rounded-card overflow-hidden shadow-card min-h-[260px] sm:min-h-[380px] lg:min-h-[420px]">
              <SafeImage
                src="/src/assets/images/hero_harvest_bangladesh_1795777183291.jpg"
                alt="Fresh morning farm harvest from Bangladesh in woven bamboo baskets"
                lazy={false}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 bg-white/95 backdrop-blur rounded-card p-3.5 sm:p-4 shadow-card flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-alert mb-0.5">
                    Harvested Today · 5:30 AM
                  </p>
                  <p className="font-display font-semibold text-sm text-ink truncate">
                    Shibganj, Bogura → Tejgaon Hub, Dhaka
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">
                    Batch #BD-BG-402-TM · Grower: Karim Mia
                  </p>
                </div>
                <Link
                  to="/product/deshi-tomato"
                  className="shrink-0 w-10 h-10 rounded-btn bg-primary text-white flex items-center justify-center hover:bg-[#1d4b2f] transition-colors"
                  aria-label="View traceability details"
                >
                  <Icon name="qr_code_2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Trust Pillars */}
        <TrustBadgeStrip />

        {/* Today's Fresh Harvest */}
        <section>
          <SectionHeader
            title={t('todaysHarvestTitle')}
            subtitle={t('todaysHarvestSub')}
            seeAllTo="/shop?harvest=today"
            seeAllLabel={t('seeAllPicks')}
            rightSlot={
              <div className="inline-flex items-center gap-2 bg-alert/10 text-alert border border-alert/25 rounded-btn px-3 py-1.5 text-xs font-semibold tabular-nums">
                <Icon name="schedule" className="!text-[16px]" />
                <span>
                  {t('dispatchClosesIn')} {formattedCountdown}
                </span>
              </div>
            }
          />

          {harvestLoading ? (
            <ProductGridSkeleton count={4} />
          ) : harvestError ? (
            <ErrorState onRetry={() => refetchHarvest()} />
          ) : (
            <div className="flex lg:grid lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto lg:overflow-visible no-scrollbar pb-2 lg:pb-0 snap-x">
              {(harvestData?.items ?? []).slice(0, 8).map((product) => (
                <div
                  key={product.id}
                  className="w-[220px] sm:w-[250px] lg:w-auto shrink-0 snap-start"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Shop by Category (10 categories) */}
        <section>
          <SectionHeader
            title={t('shopByCategoryTitle')}
            subtitle={t('shopByCategorySub')}
            seeAllTo="/categories"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <CategoryTile key={cat.id} category={cat} />
            ))}
          </div>
        </section>

        {/* Weekly Basket Builder Panel */}
        <section className="bg-cream rounded-card ghost-border p-5 sm:p-8 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge tone="primary">Auto 15% OFF</Badge>
                <span className="text-xs font-semibold text-on-surface-variant tabular-nums">
                  {standardBasket
                    ? `${formatWeight(standardBasket.total_weight_grams, lang)} · 4-Person Family Pack`
                    : '5.4 kg · 4-Person Family Pack'}
                </span>
              </div>

              <div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink">
                  {t('weeklyBasketTitle')}
                </h2>
                <p className="text-sm text-on-surface-variant font-bengali mt-1">
                  {t('weeklyBasketSub')}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-ink/85 font-medium">
                Includes Bogura Red Potatoes · Pabna Onions · Tender Bottle Gourd · Deshi Tomato &amp; fresh seasonal swaps.
              </p>

              {standardBasket && (
                <div className="bg-white rounded-card ghost-border p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant pb-2 border-b border-primary/10">
                    <span>{standardBasket.title_en}</span>
                    <span>{standardBasket.items.length} staples included</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                    {standardBasket.items.map((item) => (
                      <div key={item.product_id} className="flex justify-between gap-2">
                        <span className="text-ink truncate">
                          {lang === 'bn' ? item.name_bn : item.name_en} ({item.variant_label_en})
                        </span>
                        <span className="font-semibold tabular-nums text-primary shrink-0">
                          {formatBdt(item.unit_price_bdt, lang)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div>
                  <span className="text-xs text-on-surface-variant block">Weekly Price</span>
                  <div className="flex items-baseline gap-2 tabular-nums">
                    <span className="font-display font-bold text-2xl text-primary">
                      {formatBdt(standardBasket?.final_price_bdt ?? 290, lang)}
                    </span>
                    <span className="text-sm text-outline line-through">
                      {formatBdt(standardBasket?.listed_total_bdt ?? 340, lang)}
                    </span>
                    <span className="text-xs font-semibold text-primary">
                      Save 15%
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5 ml-auto">
                  <Button to="/basket-builder" variant="outline">
                    {t('customizeBasket')}
                  </Button>
                  <Button loading={addingBasket} onClick={handleAddWeeklyBasket}>
                    <Icon name="add_shopping_cart" className="!text-[18px]" />
                    <span>{t('addWeeklyBasket')}</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="aspect-[4/3] rounded-card overflow-hidden ghost-border bg-white shadow-card">
                <SafeImage
                  src="/src/assets/images/product_weekly_basket_1795777184690.jpg"
                  alt="Standard 4-Person Weekly Harvest Basket"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Meet Your Farmer */}
        <section>
          <SectionHeader
            title={t('meetFarmersTitle')}
            subtitle={t('meetFarmersSub')}
            seeAllTo="/farmers"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {farmers.slice(0, 3).map((farmer) => (
              <FarmerCard key={farmer.id} farmer={farmer} />
            ))}
          </div>
        </section>

        {/* Seasonal Harvest Calendar + Community Bulk Ordering */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-card ghost-border shadow-card p-6">
            <h2 className="font-display font-bold text-xl text-ink">{t('seasonalCalendarTitle')}</h2>
            <p className="text-sm text-on-surface-variant font-bengali mb-4">
              {t('seasonalCalendarSub')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-cream/70 rounded-card p-4 ghost-border">
                <p className="text-xs font-bold uppercase tracking-wide text-primary mb-2">
                  Harvesting Now
                </p>
                <ul className="space-y-2 text-sm text-ink mt-2">
                  <li className="flex justify-between">
                    <span>Deshi Tomato · Bogura</span>
                    <span className="font-semibold text-primary">Peak</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Red Spinach · Bogura</span>
                    <span className="font-semibold text-primary">Morning</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Himsagar Mango · Bagha</span>
                    <span className="font-semibold text-alert">Limited</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Tender Bottle Gourd · Rangpur</span>
                    <span className="font-semibold text-primary">Fresh</span>
                  </li>
                </ul>
              </div>
              <div className="bg-cream/40 rounded-card p-4 ghost-border">
                <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">
                  Coming Next Month
                </p>
                <ul className="space-y-2 text-sm text-on-surface-variant mt-2">
                  <li className="flex justify-between">
                    <span>Fazli Mango · Chapai</span>
                    <span>Pre-harvest</span>
                  </li>
                  <li className="flex justify-between">
                    <span>New Aman Chinigura · Dinajpur</span>
                    <span>Milling Soon</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Winter Cauliflower · Bogura</span>
                    <span>Sowing</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Raw Mustard Honey · Pabna</span>
                    <span>Bloom Window</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-primary text-white rounded-card p-6 sm:p-7 flex flex-col justify-between shadow-card">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                Apartment &amp; Office Groups
              </p>
              <h2 className="font-display font-bold text-xl sm:text-2xl mb-2">
                {t('communityTitle')}
              </h2>
              <p className="text-sm text-white/85 leading-relaxed mb-5">
                {t('communitySub')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button to="/community-buying" variant="secondary">
                {t('joinCommunity')}
              </Button>
              <span className="text-xs text-white/75">Free hub drop-off for 5+ families</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
