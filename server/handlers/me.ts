import { profileUpdateSchema } from '../../shared/schemas.js';
import type { ProfileDTO } from '../../shared/types.js';
import type { AuthContext } from '../auth.js';
import { ApiError } from '../http.js';

export async function handleGetMe(auth: AuthContext): Promise<ProfileDTO> {
  const { data, error } = await auth.client
    .from('profiles')
    .select('id, full_name, phone, address_line, area, city, postal_code, preferred_language, avatar_url, is_guest')
    .eq('id', auth.userId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, 'DB_ERROR', 'Could not load profile');
  }

  if (!data) {
    // Fallback profile creation if user predated trigger
    const { data: inserted, error: insErr } = await auth.client
      .from('profiles')
      .upsert({ id: auth.userId, is_guest: auth.isGuest })
      .select('id, full_name, phone, address_line, area, city, postal_code, preferred_language, avatar_url, is_guest')
      .single();

    if (insErr || !inserted) {
      throw new ApiError(500, 'DB_ERROR', 'Could not initialize profile');
    }
    return inserted as ProfileDTO;
  }

  return data as ProfileDTO;
}

export async function handleUpdateMe(auth: AuthContext, rawBody: unknown): Promise<ProfileDTO> {
  const parsed = profileUpdateSchema.safeParse(rawBody);
  if (!parsed.success) {
    throw new ApiError(422, 'VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid profile details', parsed.error.issues);
  }

  const updateData = {
    full_name: parsed.data.full_name,
    phone: parsed.data.phone,
    address_line: parsed.data.address_line ?? '',
    area: parsed.data.area,
    city: parsed.data.city ?? 'Dhaka',
    postal_code: parsed.data.postal_code ?? '',
    ...(parsed.data.preferred_language ? { preferred_language: parsed.data.preferred_language } : {}),
  };

  const { data, error } = await auth.client
    .from('profiles')
    .update(updateData)
    .eq('id', auth.userId)
    .select('id, full_name, phone, address_line, area, city, postal_code, preferred_language, avatar_url, is_guest')
    .single();

  if (error || !data) {
    throw new ApiError(500, 'DB_ERROR', 'Could not update profile');
  }

  return data as ProfileDTO;
}
