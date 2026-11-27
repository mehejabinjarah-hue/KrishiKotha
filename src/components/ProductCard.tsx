import { Link } from 'react-router-dom';
import type { ProductSummaryDTO } from '../../shared/types';
import { useAppContext } from '../hooks/useAppContext';
import {
  useAddToCart,
  useCart,
  useToggleWishlist,
  useUpdateCartItem,
  useWishlist,
} from '../hooks/useStore';
import { Button } from './Button';
import { Icon } from './Icon';
import { PriceBlock } from './PriceBlock';
import { QuantityStepper } from './QuantityStepper';
import { RatingStars } from './RatingStars';
import { SafeImage } from './SafeImage';

export function ProductCard({
  product,
  layout = 'grid',
}: {
  product: ProductSummaryDTO;
  layout?: 'grid' | 'list';
}) {
  const { lang, t } = useAppContext();
  const { addItem, isPending: adding } = useAddToCart();
  const updateItem = useUpdateCartItem();
  const { data: cart } = useCart();
  const { data: wishlist = [] } = useWishlist();
  const { toggle: toggleWishlist } = useToggleWishlist();

  const defaultVariant = product.variants.find((v) => v.is_default) ?? product.variants[0];
  const cartMatch = defaultVariant
    ? cart?.items.find((ci) => ci.variant_id === defaultVariant.id)
    : undefined;
  const isSaved = wishlist.some((w) => w.id === product.id);
  const outOfStock = !defaultVariant || defaultVariant.stock_qty <= 0;
  const title = lang === 'bn' ? product.name_bn : product.name_en;
  const subtitle = lang === 'bn' ? product.name_en : product.name_bn;
  const farmerName = lang === 'bn' ? product.farmer?.name_bn : product.farmer?.name_en;

  const tagToneClass = product.harvested_today
    ? 'bg-alert text-white'
    : product.farming_practice === 'organic'
    ? 'bg-secondary-container text-on-secondary-container'
    : 'bg-white/95 text-primary';

  const tagLabel = product.harvested_today
    ? t('harvestedToday')
    : product.farming_practice === 'organic'
    ? t('organic')
    : t('featured');

  const renderCartAction = (compact = false) => {
    if (cartMatch && defaultVariant) {
      return (
        <QuantityStepper
          value={cartMatch.quantity}
          min={0}
          max={Math.min(50, defaultVariant.stock_qty || 50)}
          lang={lang}
          onChange={(next) => updateItem.mutate({ itemId: cartMatch.id, quantity: next })}
        />
      );
    }

    return (
      <Button
        size="sm"
        loading={adding}
        disabled={outOfStock}
        onClick={() => defaultVariant && addItem(defaultVariant.id, 1)}
        className={compact ? '!px-3 !min-h-[38px]' : ''}
      >
        <Icon name={compact ? 'add' : 'add_shopping_cart'} className="!text-[16px]" />
        <span>{outOfStock ? t('outOfStock') : t('addToCart')}</span>
      </Button>
    );
  };

  if (layout === 'list') {
    return (
      <article className="bg-white rounded-card ghost-border shadow-card hover:shadow-card-hover transition-all duration-200 p-3.5 sm:p-4 flex gap-4 items-center">
        <Link
          to={`/product/${product.slug}`}
          className="w-28 h-24 sm:w-36 sm:h-28 rounded-xl overflow-hidden bg-cream shrink-0 relative"
        >
          <SafeImage
            src={product.image_url}
            alt={product.name_en}
            fallbackLabel={product.name_en}
            className="w-full h-full object-cover"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">
              {tagLabel}
            </span>
            <RatingStars rating={product.rating_avg} count={product.rating_count} lang={lang} />
          </div>
          <Link to={`/product/${product.slug}`} className="block group">
            <h3 className="font-display font-semibold text-base text-ink group-hover:text-primary truncate">
              {title}
            </h3>
            <p className="text-xs text-on-surface-variant font-bengali truncate">{subtitle}</p>
          </Link>
          <p className="text-xs text-on-surface-variant mt-1 truncate">
            {farmerName || 'KrishiKotha Grower'} · {product.origin_district}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5">
            {defaultVariant && (
              <div>
                <PriceBlock
                  priceBdt={defaultVariant.price_bdt}
                  compareAtBdt={defaultVariant.compare_at_price_bdt}
                  weightGrams={defaultVariant.unit_weight_grams}
                  lang={lang}
                />
                <span className="text-[11px] text-on-surface-variant">
                  {lang === 'bn' ? defaultVariant.label_bn : defaultVariant.label_en}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                onClick={() => toggleWishlist(product, isSaved)}
                className="w-10 h-10 rounded-btn ghost-border flex items-center justify-center text-ink hover:bg-cream cursor-pointer transition-colors"
              >
                <Icon
                  name="favorite"
                  filled={isSaved}
                  className={isSaved ? 'text-alert' : 'text-on-surface-variant'}
                />
              </button>
              {renderCartAction(false)}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-card ghost-border shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden group">
      <div className="relative aspect-[4/3] bg-cream overflow-hidden">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <SafeImage
            src={product.image_url}
            alt={product.name_en}
            fallbackLabel={product.name_en}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        </Link>
        <span
          className={`absolute top-2.5 left-2.5 pointer-events-none px-2.5 py-1 rounded-md text-[11px] font-semibold leading-none shadow-sm ${tagToneClass}`}
        >
          {tagLabel}
        </span>
        <button
          type="button"
          aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          onClick={() => toggleWishlist(product, isSaved)}
          className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-white/95 shadow-sm flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
        >
          <Icon
            name="favorite"
            filled={isSaved}
            className={`!text-[18px] ${isSaved ? 'text-alert' : 'text-on-surface-variant'}`}
          />
        </button>
      </div>

      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-1 text-[11px] text-on-surface-variant">
          <span className="font-medium truncate">
            {farmerName || 'KrishiKotha'} · {product.origin_district}
          </span>
          <RatingStars rating={product.rating_avg} lang={lang} />
        </div>

        <Link to={`/product/${product.slug}`} className="block mb-1">
          <h3 className="font-display font-semibold text-sm sm:text-base text-ink group-hover:text-primary line-clamp-1">
            {title}
          </h3>
          <p className="text-xs text-on-surface-variant font-bengali line-clamp-1">{subtitle}</p>
        </Link>

        {defaultVariant && (
          <p className="text-[11px] text-outline mb-2.5">
            {lang === 'bn' ? defaultVariant.label_bn : defaultVariant.label_en}
          </p>
        )}

        <div className="mt-auto pt-2.5 border-t border-primary/10 flex items-center justify-between gap-2">
          {defaultVariant ? (
            <PriceBlock
              priceBdt={defaultVariant.price_bdt}
              compareAtBdt={defaultVariant.compare_at_price_bdt}
              lang={lang}
              size="sm"
            />
          ) : (
            <span className="text-xs text-outline">—</span>
          )}

          {renderCartAction(true)}
        </div>
      </div>
    </article>
  );
}
