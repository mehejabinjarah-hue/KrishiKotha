import { useAppContext } from '../hooks/useAppContext';
import { Icon } from './Icon';

export function ToastContainer() {
  const { toasts, dismissToast } = useAppContext();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-20 lg:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] pointer-events-none"
    >
      {toasts.map((toast) => {
        const bg =
          toast.variant === 'error'
            ? 'bg-error text-white'
            : toast.variant === 'info'
            ? 'bg-ink text-white'
            : 'bg-primary text-white';

        const icon =
          toast.variant === 'error'
            ? 'error'
            : toast.variant === 'info'
            ? 'info'
            : 'check_circle';

        return (
          <div
            key={toast.id}
            role="status"
            className={`${bg} pointer-events-auto rounded-btn shadow-card-hover px-4 py-3 flex items-center justify-between gap-3 text-sm font-medium`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Icon name={icon} className="!text-[18px] shrink-0" />
              <span className="truncate">{toast.message}</span>
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismissToast(toast.id)}
              className="opacity-80 hover:opacity-100 cursor-pointer shrink-0"
            >
              <Icon name="close" className="!text-[16px]" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
