import { useAppContext } from '../hooks/useAppContext';
import { Icon } from './Icon';

export function TrustBadgeStrip() {
  const { t } = useAppContext();

  const items = [
    { icon: 'handshake', title: t('trustDirectTitle'), desc: t('trustDirectDesc') },
    { icon: 'qr_code_2', title: t('trustQrTitle'), desc: t('trustQrDesc') },
    { icon: 'verified_user', title: t('trustNaturalTitle'), desc: t('trustNaturalDesc') },
    { icon: 'payments', title: t('trustPayTitle'), desc: t('trustPayDesc') },
  ];

  return (
    <section aria-label="Trust guarantees" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {items.map((item) => (
        <div
          key={item.icon}
          className="bg-cream/80 ghost-border rounded-card p-4 flex flex-col sm:flex-row items-start gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon name={item.icon} className="!text-[22px]" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm text-ink">{item.title}</h3>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{item.desc}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
