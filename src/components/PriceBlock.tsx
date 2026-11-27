import type { Language } from '../../shared/types';
import { formatBdt, formatPricePerKg } from '../lib/format';

export function PriceBlock({
  priceBdt,
  compareAtBdt,
  weightGrams,
  lang,
  size = 'md',
}: {
  priceBdt: number;
  compareAtBdt?: number | null;
  weightGrams?: number;
  lang: Language;
  size?: 'sm' | 'md' | 'lg';
}) {
  const perKg = weightGrams ? formatPricePerKg(priceBdt, weightGrams, lang) : null;
  const priceSize =
    size === 'lg' ? 'text-2xl font-bold' : size === 'sm' ? 'text-sm font-bold' : 'text-base font-bold';

  return (
    <div className="flex flex-wrap items-baseline gap-2 tabular-nums">
      <span className={`text-primary ${priceSize}`}>{formatBdt(priceBdt, lang)}</span>
      {compareAtBdt && compareAtBdt > priceBdt && (
        <span className="text-xs text-outline line-through">{formatBdt(compareAtBdt, lang)}</span>
      )}
      {perKg && <span className="text-[11px] text-on-surface-variant font-medium">({perKg})</span>}
    </div>
  );
}
