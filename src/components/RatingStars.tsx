import type { Language } from '../../shared/types';
import { formatNumber } from '../lib/format';
import { Icon } from './Icon';

export function RatingStars({
  rating,
  count,
  lang = 'en',
}: {
  rating: number;
  count?: number;
  lang?: Language;
}) {
  return (
    <div className="inline-flex items-center gap-1 text-xs font-medium text-ink tabular-nums">
      <Icon name="star" filled className="!text-[15px] text-tertiary" />
      <span className="font-semibold">{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-on-surface-variant">({formatNumber(count, lang)})</span>
      )}
    </div>
  );
}
