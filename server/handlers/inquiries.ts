import { inquirySchema } from '../../shared/schemas.js';
import type { AuthContext } from '../auth.js';
import { ApiError } from '../http.js';
import { createPublicSupabaseClient } from '../supabase.js';

export async function handleCreateInquiry(
  rawBody: unknown,
  auth: AuthContext | null
): Promise<{ submitted: true; message: string }> {
  const parsed = inquirySchema.safeParse(rawBody);
  if (!parsed.success) {
    throw new ApiError(
      422,
      'VALIDATION_ERROR',
      parsed.error.issues[0]?.message || 'Please check the form fields',
      parsed.error.issues
    );
  }

  const client = auth ? auth.client : createPublicSupabaseClient();
  const { error } = await client.from('inquiries').insert({
    type: parsed.data.type,
    name: parsed.data.name,
    email: parsed.data.email || '',
    phone: parsed.data.phone,
    message: parsed.data.message || '',
    extra: parsed.data.extra || {},
    user_id: auth?.userId ?? null,
  });

  if (error) {
    throw new ApiError(500, 'DB_ERROR', 'Could not submit your request. Please try again.');
  }

  return {
    submitted: true,
    message: 'Thank you! Our team has received your submission and will contact you shortly.',
  };
}
