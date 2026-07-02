'use client';

/**
 * @file components/layout/LocaleProvider.tsx
 * @description Drives <html lang> and dir from the saved locale setting.
 * Volqan supports English (LTR, default) and Arabic (RTL) only.
 */

import * as React from 'react';

export type VolqanLocale = 'en' | 'ar';

interface LocaleContextValue {
  locale: VolqanLocale;
  dir: 'ltr' | 'rtl';
  setLocale: (locale: VolqanLocale) => void;
}

const LocaleContext = React.createContext<LocaleContextValue>({
  locale: 'en',
  dir: 'ltr',
  setLocale: () => {},
});

export function useLocale() {
  return React.useContext(LocaleContext);
}

function applyToDocument(locale: VolqanLocale) {
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = locale;
  document.documentElement.dir = dir;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<VolqanLocale>('en');

  // Load saved locale: localStorage first for instant paint, then the settings API
  React.useEffect(() => {
    const cached = window.localStorage.getItem('volqan.locale');
    if (cached === 'ar' || cached === 'en') {
      setLocaleState(cached);
      applyToDocument(cached);
    }
    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((body: { data?: Record<string, unknown> } | null) => {
        const saved = body?.data?.['site.locale'];
        if (saved === 'ar' || saved === 'en') {
          setLocaleState(saved);
          applyToDocument(saved);
          window.localStorage.setItem('volqan.locale', saved);
        }
      })
      .catch(() => null);
  }, []);

  const setLocale = React.useCallback((next: VolqanLocale) => {
    setLocaleState(next);
    applyToDocument(next);
    window.localStorage.setItem('volqan.locale', next);
  }, []);

  const value = React.useMemo<LocaleContextValue>(
    () => ({ locale, dir: locale === 'ar' ? 'rtl' : 'ltr', setLocale }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
