import { Breadcrumbs } from '../components/Breadcrumbs';
import { CategoryTile } from '../components/CategoryTile';
import { useAppContext } from '../hooks/useAppContext';
import { useCategories } from '../hooks/useStore';
import { usePageTitle } from '../lib/usePageTitle';

export function CategoriesPage() {
  const { t } = useAppContext();
  usePageTitle('Categories', 'Browse all 10 fresh Bangladeshi produce and pantry categories.');
  const { data: categories = [] } = useCategories();

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: t('navCategories') }]} />
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink mb-1">
        {t('shopByCategoryTitle')}
      </h1>
      <p className="text-sm text-on-surface-variant font-bengali mb-6">
        {t('shopByCategorySub')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <CategoryTile key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  );
}
