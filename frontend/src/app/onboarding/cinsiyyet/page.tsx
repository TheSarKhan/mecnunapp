"use client";

import { useRouter } from "next/navigation";

import { Screen } from "@/components/Screen";
import { Button, OptionRow } from "@/components/ui";
import type { Gender } from "@/api";
import { t } from "@/i18n";
import { routes } from "@/lib/routes";
import { useOnboardingStore } from "@/store";

const OPTIONS: Array<{ value: Gender; labelKey: string }> = [
  { value: "FEMALE", labelKey: "onboarding.gender.female" },
  { value: "MALE", labelKey: "onboarding.gender.male" },
  { value: "UNSPECIFIED", labelKey: "onboarding.gender.unspecified" },
];

export default function GenderPage() {
  const router = useRouter();
  const gender = useOnboardingStore((s) => s.gender);
  const setGender = useOnboardingStore((s) => s.setGender);

  return (
    <Screen className="justify-center">
      <div className="flex flex-col gap-2">
        <h1 className="t-title">{t("onboarding.gender.title")}</h1>
        <p className="t-secondary">{t("onboarding.gender.subtitle")}</p>
      </div>

      {/*
        Cinsiyyət personanı yox, xitab matrisini seçir (brief §6.1): "ay qız/canım" vs
        "brat/qaqaş". Ona görə "demək istəmirəm" tam hüquqlu seçimdir — neytral xitab dəsti var.
      */}
      <div className="mt-8 flex flex-col gap-2.5">
        {OPTIONS.map((option) => (
          <OptionRow
            key={option.value}
            label={t(option.labelKey)}
            selected={gender === option.value}
            onClick={() => setGender(option.value)}
          />
        ))}
      </div>

      <Button
        label={t("common.continue")}
        className="mt-8"
        onClick={() => router.push(routes.onboardingPersona)}
      />
    </Screen>
  );
}
