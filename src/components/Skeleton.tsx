
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-card ghost-border overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-cream" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 w-2/3 bg-cream rounded" />
        <div className="h-4 w-4/5 bg-cream rounded" />
        <div className="h-3 w-1/2 bg-cream rounded" />
        <div className="pt-2 flex items-center justify-between">
          <div className="h-5 w-16 bg-cream rounded" />
          <div className="h-9 w-20 bg-cream rounded-btn" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
