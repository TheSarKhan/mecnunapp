"use client";

import Link from "next/link";
import { useState } from "react";

import { errorMessage } from "@/api";
import { Screen } from "@/components/Screen";
import { Splash } from "@/components/Splash";
import { VideoBackdrop } from "@/components/VideoBackdrop";
import { Button } from "@/components/ui";
import { t } from "@/i18n";
import { routes } from "@/lib/routes";
import { useRedirectIfSignedIn } from "@/lib/useGuard";
import { useAuthStore } from "@/store";

const MIN_PASSWORD_LENGTH = 6;

/**
 * Yalnız hesab yaradılır — profil sualları yoxdur.
 *
 * Ad, cinsiyyət, persona və status bundan dərhal sonra onboarding-də soruşulur, orada personanın
 * öz səsi ilə. Qeydiyyat formasındakı hər əlavə sahə qeydiyyat sayını azaldır.
 */
export default function RegisterPage() {
  const leaving = useRedirectIfSignedIn();
  const register = useAuthStore((s) => s.register);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = identifier.trim();
    if (!trimmed || !password) {
      setError(t("register.missingFields"));
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t("register.passwordTooShort"));
      return;
    }

    setBusy(true);
    setError(null);
    try {
      // Uğur `authenticated`-i açır, `onboarded` isə false qalır — guard istifadəçini
      // 18+ sualına özü aparır, imperativ yönləndirmə lazım deyil.
      await register(trimmed, password);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (leaving) return <Splash />;

  return (
    <>
      <VideoBackdrop />
      <Screen>
        <div className="flex flex-1 flex-col justify-end pb-10">
          <h1 className="t-title">{t("register.title")}</h1>
          <p className="t-secondary mt-2 text-[15px]">
            {t("register.subtitle")}
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="text"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder={t("register.identifier")}
            aria-label={t("register.identifier")}
            autoComplete="username"
            className="rounded-[22px] border border-line bg-surface px-4 py-3.5 text-[15px] text-ink placeholder:text-muted"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t("register.password")}
            aria-label={t("register.password")}
            autoComplete="new-password"
            className="rounded-[22px] border border-line bg-surface px-4 py-3.5 text-[15px] text-ink placeholder:text-muted"
          />
          <p className="t-secondary text-xs">{t("register.passwordHint")}</p>

          {error ? <p className="t-secondary text-ink">{error}</p> : null}

          <Button
            label={busy ? t("common.loading") : t("register.submit")}
            disabled={busy}
            type="submit"
            className="mt-2"
          />
        </form>

        <Link
          href={routes.login}
          className="t-secondary mt-6 mb-4 text-center text-ink underline underline-offset-4"
        >
          {t("register.haveAccount")}
        </Link>
      </Screen>
    </>
  );
}
