import type { HealthDTO } from '../../shared/types.js';
import { getServerEnv } from '../env.js';
import { createPublicSupabaseClient } from '../supabase.js';

export async function handleHealth(): Promise<HealthDTO> {
  const env = getServerEnv();
  if (!env.isConfigured) {
    return {
      status: 'demo_mode',
      supabaseConfigured: false,
      databaseReachable: false,
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const client = createPublicSupabaseClient();
    const { error } = await client.from('categories').select('id').limit(1);
    return {
      status: error ? 'degraded' : 'connected',
      supabaseConfigured: true,
      databaseReachable: !error,
      timestamp: new Date().toISOString(),
    };
  } catch {
    return {
      status: 'degraded',
      supabaseConfigured: true,
      databaseReachable: false,
      timestamp: new Date().toISOString(),
    };
  }
}
