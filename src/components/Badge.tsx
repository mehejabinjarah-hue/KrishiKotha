import React from 'react';

export type BadgeTone = 'alert' | 'organic' | 'featured' | 'cream' | 'primary';

export function Badge({
  tone = 'cream',
  children,
  className = '',
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  const styles: Record<BadgeTone, string> = {
    alert: 'bg-alert text-white',
    organic: 'bg-secondary-container text-on-secondary-container',
    featured: 'bg-tertiary-container text-on-tertiary-container',
    cream: 'bg-cream text-ink ghost-border',
    primary: 'bg-primary text-white',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold leading-none whitespace-nowrap shrink-0 ${styles[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Chip({
  active = false,
  onClick,
  children,
  className = '',
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
        active
          ? 'bg-primary text-white shadow-sm'
          : 'bg-cream text-ink ghost-border hover:bg-[#ebe6d7]'
      } ${className}`}
    >
      {children}
    </button>
  );
}
