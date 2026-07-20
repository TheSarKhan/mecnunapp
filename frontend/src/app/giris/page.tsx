"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { errorMessage } from "@/api";
import { Screen } from "@/components/Screen";
import { Splash } from "@/components/Splash";
import { VideoBackdrop } from "@/components/VideoBackdrop";
import {
  GoogleSignInButton,
  isGoogleSignInAvailable,
} from "@/components/GoogleSignInButton";
import { Button } from "@/components/ui";
import { t } from "@/i18n";
import { routes } from "@/lib/routes";
import { useRedirectIfSignedIn } from "@/lib/useGuard";
import { useAuthStore } from "@/store";

const GOOGLE_AVAILABLE = isGoogleSignInAvailable();

/** App-in giriş nöqtəsi. Hesabsız heç nə baş vermir. */
export default function LoginPage() {
  const leaving = useRedirectIfSignedIn();
  const login = useAuthStore((s) => s.login);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!identifier.trim() || !password) {
      setError(t("login.missingFields"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await login(identifier.trim(), password);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const onGoogleToken = useCallback(
    async (idToken: string) => {
      setBusy(true);
      setError(null);
      try {
        await loginWithGoogle(idToken);
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setBusy(false);
      }
    },
    [loginWithGoogle],
  );

  if (leaving) return <Splash />;

  return (
    <>
      <VideoBackdrop />
      <Screen>
        <div className="flex flex-1 flex-col justify-end pb-10">
          <h1 className="t-wordmark">{t("splash.wordmark")}</h1>
          <p className="t-secondary mt-2 text-[15px]">{t("splash.tagline")}</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="text"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder={t("login.identifier")}
            aria-label={t("login.identifier")}
            autoComplete="username"
            className="rounded-[22px] border border-line bg-surface px-4 py-3.5 text-[15px] text-ink placeholder:text-muted"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t("login.password")}
            aria-label={t("login.password")}
            autoComplete="current-password"
            className="rounded-[22px] border border-line bg-surface px-4 py-3.5 text-[15px] text-ink placeholder:text-muted"
          />

          {error ? <p className="t-secondary text-ink">{error}</p> : null}

          <Button
            label={busy ? t("common.loading") : t("login.submit")}
            disabled={busy}
            type="submit"
            className="mt-2"
          />
        </form>

        {GOOGLE_AVAILABLE ? (
          <div className="mt-3">
            <GoogleSignInButton onIdToken={onGoogleToken} onError={setError} />
          </div>
        ) : null}

        <Link
          href={routes.register}
          className="t-secondary mt-6 mb-4 text-center text-ink underline underline-offset-4"
        >
          {t("login.noAccount")}
        </Link>
      </Screen>
    </>
  );
}
