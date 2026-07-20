"use client";

import { useState } from "react";

import { errorMessage, userApi } from "@/api";
import type { RelationshipStatus } from "@/api";
import { Screen } from "@/components/Screen";
import { Button, OptionRow } from "@/components/ui";
import { t } from "@/i18n";
import { useAuthStore, useOnboardingStore } from "@/store";

/**
 * Digər onboarding addımlarından fərqli olaraq burada "demək istəmirəm" yoxdur.
 *
 * Status həm personanın açılış mesajını qurduğu, həm də hesabın onboarding-i bitirdiyini bildirən
 * sahədir — boş qalsa istifadəçi hər girişdə bu ekrana qayıdardı. Brief v2 §5.1 məhz bunları
 * sadalayır; MARRIED saxlanılır, çünki real istifadəçilər evlidir.
 */
const STATUSES: Array<{ value: RelationshipStatus; labelKey: string }> = [
  { value: "SINGLE", labelKey: "onboarding.profile.status.single" },
  {
    value: "IN_RELATIONSHIP",
    labelKey: "onboarding.profile.status.inRelationship",
  },
  { value: "COMPLICATED", labelKey: "onboarding.profile.status.complicated" },
  { value: "BROKEN_UP", labelKey: "onboarding.profile.status.brokenUp" },
  { value: "MARRIED", labelKey: "onboarding.profile.status.married" },
];

/** Onboarding-in son addımı — indiyə qədər yığılan bütün cavablar backend-ə burada axır. */
export default function ProfilePage() {
  const displayName = useOnboardingStore((s) => s.displayName);
  const gender = useOnboardingStore((s) => s.gender);
  const persona = useOnboardingStore((s) => s.persona);
  const relationshipStatus = useOnboardingStore((s) => s.relationshipStatus);
  const setDisplayName = useOnboardingStore((s) => s.setDisplayName);
  const setRelationshipStatus = useOnboardingStore(
    (s) => s.setRelationshipStatus,
  );

  const setMe = useAuthStore((s) => s.setMe);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    if (relationshipStatus === "UNSPECIFIED") {
      setError(t("onboarding.profile.pickStatus"));
      return;
    }

    setBusy(true);
    setError(null);
    try {
      /*
       * Hesab artıq var — qeydiyyat onboarding-dən əvvəl olub. Burada yalnız cavablar yazılır,
       * `setMe` isə `onboarded`-i açır və guard istifadəçini chat-a özü aparır.
       */
      setMe(
        await userApi.updateProfile({
          displayName: displayName.trim() || undefined,
          gender,
          persona,
          relationshipStatus,
        }),
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <h1 className="t-title mt-8">{t("onboarding.profile.title")}</h1>

      <input
        type="text"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        placeholder={t("onboarding.profile.namePlaceholder")}
        aria-label={t("onboarding.profile.namePlaceholder")}
        maxLength={80}
        autoComplete="given-name"
        className="mt-4 rounded-[22px] border border-line bg-surface px-4 py-3.5 text-[15px] text-ink placeholder:text-muted"
      />

      <h2 className="t-headline mt-6">{t("onboarding.profile.statusTitle")}</h2>
      <div className="mt-3 flex flex-col gap-3">
        {STATUSES.map((option) => (
          <OptionRow
            key={option.value}
            label={t(option.labelKey)}
            selected={relationshipStatus === option.value}
            onClick={() => setRelationshipStatus(option.value)}
          />
        ))}
      </div>

      {error ? <p className="mt-4 t-secondary text-ink">{error}</p> : null}

      <Button
        label={busy ? t("common.loading") : t("onboarding.profile.finish")}
        disabled={busy}
        onClick={finish}
        className="mt-8 mb-4"
      />
    </Screen>
  );
}
