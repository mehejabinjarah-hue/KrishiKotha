import { Icon } from './Icon';

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (next: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 mt-8">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="w-10 h-10 rounded-btn ghost-border bg-white flex items-center justify-center text-ink hover:bg-cream disabled:opacity-40 cursor-pointer"
        aria-label="Previous page"
      >
        <Icon name="chevron_left" />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`w-10 h-10 rounded-btn text-sm font-semibold tabular-nums cursor-pointer transition-colors ${
            p === page
              ? 'bg-primary text-white'
              : 'bg-white text-ink ghost-border hover:bg-cream'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="w-10 h-10 rounded-btn ghost-border bg-white flex items-center justify-center text-ink hover:bg-cream disabled:opacity-40 cursor-pointer"
        aria-label="Next page"
      >
        <Icon name="chevron_right" />
      </button>
    </nav>
  );
}
