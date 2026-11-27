import { Button } from './Button';
import { Icon } from './Icon';

export function EmptyState({
  icon = 'shopping_basket',
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}: {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}) {
  return (
    <div className="bg-cream/65 ghost-border rounded-card p-8 sm:p-12 text-center max-w-lg mx-auto my-6">
      <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
        <Icon name={icon} className="!text-[28px]" />
      </div>
      <h3 className="font-display font-semibold text-lg text-ink mb-2">{title}</h3>
      <p className="text-sm text-on-surface-variant mb-5 leading-relaxed">{description}</p>
      {actionLabel && actionTo && (
        <Button to={actionTo} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
      {actionLabel && onAction && !actionTo && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
