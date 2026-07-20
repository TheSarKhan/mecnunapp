"use client";

import { useRouter } from "next/navigation";

import { Screen } from "@/components/Screen";
import { Button, PersonaCard } from "@/components/ui";
import { t } from "@/i18n";
import { routes } from "@/lib/routes";
import { useOnboardingStore } from "@/store";

export default function PersonaPage() {
  const router = useRouter();
  const persona = useOnboardingStore((s) => s.persona);
  const setPersona = useOnboardingStore((s) => s.setPersona);

  return (
    <Screen className="justify-center">
      <div className="flex flex-col gap-2">
        <h1 className="t-title">{t("onboarding.persona.title")}</h1>
        <p className="t-secondary">{t("onboarding.persona.subtitle")}</p>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <PersonaCard
          initial="L"
          name={t("onboarding.persona.leyli.name")}
          description={t("onboarding.persona.leyli.description")}
          selected={persona === "LEYLI"}
          onClick={() => setPersona("LEYLI")}
        />
        <PersonaCard
          initial="M"
          name={t("onboarding.persona.mecnun.name")}
          description={t("onboarding.persona.mecnun.description")}
          selected={persona === "MECNUN"}
          onClick={() => setPersona("MECNUN")}
        />
      </div>

      <Button
        label={t("common.continue")}
        className="mt-8"
        onClick={() => router.push(routes.onboardingProfile)}
      />
    </Screen>
  );
}
