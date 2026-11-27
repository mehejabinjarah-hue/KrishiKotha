import { Link } from 'react-router-dom';
import type { CartItemDTO } from '../../shared/types';
import { useAppContext } from '../hooks/useAppContext';
import { useRemoveCartItem, useUpdateCartItem } from '../hooks/useStore';
import { formatBdt, formatWeight } from '../lib/format';
import { Icon } from './Icon';
import { QuantityStepper } from './QuantityStepper';
import { SafeImage } from './SafeImage';

export function CartItemRow({ item }: { item: CartItemDTO }) {
  const { lang } = useAppContext();
  const updateMut = useUpdateCartItem();
  const removeMut = useRemoveCartItem();

  const title = lang === 'bn' ? item.product_name_bn : item.product_name_en;
  const variantLabel = lang === 'bn' ? item.variant_label_bn : item.variant_label_en;
  const totalGrams = item.unit_weight_grams * item.quantity;

  return (
    <div className="flex gap-3.5 py-4 border-b border-primary/10 last:border-b-0 items-start">
      <Link
        to={`/product/${item.product_slug}`}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-cream shrink-0 ghost-border"
      >
        <SafeImage
          src={item.image_url}
          alt={item.product_name_en}
          fallbackLabel={item.product_name_en}
          className="w-full h-full object-cover"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/product/${item.product_slug}`} className="hover:text-primary min-w-0">
            <h4 className="font-display font-semibold text-sm sm:text-base text-ink truncate">
              {title}
            </h4>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {variantLabel} · <span className="tabular-nums">{formatBdt(item.unit_price_bdt, lang)}</span>
              {item.basket_eligible && (
                <span className="text-primary font-medium"> · Basket eligible</span>
              )}
            </p>
            <p className="text-[11px] text-outline mt-0.5">
              {item.farmer_name_en} · {item.origin_district} · {formatWeight(totalGrams, lang)}
            </p>
          </Link>
          <button
            type="button"
            aria-label={`Remove ${item.product_name_en}`}
            disabled={removeMut.isPending}
            onClick={() => removeMut.mutate(item.id)}
            className="text-outline hover:text-error p-1.5 rounded-btn hover:bg-error-container/30 cursor-pointer transition-colors"
          >
            <Icon name="delete_outline" className="!text-[19px]" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 mt-3">
          <QuantityStepper
            value={item.quantity}
            min={0}
            max={Math.min(50, item.stock_qty || 50)}
            lang={lang}
            onChange={(next) => updateMut.mutate({ itemId: item.id, quantity: next })}
          />
          <div className="text-right">
            <span className="font-display font-bold text-sm sm:text-base text-primary tabular-nums">
              {formatBdt(item.line_total_bdt, lang)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
