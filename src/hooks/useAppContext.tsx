import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Language } from '../../shared/types';
import { DHAKA_AREAS } from '../lib/format';
import { tKey, type TranslationKey } from '../lib/i18n';

interface ToastItem {
  id: string;
  message: string;
  variant: 'success' | 'error' | 'info';
}

interface AppContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
  area: string;
  setArea: (area: string) => void;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toasts: ToastItem[];
  showToast: (message: string, variant?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const LANG_KEY = 'kk_lang_v1';
const AREA_KEY = 'kk_area_v1';

const memoryPrefs: { lang?: Language; area?: string } = {};

function readPref(key: string): string | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function writePref(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // ignore storage errors in restricted iframes
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (memoryPrefs.lang) return memoryPrefs.lang;
    return readPref(LANG_KEY) === 'bn' ? 'bn' : 'en';
  });

  const [area, setAreaState] = useState<string>(() => {
    if (memoryPrefs.area) return memoryPrefs.area;
    return readPref(AREA_KEY) || DHAKA_AREAS[0];
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
  }, [lang]);

  useEffect(() => {
    const timers = toastTimersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const setLang = useCallback((next: Language) => {
    memoryPrefs.lang = next;
    setLangState(next);
    writePref(LANG_KEY, next);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'bn' : 'en');
  }, [lang, setLang]);

  const setArea = useCallback((next: string) => {
    memoryPrefs.area = next;
    setAreaState(next);
    writePref(AREA_KEY, next);
  }, []);

  const t = useCallback((key: TranslationKey) => tKey(lang, key), [lang]);

  const dismissToast = useCallback((id: string) => {
    const timer = toastTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: 'success' | 'error' | 'info' = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-2), { id, message, variant }]);
      const timer = setTimeout(() => {
        dismissToast(id);
      }, 3600);
      toastTimersRef.current.set(id, timer);
    },
    [dismissToast]
  );

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        t,
        area,
        setArea,
        isCartDrawerOpen,
        openCartDrawer: () => setIsCartDrawerOpen(true),
        closeCartDrawer: () => setIsCartDrawerOpen(false),
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
}
