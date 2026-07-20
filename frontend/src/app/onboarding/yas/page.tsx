"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Screen } from "@/components/Screen";
import { Button } from "@/components/ui";
import { t } from "@/i18n";
import { routes } from "@/lib/routes";
import { useOnboardingStore } from "@/store";

export default function AgeGatePage() {
  const router = useRouter();
  const setAgeConfirmed = useOnboardingStore((s) => s.setAgeConfirmed);
  const [declined, setDeclined] = useState(false);

  function confirm() {
    setAgeConfirmed(true);
    router.push(routes.onboardingGender);
  }

  return (
    <Screen className="justify-center">
      <div className="flex flex-col gap-3">
        <h1 className="t-title">{t("onboarding.ageGate.title")}</h1>
        <p className="t-body text-muted">{t("onboarding.ageGate.body")}</p>
      </div>

      <div className="mt-10 flex flex-col gap-3">
        <Button label={t("onboarding.ageGate.confirm")} onClick={confirm} />
        <Button
          label={t("onboarding.ageGate.decline")}
          variant="ghost"
          onClick={() => setDeclined(true)}
        />
      </div>

      {/*
        18-dən kiçik istifadəçini irəli buraxmırıq. Yönləndiriləsi yer də yoxdur — bu, məhsulun
        sərhədidir, ona görə səbəb açıq yazılır və axın burada dayanır.
      */}
      {declined ? (
        <p className="mt-6 text-center text-[13px] leading-[18px] text-muted">
          Məcnun 18 yaşdan aşağı istifadəçilər üçün nəzərdə tutulmayıb.
        </p>
      ) : null}
    </Screen>
  );
}
