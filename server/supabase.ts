import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getServerEnv } from './env.js';
import { ApiError } from './http.js';

export function createPublicSupabaseClient(): SupabaseClient {
  const env = getServerEnv();
  if (!env.isConfigured) {
    throw new ApiError(
      503,
      'SUPABASE_NOT_CONFIGURED',
      'Database is not connected yet. Configure Supabase environment variables to enable live persistence.'
    );
  }
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Creates a per-request Supabase client authenticated with the caller's validated JWT.
 * Row Level Security (RLS) enforces strict user isolation on every query without needing a service-role key.
 */
export function createUserSupabaseClient(accessToken: string): SupabaseClient {
  const env = getServerEnv();
  if (!env.isConfigured) {
    throw new ApiError(
      503,
      'SUPABASE_NOT_CONFIGURED',
      'Database is not connected yet. Configure Supabase environment variables to enable live persistence.'
    );
  }
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
