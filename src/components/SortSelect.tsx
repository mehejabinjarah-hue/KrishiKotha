import type { SortOption } from '../../shared/types';

export function SortSelect({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (next: SortOption) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-on-surface-variant">
      <span className="font-medium whitespace-nowrap">Sort by:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="h-10 px-3 rounded-btn ghost-border bg-white text-ink text-xs sm:text-sm font-medium focus:outline-primary cursor-pointer"
      >
        <option value="freshest">Harvest Time (Freshest First)</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating">Farmer Trust Rating</option>
        <option value="popular">Most Loved by Households</option>
      </select>
    </label>
  );
}
