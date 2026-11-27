import React, { useEffect } from 'react';
import { Icon } from './Icon';

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-modal shadow-card-hover w-full ${maxWidth} max-h-[90vh] overflow-y-auto p-6 relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          {title ? (
            <h2 className="font-display font-bold text-lg text-ink">{title}</h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-cream flex items-center justify-center text-on-surface-variant cursor-pointer"
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
