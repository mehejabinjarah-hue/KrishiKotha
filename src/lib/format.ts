import type { Language } from '../../shared/types';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'] as const;

export const DHAKA_AREAS = [
  'Gulshan',
  'Dhanmondi',
  'Uttara',
  'Banani',
  'Mirpur',
  'Bashundhara R/A',
  'Mohammadpur',
  'Baridhara',
  'Badda',
  'Motijheel',
] as const;

export const DELIVERY_SLOTS = [
  'Morning Dispatch (11:00 AM - 2:00 PM)',
  'Afternoon Window (3:00 PM - 6:00 PM)',
  'Evening Window (6:30 PM - 9:00 PM)',
  'Tomorrow Morning (8:00 AM - 11:00 AM)',
] as const;

export function toBanglaDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

export function formatNumber(value: number, lang: Language): string {
  const formatted = Math.round(value).toLocaleString('en-US');
  return lang === 'bn' ? toBanglaDigits(formatted) : formatted;
}

export function formatBdt(amountBdt: number, lang: Language): string {
  const safe = Math.max(0, Math.round(amountBdt));
  const num = safe.toLocaleString('en-US');
  return lang === 'bn' ? `৳${toBanglaDigits(num)}` : `৳${num}`;
}

export function formatWeight(grams: number, lang: Language): string {
  if (grams >= 1000) {
    const kg = Number((grams / 1000).toFixed(1));
    const str = Number.isInteger(kg) ? String(kg) : kg.toFixed(1);
    return lang === 'bn' ? `${toBanglaDigits(str)} কেজি` : `${str} kg`;
  }
  return lang === 'bn' ? `${toBanglaDigits(grams)} গ্রাম` : `${grams}g`;
}

export function formatPricePerKg(priceBdt: number, weightGrams: number, lang: Language): string | null {
  if (weightGrams <= 0) return null;
  const perKg = Math.round((priceBdt / weightGrams) * 1000);
  return lang === 'bn' ? `${formatBdt(perKg, lang)}/কেজি` : `${formatBdt(perKg, lang)}/kg`;
}

/**
 * Computes HH:MM:SS remaining until the next 11:00 AM Asia/Dhaka (UTC+6) morning dispatch cut-off.
 */
export function getDhakaDispatchCountdown(now: Date = new Date()): {
  hours: string;
  minutes: string;
  seconds: string;
  isNextDay: boolean;
} {
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const dhakaNow = new Date(utcMs + 6 * 3600_000);

  const cutoff = new Date(dhakaNow);
  cutoff.setHours(11, 0, 0, 0);

  let isNextDay = false;
  if (dhakaNow.getTime() >= cutoff.getTime()) {
    cutoff.setDate(cutoff.getDate() + 1);
    isNextDay = true;
  }

  const diffSec = Math.max(0, Math.floor((cutoff.getTime() - dhakaNow.getTime()) / 1000));
  const h = Math.floor(diffSec / 3600);
  const m = Math.floor((diffSec % 3600) / 60);
  const s = diffSec % 60;

  return {
    hours: String(h).padStart(2, '0'),
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0'),
    isNextDay,
  };
}
