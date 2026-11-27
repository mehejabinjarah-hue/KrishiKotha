import type { Language } from '../../shared/types';
import { formatNumber } from '../lib/format';
import { Icon } from './Icon';

export function QuantityStepper({
  value,
  min = 1,
  max = 50,
  onChange,
  disabled = false,
  lang = 'en',
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  lang?: Language;
}) {
  return (
    <div className="inline-flex items-center rounded-btn ghost-border bg-white overflow-hidden">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center text-ink hover:bg-cream disabled:opacity-40 cursor-pointer transition-colors"
      >
        <Icon name="remove" className="!text-[18px]" />
      </button>
      <span className="w-9 text-center text-sm font-semibold tabular-nums select-none">
        {formatNumber(value, lang)}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center text-ink hover:bg-cream disabled:opacity-40 cursor-pointer transition-colors"
      >
        <Icon name="add" className="!text-[18px]" />
      </button>
    </div>
  );
}
