import az from './az.json';
import tr from './tr.json';

export type Locale = 'az' | 'tr';

const catalogs: Record<Locale, Record<string, unknown>> = { az, tr };

let currentLocale: Locale = 'az';

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

/**
 * Dot-path lookup with `{{placeholder}}` interpolation.
 * Falls back to `az`, then to the key itself, so a missing translation is visible but never crashes.
 *
 * A real i18n library (i18next / react-i18next) can replace this later — call sites stay `t('a.b.c')`.
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const value = lookup(catalogs[currentLocale], key) ?? lookup(catalogs.az, key);
  if (typeof value !== 'string') return key;
  if (!params) return value;
  return value.replace(/\{\{(\w+)\}\}/g, (match, name) =>
    params[name] !== undefined ? String(params[name]) : match,
  );
}

function lookup(catalog: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>(
    (node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined),
    catalog,
  );
}
