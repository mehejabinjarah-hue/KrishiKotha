import { AuthPanel } from '../components/AuthPanel';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ProductCard } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../hooks/useStore';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { usePageTitle } from '../lib/usePageTitle';

export function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { data: items = [], isLoading, isError, refetch } = useWishlist();
  usePageTitle('Saved Harvest');

  if (isSupabaseConfigured && !isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Saved Items' }]} />
        <div className="bg-white rounded-card ghost-border shadow-card p-6">
          <h1 className="font-display font-bold text-xl text-ink mb-2">Saved Harvest</h1>
          <AuthPanel reason="Continue as Guest or sign in to view and manage your saved produce items." />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Saved Items' }]} />
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink mb-6">
        Saved Produce ({items.length})
      </h1>

      {isLoading ? (
        <ProductGridSkeleton count={4} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="favorite_border"
          title="No saved items yet"
          description="Tap the heart icon on any vegetable, fruit, or pantry staple to save it for your next order."
          actionLabel="Explore Fresh Harvest"
          actionTo="/shop"
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
