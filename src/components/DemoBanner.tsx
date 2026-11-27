import { isSupabaseConfigured } from '../lib/supabaseClient';
import { Icon } from './Icon';

export function DemoBanner() {
  if (isSupabaseConfigured) return null;

  return (
    <div
      role="status"
      className="bg-tertiary-container text-on-tertiary-container border-b border-tertiary/30 px-4 py-2 text-xs sm:text-sm"
    >
      <div className="max-w-[1280px] mx-auto flex items-center justify-center gap-2 text-center font-medium">
        <Icon name="info" className="!text-[18px] shrink-0" />
        <span>
          <strong>DEMO PREVIEW:</strong> sample data, not connected to a database. Sign-in is disabled and cart/wishlist items are stored temporarily in your browser until Supabase is set up.
        </span>
      </div>
    </div>
  );
}
