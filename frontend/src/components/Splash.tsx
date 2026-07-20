import { t } from "@/i18n";

/** Sessiya bərpa olunarkən görünən ekran. Mobil `SplashScreen`-in eynisi. */
export function Splash() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <h1 className="t-wordmark">{t("splash.wordmark")}</h1>
      <p className="t-secondary max-w-[280px]">{t("splash.tagline")}</p>
    </div>
  );
}
