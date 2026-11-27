import { useEffect, useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  lazy?: boolean;
  fallbackLabel?: string;
}

export function SafeImage({
  src,
  alt,
  className = '',
  lazy = true,
  fallbackLabel,
}: SafeImageProps) {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [src]);

  if (errored || !src) {
    const initial = (fallbackLabel || alt || 'K').trim().charAt(0).toUpperCase();
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-cream to-[#ebe5d4] text-primary/80 select-none ${className}`}
      >
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-1.5">
          <span className="font-display font-bold text-lg text-primary">{initial}</span>
        </div>
        <span className="text-[11px] font-medium text-primary/75 px-2 text-center line-clamp-1">
          {fallbackLabel || 'KrishiKotha'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={lazy ? 'lazy' : 'eager'}
      referrerPolicy="no-referrer"
      onError={() => setErrored(true)}
      className={className}
    />
  );
}
