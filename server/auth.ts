import type { IncomingMessage } from 'node:http';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ApiError } from './http.js';
import { createPublicSupabaseClient, createUserSupabaseClient } from './supabase.js';

export interface AuthContext {
  userId: string;
  isGuest: boolean;
  email: string | null;
  accessToken: string;
  client: SupabaseClient;
}

export function extractBearerToken(req: IncomingMessage): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

/**
 * Validates the caller's Supabase JWT on every protected API route via supabase.auth.getUser(token).
 * Rejects missing, expired, or forged tokens with 401. Never trusts client-supplied user IDs.
 */
export async function requireAuth(req: IncomingMessage): Promise<AuthContext> {
  const token = extractBearerToken(req);
  if (!token) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Sign in or continue as guest to access this feature.');
  }

  const publicClient = createPublicSupabaseClient();
  const { data, error } = await publicClient.auth.getUser(token);

  if (error || !data?.user) {
    throw new ApiError(401, 'INVALID_TOKEN', 'Your session has expired. Please sign in again.');
  }

  const userClient = createUserSupabaseClient(token);

  return {
    userId: data.user.id,
    isGuest: Boolean(data.user.is_anonymous),
    email: data.user.email ?? null,
    accessToken: token,
    client: userClient,
  };
}

export async function optionalAuth(req: IncomingMessage): Promise<AuthContext | null> {
  const token = extractBearerToken(req);
  if (!token) return null;
  try {
    return await requireAuth(req);
  } catch {
    return null;
  }
}
