import type { CategoryDTO } from '../../shared/types';
import { useAppContext } from '../hooks/useAppContext';
import { formatBdt } from '../lib/format';

export interface ShopFilterValues {
  category: string;
  district: string;
  practice: string;
  harvest: string;
  maxPrice: number;
}

const DISTRICTS = ['all', 'Bogura', 'Rajshahi', 'Rangpur', 'Dinajpur', 'Pabna'];

const PRACTICES = [
  { value: '', label: 'All Farming Practices' },
  { value: 'organic', label: 'Verified Organic' },
  { value: 'pesticide_free', label: 'Pesticide Free' },
  { value: 'gap_certified', label: 'GAP Certified' },
  { value: 'conventional_verified', label: 'Conventional Verified' },
];

const HARVEST_WINDOWS = [
  { value: '', label: 'Any Harvest Window' },
  { value: 'today', label: 'Harvested Today (5:30 AM)' },
  { value: '12h', label: 'Fresh Batch (12–48h)' },
];

export function FilterSidebar({
  categories,
  values,
  onChange,
  onClear,
}: {
  categories: CategoryDTO[];
  values: ShopFilterValues;
  onChange: (patch: Partial<ShopFilterValues>) => void;
  onClear: () => void;
}) {
  const { lang } = useAppContext();

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-base text-ink">Filters</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-semibold text-primary hover:underline cursor-pointer"
        >
          Clear All Filters
        </button>
      </div>

      {/* Categories */}
      <div className="border-t border-primary/10 pt-4">
        <h3 className="font-display font-semibold text-sm text-ink mb-2.5">Crop Categories</h3>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onChange({ category: 'all' })}
            className={`w-full text-left px-3 py-2 rounded-btn text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
              values.category === 'all' ? 'bg-primary text-white' : 'hover:bg-cream text-ink'
            }`}
          >
            <span>All Harvest</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange({ category: cat.slug })}
              className={`w-full text-left px-3 py-2 rounded-btn text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                values.category === cat.slug ? 'bg-primary text-white' : 'hover:bg-cream text-ink'
              }`}
            >
              <span className="truncate">{lang === 'bn' ? cat.name_bn : cat.name_en}</span>
              {cat.product_count !== undefined && (
                <span className="opacity-75 tabular-nums ml-2">{cat.product_count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Harvest Window */}
      <div className="border-t border-primary/10 pt-4">
        <h3 className="font-display font-semibold text-sm text-ink mb-2.5">Harvest Window</h3>
        <div className="space-y-1.5">
          {HARVEST_WINDOWS.map((h) => (
            <label key={h.value} className="flex items-center gap-2 text-xs text-ink cursor-pointer py-1">
              <input
                type="radio"
                name="harvest"
                checked={values.harvest === h.value}
                onChange={() => onChange({ harvest: h.value })}
                className="accent-primary"
              />
              <span>{h.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Farming Practice */}
      <div className="border-t border-primary/10 pt-4">
        <h3 className="font-display font-semibold text-sm text-ink mb-2.5">Farming Practice</h3>
        <div className="space-y-1.5">
          {PRACTICES.map((p) => (
            <label key={p.value} className="flex items-center gap-2 text-xs text-ink cursor-pointer py-1">
              <input
                type="radio"
                name="practice"
                checked={values.practice === p.value}
                onChange={() => onChange({ practice: p.value })}
                className="accent-primary"
              />
              <span>{p.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Farmer District */}
      <div className="border-t border-primary/10 pt-4">
        <h3 className="font-display font-semibold text-sm text-ink mb-2.5">Farmer District</h3>
        <select
          value={values.district}
          onChange={(e) => onChange({ district: e.target.value })}
          className="w-full h-11 px-3 rounded-btn ghost-border bg-white text-xs font-medium text-ink"
        >
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d === 'all' ? 'All Districts' : d}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="border-t border-primary/10 pt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-semibold text-sm text-ink">Max Price</h3>
          <span className="text-xs font-bold text-primary tabular-nums">
            {values.maxPrice >= 500 ? `${formatBdt(500, lang)}+` : formatBdt(values.maxPrice, lang)}
          </span>
        </div>
        <input
          type="range"
          min={40}
          max={500}
          step={10}
          value={values.maxPrice}
          onChange={(e) => onChange({ maxPrice: Number(e.target.value) })}
          className="w-full accent-primary cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-outline mt-1 tabular-nums">
          <span>{formatBdt(40, lang)}</span>
          <span>{formatBdt(500, lang)}+</span>
        </div>
      </div>
    </aside>
  );
}
