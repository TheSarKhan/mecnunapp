/**
 * `localStorage` üzərində nazik örtük.
 *
 * İki səbəbə görə birbaşa `localStorage` çağırmırıq:
 *
 * 1. **SSR.** Client komponentləri də serverdə bir dəfə render olunur, orada `window` yoxdur —
 *    modul səviyyəsində `localStorage`-a toxunmaq build-i uçurur.
 * 2. **Bloklanmış storage.** Safari-nin private rejimi və "üçüncü tərəf cookie-ləri blokla"
 *    parametri `localStorage`-a müraciətdə istisna atır. Belə halda app işləməyə davam etməlidir
 *    (sadəcə sessiya yadda qalmır), ağ ekranla ölməməlidir.
 */

export function readLocal(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeLocal(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage bloklanıb və ya doludur — sessiya yalnız bu tab-da yaşayacaq.
  }
}

export function removeLocal(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // yuxarıdakı ilə eyni səbəb
  }
}
