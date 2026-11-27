import { Link } from 'react-router-dom';
import type { FarmerDTO } from '../../shared/types';
import { useAppContext } from '../hooks/useAppContext';
import { formatNumber } from '../lib/format';
import { Icon } from './Icon';
import { SafeImage } from './SafeImage';

export function FarmerCard({ farmer }: { farmer: FarmerDTO }) {
  const { lang, t } = useAppContext();
  const name = lang === 'bn' ? farmer.name_bn : farmer.name_en;

  return (
    <article className="bg-white rounded-card ghost-border shadow-card overflow-hidden flex flex-col">
      <div className="p-4 flex items-center gap-3.5 bg-cream/60 border-b border-primary/10">
        <div className="w-16 h-16 rounded-full overflow-hidden ghost-border shrink-0 bg-cream">
          <SafeImage
            src={farmer.photo_url}
            alt={farmer.name_en}
            fallbackLabel={farmer.name_en}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-display font-semibold text-base text-ink truncate">{name}</h3>
            {farmer.is_verified && (
              <Icon name="verified" filled className="!text-[16px] text-primary shrink-0" />
            )}
          </div>
          <p className="text-xs text-on-surface-variant">
            {farmer.upazila ? `${farmer.upazila}, ` : ''}
            {farmer.district}
          </p>
          <p className="text-[11px] text-primary font-medium mt-0.5 tabular-nums">
            {formatNumber(farmer.years_farming, lang)} {lang === 'bn' ? 'বছর অভিজ্ঞতা' : 'yrs farming'} ·{' '}
            {farmer.acres} {lang === 'bn' ? 'একর' : 'acres'}
          </p>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs font-semibold text-primary mb-1.5">{farmer.specialty}</p>
        <p className="text-sm text-on-surface-variant italic line-clamp-3 mb-4">
          “{farmer.quote}”
        </p>
        <div className="mt-auto">
          <Link
            to={`/farmers/${farmer.slug}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            <span>{t('readStory')}</span>
            <Icon name="arrow_forward" className="!text-[16px]" />
          </Link>
        </div>
      </div>
    </article>
  );
}
