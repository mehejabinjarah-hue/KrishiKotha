import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';

export function SectionHeader({
  title,
  subtitle,
  seeAllTo,
  seeAllLabel,
  rightSlot,
}: {
  title: string;
  subtitle?: string;
  seeAllTo?: string;
  seeAllLabel?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5">
      <div>
        <h2 className="font-display font-bold text-xl sm:text-2xl text-ink">{title}</h2>
        {subtitle && (
          <p className="text-sm text-on-surface-variant font-bengali mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {rightSlot}
        {seeAllTo && (
          <Link
            to={seeAllTo}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline whitespace-nowrap shrink-0"
          >
            <span>{seeAllLabel || 'See All'}</span>
            <Icon name="arrow_forward" className="!text-[16px]" />
          </Link>
        )}
      </div>
    </div>
  );
}
