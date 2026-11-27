import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

function isPlaceholder(val: string): boolean {
  return (
    val === '' ||
    val.includes('YOUR-PROJECT-REF') ||
    val.includes('YOUR_SUPABASE')
  );
}

export const isSupabaseConfigured =
  !isPlaceholder(rawUrl) &&
  !isPlaceholder(rawAnonKey) &&
  rawUrl.startsWith('https://');

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(rawUrl, rawAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
