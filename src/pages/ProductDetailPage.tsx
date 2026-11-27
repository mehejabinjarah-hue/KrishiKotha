import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Button } from '../components/Button';
import { ErrorState } from '../components/ErrorState';
import { Icon } from '../components/Icon';
import { PriceBlock } from '../components/PriceBlock';
import { ProductCard } from '../components/ProductCard';
import { QuantityStepper } from '../components/QuantityStepper';
import { RatingStars } from '../components/RatingStars';
import { SafeImage } from '../components/SafeImage';
import { SectionHeader } from '../components/SectionHeader';
import { useAppContext } from '../hooks/useAppContext';
import { useAddToCart, useCart, useProduct, useToggleWishlist, useWishlist } from '../hooks/useStore';
import { formatBdt, formatNumber } from '../lib/format';
import { usePageTitle } from '../lib/usePageTitle';

export function ProductDetailPage() {
  const { slug = '' } = useParams();
  const { lang, t, area } = useAppContext();
  const { data: product, isLoading, isError, refetch } = useProduct(slug);
  const { data: cart } = useCart();
  const { addItem, isPending: addingToCart } = useAddToCart();
  const { data: wishlist = [] } = useWishlist();
  const { toggle: toggleWishlist } = useToggleWishlist();

  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    setSelectedVariantId('');
    setActiveImage('');
    setQuantity(1);
  }, [slug]);

  useEffect(() => {
    if (product) {
      const def = product.variants.find((v) => v.is_default) ?? product.variants[0];
      setSelectedVariantId(def?.id ?? '');
      setActiveImage(product.image_url);
      setQuantity(1);
    }
  }, [product]);

  usePageTitle(product?.name_en || 'Product Details', product?.description_en);

  if (isLoading) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
        <div className="h-4 w-48 bg-cream rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 aspect-[4/3] bg-cream rounded-card" />
          <div className="lg:col-span-6 space-y-4">
            <div className="h-8 w-2/3 bg-cream rounded" />
            <div className="h-6 w-1/3 bg-cream rounded" />
            <div className="h-24 w-full bg-cream rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-12">
        <ErrorState
          message="We couldn't find that produce item."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];
  const isSaved = wishlist.some((w) => w.id === product.id);
  const outOfStock = !activeVariant || activeVariant.stock_qty <= 0;
  const lineTotal = (activeVariant?.price_bdt ?? 0) * quantity;
  const existingCartItem = activeVariant
    ? cart?.items.find((i) => i.variant_id === activeVariant.id)
    : undefined;

  const title = lang === 'bn' ? product.name_bn : product.name_en;
  const subtitle = lang === 'bn' ? product.name_en : product.name_bn;
  const description = lang === 'bn' ? product.description_bn : product.description_en;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 lg:pb-10">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Shop Harvest', to: '/shop' },
          ...(product.category
            ? [{ label: product.category.name_en, to: `/category/${product.category.slug}` }]
            : []),
          { label: product.name_en },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Gallery */}
        <div className="lg:col-span-6 space-y-3">
          <div className="aspect-[4/3] rounded-card overflow-hidden bg-cream ghost-border shadow-card">
            <SafeImage
              src={activeImage || product.image_url}
              alt={product.name_en}
              lazy={false}
              className="w-full h-full object-cover"
            />
          </div>
          {product.gallery_urls.length > 1 && (
            <div className="flex gap-3">
              {product.gallery_urls.map((url, idx) => (
                <button
                  key={`${url}-${idx}`}
                  type="button"
                  onClick={() => setActiveImage(url)}
                  className={`w-20 h-16 rounded-btn overflow-hidden ghost-border cursor-pointer ${
                    activeImage === url ? 'ring-2 ring-primary' : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  <SafeImage src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Module */}
        <div className="lg:col-span-6 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            {product.harvested_today && <Badge tone="alert">{product.harvest_label}</Badge>}
            {product.badges.slice(0, 1).map((b) => (
              <Badge key={b} tone="organic">
                {b}
              </Badge>
            ))}
          </div>

          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink">{title}</h1>
            <p className="text-base text-on-surface-variant font-bengali mt-0.5">{subtitle}</p>
            <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-on-surface-variant">
              <RatingStars rating={product.rating_avg} count={product.rating_count} lang={lang} />
              {product.farmer && (
                <Link
                  to={`/farmers/${product.farmer.slug}`}
                  className="font-semibold text-primary hover:underline"
                >
                  Grower: {lang === 'bn' ? product.farmer.name_bn : product.farmer.name_en} ({product.origin_district})
                </Link>
              )}
            </div>
          </div>

          {activeVariant && (
            <PriceBlock
              priceBdt={activeVariant.price_bdt}
              compareAtBdt={activeVariant.compare_at_price_bdt}
              weightGrams={activeVariant.unit_weight_grams}
              lang={lang}
              size="lg"
            />
          )}

          <p className="text-sm text-on-surface-variant leading-relaxed">{description}</p>

          {/* Generic Variant Selector (Pack Size) */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">
              {t('selectedPackSize')}
            </label>
            <div className="flex flex-wrap gap-2.5">
              {product.variants.map((variant) => {
                const selected = variant.id === activeVariant?.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`px-4 py-2.5 rounded-btn text-left transition-colors cursor-pointer ${
                      selected
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-cream text-ink ghost-border hover:bg-[#ebe6d7]'
                    }`}
                  >
                    <span className="block text-xs font-semibold">
                      {lang === 'bn' ? variant.label_bn : variant.label_en}
                    </span>
                    <span className={`block text-xs tabular-nums ${selected ? 'text-white/90' : 'text-primary font-bold'}`}>
                      {formatBdt(variant.price_bdt, lang)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity + Add CTA */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div>
              <span className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                {t('quantity')}
              </span>
              <QuantityStepper
                value={quantity}
                max={Math.min(50, activeVariant?.stock_qty || 50)}
                lang={lang}
                onChange={setQuantity}
              />
            </div>

            <div className="flex-1 min-w-[200px] pt-5 flex items-center gap-2.5">
              <Button
                fullWidth
                size="lg"
                loading={addingToCart}
                disabled={outOfStock}
                onClick={() => activeVariant && addItem(activeVariant.id, quantity)}
              >
                <Icon name="shopping_basket" className="!text-[18px]" />
                <span>
                  {outOfStock
                    ? t('outOfStock')
                    : `${t('addToBasket')} • ${formatBdt(lineTotal, lang)}`}
                </span>
              </Button>
              <button
                type="button"
                aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                onClick={() => toggleWishlist(product, isSaved)}
                className="h-12 w-12 rounded-btn ghost-border bg-white hover:bg-cream flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Icon
                  name="favorite"
                  filled={isSaved}
                  className={isSaved ? 'text-alert' : 'text-on-surface-variant'}
                />
              </button>
            </div>
          </div>

          {existingCartItem && (
            <div className="flex items-center justify-between text-xs bg-secondary-container text-on-secondary-container rounded-btn px-3.5 py-2">
              <span className="font-medium">
                Already in basket: <strong>{formatNumber(existingCartItem.quantity, lang)}</strong> ×{' '}
                {existingCartItem.variant_label_en}
              </span>
              <Link to="/cart" className="font-bold underline">
                View Basket
              </Link>
            </div>
          )}

          <div className="bg-cream/80 ghost-border rounded-card p-3.5 flex items-center gap-3 text-xs text-ink">
            <Icon name="local_shipping" className="text-primary shrink-0" />
            <span>
              Same-day delivery to <strong>Dhaka ({area})</strong> from {product.origin_hub} when ordered before 11:00 AM.
            </span>
          </div>
        </div>
      </div>

      {/* Traceability Log + Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
        <div className="lg:col-span-6 bg-cream/60 rounded-card ghost-border p-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="font-display font-bold text-lg text-ink">{t('traceabilityLog')}</h2>
            {product.trace_id && (
              <Badge tone="primary">Trace ID #{product.trace_id}</Badge>
            )}
          </div>
          {product.farmer && (
            <p className="text-xs text-on-surface-variant mb-4">
              Grower: <strong>{product.farmer.name_en}</strong> · {product.farmer.upazila},{' '}
              {product.farmer.district} ({product.farmer.acres} acres)
            </p>
          )}
          <div className="space-y-4">
            {product.trace_log.map((entry, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  {idx < product.trace_log.length - 1 && (
                    <div className="w-px flex-1 bg-primary/20 my-1" />
                  )}
                </div>
                <div className="pb-2">
                  <p className="text-xs font-bold text-primary">{entry.time}</p>
                  <h3 className="font-display font-semibold text-sm text-ink">{entry.title}</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">{entry.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 bg-white rounded-card ghost-border shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-ink">{t('reviewsTitle')}</h2>
            <RatingStars rating={product.rating_avg} count={product.rating_count} lang={lang} />
          </div>
          <div className="space-y-4">
            {product.reviews.map((rev) => (
              <div key={rev.id} className="pb-4 border-b border-primary/10 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-ink">
                    {rev.author_name} · <span className="text-on-surface-variant font-normal">{rev.area}</span>
                  </span>
                  <RatingStars rating={rev.rating} />
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fair-Share Banner */}
      <section className="mt-10 bg-primary text-white rounded-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-lg">{t('fairShareTitle')}</h2>
          <p className="text-sm text-white/85 mt-1">{t('fairShareDesc')}</p>
        </div>
        <Button to="/traceability" variant="secondary" className="shrink-0">
          How Traceability Works
        </Button>
      </section>

      {/* Related Harvest */}
      {product.related.length > 0 && (
        <section className="mt-12">
          <SectionHeader title={t('moreHarvest')} seeAllTo="/shop?harvest=today" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {product.related.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Purchase Bar */}
      <div className="lg:hidden fixed bottom-16 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-primary/15 px-4 py-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="block text-[11px] text-on-surface-variant truncate">
            {activeVariant?.label_en} × {quantity}
          </span>
          <span className="font-display font-bold text-sm text-primary tabular-nums">
            {formatBdt(lineTotal, lang)}
          </span>
        </div>
        <Button
          size="sm"
          loading={addingToCart}
          disabled={outOfStock}
          onClick={() => activeVariant && addItem(activeVariant.id, quantity)}
        >
          {outOfStock ? t('outOfStock') : t('addToBasket')}
        </Button>
      </div>
    </div>
  );
}
