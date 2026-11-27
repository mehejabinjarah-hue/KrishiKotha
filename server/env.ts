export interface ServerEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConfigured: boolean;
  appUrl: string;
}

function isPlaceholder(val: string | undefined): boolean {
  if (!val) return true;
  const trimmed = val.trim();
  return (
    trimmed === '' ||
    trimmed.includes('YOUR-PROJECT-REF') ||
    trimmed.includes('YOUR_SUPABASE') ||
    trimmed === 'MY_APP_URL'
  );
}

export function getServerEnv(): ServerEnv {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const supabaseAnonKey = (
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ''
  ).trim();
  const appUrl = (process.env.APP_URL || process.env.VERCEL_URL || '').trim();

  const isConfigured =
    !isPlaceholder(supabaseUrl) &&
    !isPlaceholder(supabaseAnonKey) &&
    supabaseUrl.startsWith('https://');

  return {
    supabaseUrl,
    supabaseAnonKey,
    isConfigured,
    appUrl,
  };
}
