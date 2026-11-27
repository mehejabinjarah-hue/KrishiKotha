import { describe, expect, it } from 'vitest';
import { formatBdt, formatWeight, toBanglaDigits } from '../src/lib/format';

describe('format utilities', () => {
  it('formats BDT with Latin numerals in EN and Bangla numerals in BN', () => {
    expect(formatBdt(65, 'en')).toBe('৳65');
    expect(formatBdt(65, 'bn')).toBe('৳৬৫');
    expect(formatBdt(1290, 'en')).toBe('৳1,290');
    expect(formatBdt(1290, 'bn')).toBe('৳১,২৯০');
  });

  it('converts digits cleanly', () => {
    expect(toBanglaDigits('01712-345678')).toBe('০১৭১২-৩৪৫৬৭৮');
  });

  it('formats weights in grams and kilograms', () => {
    expect(formatWeight(500, 'en')).toBe('500g');
    expect(formatWeight(500, 'bn')).toBe('৫০০ গ্রাম');
    expect(formatWeight(5400, 'en')).toBe('5.4 kg');
    expect(formatWeight(5400, 'bn')).toBe('৫.৪ কেজি');
  });
});
