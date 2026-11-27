import React from 'react';
import { Link } from 'react-router-dom';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'quickAdd';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  to?: string;
}

export function getButtonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
}: Pick<ButtonProps, 'variant' | 'size' | 'fullWidth' | 'className'>): string {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-55 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer';

  const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-primary text-white hover:bg-[#1b472c] active:scale-[0.985] rounded-btn shadow-sm',
    secondary: 'bg-cream text-primary hover:bg-[#e8e2d1] ghost-border rounded-btn',
    outline: 'bg-white text-primary border border-primary/25 hover:bg-cream/70 hover:border-primary/40 rounded-btn',
    ghost: 'bg-transparent text-ink hover:bg-cream rounded-btn',
    danger: 'bg-error text-white hover:bg-[#991515] rounded-btn shadow-sm',
    quickAdd:
      'bg-primary text-white hover:bg-[#1b472c] rounded-full w-11 h-11 p-0 shadow-card',
  };

  const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: variant === 'quickAdd' ? '' : 'min-h-[38px] px-3.5 py-2 text-xs',
    md: variant === 'quickAdd' ? '' : 'min-h-[44px] px-5 py-2.5 text-sm',
    lg: variant === 'quickAdd' ? '' : 'min-h-[48px] px-6 py-3 text-base',
  };

  return `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  type = 'button',
  to,
  onClick,
  ...rest
}: ButtonProps) {
  const classes = getButtonClasses({ variant, size, fullWidth, className });

  if (to && !disabled && !loading) {
    return (
      <Link
        to={to}
        onClick={onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}
        className={classes}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={classes}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
        />
      )}
      {children}
    </button>
  );
}
