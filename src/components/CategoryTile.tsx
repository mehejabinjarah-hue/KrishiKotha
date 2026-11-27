import { Link } from 'react-router-dom';
import type { CategoryDTO } from '../../shared/types';
import { useAppContext } from '../hooks/useAppContext';
import { formatNumber } from '../lib/format';
import { Icon } from './Icon';

export function CategoryTile({ category }: { category: CategoryDTO }) {
  const { lang } = useAppContext();
  const primaryName = lang === 'bn' ? category.name_bn : category.name_en;
  const secondaryName = lang === 'bn' ? category.name_en : category.name_bn;

  return (
    <Link
      to={`/category/${category.slug}`}
      className="bg-cream hover:bg-[#ebe6d7] ghost-border rounded-card p-3.5 sm:p-4 flex items-center gap-3 transition-colors group"
    >
      <div className="w-11 h-11 rounded-xl bg-white text-primary flex items-center justify-center shadow-sm shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
        <Icon name={category.icon || 'eco'} className="!text-[22px]" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display font-semibold text-sm text-ink truncate">{primaryName}</h3>
        <p className="text-xs text-on-surface-variant font-bengali truncate">{secondaryName}</p>
        {category.product_count !== undefined && (
          <p className="text-[11px] text-primary font-medium mt-0.5 tabular-nums">
            {formatNumber(category.product_count, lang)} {lang === 'bn' ? 'টি পণ্য' : 'items'}
          </p>
        )}
      </div>
    </Link>
  );
}
