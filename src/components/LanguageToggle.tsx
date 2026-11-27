import { useAppContext } from '../hooks/useAppContext';

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useAppContext();

  return (
    <div
      role="group"
      aria-label="Language selector"
      className="inline-flex items-center rounded-btn bg-cream p-0.5 ghost-border shrink-0"
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2.5 py-1.5 rounded-[6px] text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
          lang === 'en' ? 'bg-primary text-white' : 'text-ink hover:text-primary'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('bn')}
        className={`px-2.5 py-1.5 rounded-[6px] text-xs font-semibold font-bengali transition-colors whitespace-nowrap cursor-pointer ${
          lang === 'bn' ? 'bg-primary text-white' : 'text-ink hover:text-primary'
        }`}
      >
        {compact ? 'বাং' : 'বাংলা'}
      </button>
    </div>
  );
}
