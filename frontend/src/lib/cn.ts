/**
 * Şərti class adlarını birləşdirir. `clsx` gətirməyə dəyməyəcək qədər kiçik iş —
 * `false`/`null`/`undefined` atılır, qalanı boşluqla birləşir.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
