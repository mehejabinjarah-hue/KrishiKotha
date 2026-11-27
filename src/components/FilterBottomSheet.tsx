import type { CategoryDTO } from '../../shared/types';
import { Button } from './Button';
import { FilterSidebar, type ShopFilterValues } from './FilterSidebar';
import { Icon } from './Icon';

export function FilterBottomSheet({
  open,
  onClose,
  categories,
  values,
  onChange,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  categories: CategoryDTO[];
  values: ShopFilterValues;
  onChange: (patch: Partial<ShopFilterValues>) => void;
  onClear: () => void;
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-ink/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-modal max-h-[85vh] overflow-y-auto p-5 shadow-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-display font-bold text-base text-ink">Filter Harvest</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="w-9 h-9 rounded-full hover:bg-cream flex items-center justify-center cursor-pointer"
          >
            <Icon name="close" />
          </button>
        </div>

        <FilterSidebar
          categories={categories}
          values={values}
          onChange={onChange}
          onClear={onClear}
        />

        <div className="sticky bottom-0 bg-white pt-4 mt-4 border-t border-primary/10">
          <Button fullWidth onClick={onClose}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
