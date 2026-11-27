import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import type { SortOption } from '../../shared/types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { FilterBottomSheet } from '../components/FilterBottomSheet';
import { FilterSidebar, type ShopFilterValues } from '../components/FilterSidebar';
import { Icon } from '../components/Icon';
import { Pagination } from '../components/Pagination';
import { ProductCard } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import { SortSelect } from '../components/SortSelect';
import { useAppContext } from '../hooks/useAppContext';
import { useCategories, useProducts } from '../hooks/useStore';
import { formatNumber } from '../lib/format';
import { usePageTitle } from '../lib/usePageTitle';

export function ShopPage() {
  const { slug: routeCategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { lang } = useAppContext();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const q = searchParams.get('q') || '';
  const category = routeCategory || searchParams.get('category') || 'all';
  const district = searchParams.get('district') || 'all';
  const practice = searchParams.get('practice') || '';
  const harvest = searchParams.get('harvest') || '';
  const maxPrice = Number(searchParams.get('maxPrice') || 500);
  const sort = (searchParams.get('sort') as SortOption) || 'freshest';
  const page = Number(searchParams.get('page') || 1);

  const { data: categories = [] } = useCategories();
  const activeCat = categories.find((c) => c.slug === category);

  usePageTitle(
    activeCat ? activeCat.name_en : 'Shop Fresh Harvest',
    'Browse verified farm-direct vegetables, leafy greens, fruits, rice, lentils, and cold-pressed oils.'
  );

  const queryParams = useMemo(
    () => ({
      q: q || undefined,
      category: category !== 'all' ? category : undefined,
      district: district !== 'all' ? district : undefined,
      practice: practice || undefined,
      harvest: harvest || undefined,
      maxPrice: maxPrice < 500 ? maxPrice : undefined,
      sort,
      page,
      pageSize: 8,
    }),
    [category, district, harvest, maxPrice, page, practice, q, sort]
  );

  const { data, isLoading, isError, refetch } = useProducts(queryParams);

  const updateParams = (patch: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === '' || v === 'all') {
        next.delete(k);
      } else {
        next.set(k, String(v));
      }
    });
    if (!('page' in patch)) next.delete('page');
    setSearchParams(next);
  };

  const clearAll = () => {
    setSearchParams(new URLSearchParams());
  };

  const filterValues: ShopFilterValues = {
    category,
    district,
    practice,
    harvest,
    maxPrice,
  };

  const activeFilterChips: { label: string; onClear: () => void }[] = [];
  if (q) activeFilterChips.push({ label: `Search: "${q}"`, onClear: () => updateParams({ q: undefined }) });
  if (category !== 'all')
    activeFilterChips.push({
      label: activeCat ? activeCat.name_en : category,
      onClear: () => updateParams({ category: undefined }),
    });
  if (district !== 'all')
    activeFilterChips.push({ label: `District: ${district}`, onClear: () => updateParams({ district: undefined }) });
  if (practice)
    activeFilterChips.push({ label: practice.replace('_', ' '), onClear: () => updateParams({ practice: undefined }) });
  if (harvest)
    activeFilterChips.push({ label: `Harvest: ${harvest}`, onClear: () => updateParams({ harvest: undefined }) });
  if (maxPrice < 500)
    activeFilterChips.push({ label: `Max ৳${maxPrice}`, onClear: () => updateParams({ maxPrice: undefined }) });

  const startItem = data && data.total > 0 ? (data.page - 1) * data.pageSize + 1 : 0;
  const endItem = data ? Math.min(data.page * data.pageSize, data.total) : 0;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Shop Harvest', to: '/shop' },
          ...(activeCat ? [{ label: lang === 'bn' ? activeCat.name_bn : activeCat.name_en }] : []),
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink">
            {activeCat
              ? lang === 'bn'
                ? activeCat.name_bn
                : activeCat.name_en
              : lang === 'bn'
              ? 'সব তাজা ফসল'
              : 'Shop Fresh Harvest'}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 tabular-nums">
            {data
              ? `Showing ${formatNumber(startItem, lang)}–${formatNumber(endItem, lang)} of ${formatNumber(
                  data.total,
                  lang
                )} items`
              : 'Loading harvest...'}
          </p>
        </div>

        {/* Mobile search bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden"
          >
            <Icon name="tune" className="!text-[18px]" />
            <span>Filters</span>
          </Button>
          <SortSelect value={sort} onChange={(next) => updateParams({ sort: next })} />
          <div className="hidden sm:inline-flex rounded-btn ghost-border bg-white p-0.5">
            <button
              type="button"
              aria-label="Grid view"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-[6px] cursor-pointer ${
                viewMode === 'grid' ? 'bg-primary text-white' : 'text-on-surface-variant'
              }`}
            >
              <Icon name="grid_view" className="!text-[18px]" />
            </button>
            <button
              type="button"
              aria-label="List view"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-[6px] cursor-pointer ${
                viewMode === 'list' ? 'bg-primary text-white' : 'text-on-surface-variant'
              }`}
            >
              <Icon name="view_list" className="!text-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {activeFilterChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.onClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream ghost-border text-xs font-semibold text-ink hover:bg-[#ebe6d7] cursor-pointer"
            >
              <span>{chip.label}</span>
              <Icon name="close" className="!text-[14px]" />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold text-primary hover:underline ml-1 cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="bg-white rounded-card ghost-border p-5 sticky top-32">
            <FilterSidebar
              categories={categories}
              values={filterValues}
              onChange={(patch) =>
                updateParams({
                  category: patch.category,
                  district: patch.district,
                  practice: patch.practice,
                  harvest: patch.harvest,
                  maxPrice: patch.maxPrice === 500 ? undefined : patch.maxPrice,
                })
              }
              onClear={clearAll}
            />
          </div>
        </div>

        {/* Product Results */}
        <div className="lg:col-span-9">
          {isLoading ? (
            <ProductGridSkeleton count={8} />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              icon="search_off"
              title="No matching produce found"
              description="Try clearing a filter or searching for another item like tomato, mango, rice, or spinach."
              actionLabel="Clear All Filters"
              onAction={clearAll}
            />
          ) : (
            <>
              {viewMode === 'list' ? (
                <div className="space-y-4">
                  {data.items.map((product) => (
                    <ProductCard key={product.id} product={product} layout="list" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                  {data.items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onPageChange={(nextPage) => updateParams({ page: nextPage })}
              />
            </>
          )}
        </div>
      </div>

      <FilterBottomSheet
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        categories={categories}
        values={filterValues}
        onChange={(patch) =>
          updateParams({
            category: patch.category,
            district: patch.district,
            practice: patch.practice,
            harvest: patch.harvest,
            maxPrice: patch.maxPrice === 500 ? undefined : patch.maxPrice,
          })
        }
        onClear={clearAll}
      />
    </div>
  );
}
