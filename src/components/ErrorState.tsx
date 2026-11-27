import { Button } from './Button';
import { Icon } from './Icon';

export function ErrorState({
  message = 'Something went wrong while loading this data.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="bg-error-container/50 border border-error/25 rounded-card p-6 text-center max-w-lg mx-auto my-6"
    >
      <Icon name="error_outline" className="!text-[30px] text-error mb-2" />
      <p className="text-sm font-medium text-ink mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <Icon name="refresh" className="!text-[16px]" />
          Try Again
        </Button>
      )}
    </div>
  );
}
