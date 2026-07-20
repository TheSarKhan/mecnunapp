"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { errorMessage, userApi } from "@/api";
import type { Persona } from "@/api";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { Splash } from "@/components/Splash";
import { ChevronRightIcon, PersonaCard, Toggle } from "@/components/ui";
import { t } from "@/i18n";
import { routes } from "@/lib/routes";
import { useRequireApp } from "@/lib/useGuard";
import { useAuthStore } from "@/store";

export default function SettingsPage() {
  const allowed = useRequireApp();
  const router = useRouter();

  const me = useAuthStore((s) => s.me);
  const setMe = useAuthStore((s) => s.setMe);
  const logout = useAuthStore((s) => s.logout);
  const [error, setError] = useState<string | null>(null);

  if (!allowed) return <Splash />;

  const premium = me?.premium ?? false;

  async function changePersona(persona: Persona) {
    if (!me) return;
    try {
      // Profil PUT-dur, PATCH deyil — dəyişməyən sahələr də göndərilməlidir, yoxsa sıfırlanır.
      setMe(
        await userApi.updateProfile({
          displayName: me.displayName ?? undefined,
          gender: me.gender,
          persona,
          relationshipStatus: me.relationshipStatus,
        }),
      );
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function toggleProfanity(value: boolean) {
    try {
      setMe(await userApi.updateSettings(value));
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function deleteAccount() {
    if (!window.confirm(t("settings.deleteAccountConfirm"))) return;
    try {
      await userApi.deleteAccount();
      logout();
      router.replace(routes.onboardingAge);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <Screen className="py-4">
      <PageHeader title={t("settings.title")} />

      <div className="flex flex-col gap-3 pt-4 pb-8">
        <p className="t-caption">{t("settings.persona")}</p>
        <PersonaCard
          initial="L"
          name={t("onboarding.persona.leyli.name")}
          description={t("onboarding.persona.leyli.description")}
          selected={me?.persona === "LEYLI"}
          onClick={() => changePersona("LEYLI")}
        />
        <PersonaCard
          initial="M"
          name={t("onboarding.persona.mecnun.name")}
          description={t("onboarding.persona.mecnun.description")}
          selected={me?.persona === "MECNUN"}
          onClick={() => changePersona("MECNUN")}
        />

        <div className="mt-2 rounded-card border border-line bg-surface p-4">
          <Toggle
            label={t("settings.profanity")}
            value={me?.profanityEnabled ?? false}
            onChange={toggleProfanity}
            locked={!premium}
            onLockedClick={() => router.push(routes.paywall)}
          />
        </div>

        <Link
          href={routes.memory}
          className="flex items-center justify-between rounded-card border border-line bg-surface p-4 transition-opacity hover:opacity-85"
        >
          <span className="text-[15px] font-medium text-ink">
            {t("settings.memory")}
          </span>
          <ChevronRightIcon size={17} className="text-muted" />
        </Link>

        {premium ? (
          <div className="flex items-center justify-between rounded-card border border-line bg-surface p-4">
            <span className="text-[15px] font-medium text-ink">
              {t("settings.premium")}
            </span>
            <span className="t-secondary">{t("settings.premiumActive")}</span>
          </div>
        ) : (
          <Link
            href={routes.paywall}
            className="flex items-center justify-between rounded-card border border-line bg-surface p-4 transition-opacity hover:opacity-85"
          >
            <span className="text-[15px] font-medium text-ink">
              {t("settings.premium")}
            </span>
            <ChevronRightIcon size={17} className="text-muted" />
          </Link>
        )}

        {error ? <p className="t-secondary text-ink">{error}</p> : null}

        <button
          type="button"
          onClick={deleteAccount}
          className="flex items-center justify-between rounded-card border border-line bg-surface p-4 text-left transition-opacity hover:opacity-85"
        >
          <span className="text-[15px] font-medium text-ink">
            {t("settings.deleteAccount")}
          </span>
        </button>
      </div>
    </Screen>
  );
}
