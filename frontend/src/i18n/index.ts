import az from "./az.json";

export type Locale = "az";

const catalogs: Record<Locale, Record<string, unknown>> = { az };

let currentLocale: Locale = "az";

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

/**
 * Nöqtəli açar + `{{placeholder}}` əvəzləmə.
 * `az`-a, sonra açarın özünə düşür — çatışmayan tərcümə görünür, amma heç vaxt uçurmur.
 *
 * Mobildəki `mobile/src/i18n/index.ts`-in eynisidir. Web hələ yalnız `az` daşıyır; `tr` mobil
 * tərəfdə var və lazım olanda buraya da eyni qaydada əlavə olunur.
 */
export function t(
  key: string,
  params?: Record<string, string | number>,
): string {
  const value = lookup(catalogs[currentLocale], key) ?? lookup(catalogs.az, key);
  if (typeof value !== "string") return key;
  if (!params) return value;
  return value.replace(/\{\{(\w+)\}\}/g, (match, name) =>
    params[name] !== undefined ? String(params[name]) : match,
  );
}

function lookup(catalog: Record<string, unknown>, key: string): unknown {
  return key
    .split(".")
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === "object"
          ? (node as Record<string, unknown>)[part]
          : undefined,
      catalog,
    );
}
