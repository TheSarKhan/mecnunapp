"use client";

import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { Splash } from "@/components/Splash";
import { Button, CheckIcon } from "@/components/ui";
import { t } from "@/i18n";
import { routes } from "@/lib/routes";
import { useRequireApp } from "@/lib/useGuard";

const BENEFITS = [
  "paywall.benefits.unlimited",
  "paywall.benefits.profanity",
  "paywall.benefits.memory",
  "paywall.benefits.noAds",
];

/**
 * Web-də qiymət göstərilmir və alış düyməsi yoxdur — bilərəkdən.
 *
 * Abunə RevenueCat üzərindən mağaza hesabına bağlıdır (roadmap M3), web-də alınası yer yoxdur.
 * Qiymət də yazılmır: mobildəki ₼4.99/₼39.99 roadmap-da səhv kimi işarələnib (brief §8 → 10
 * AZN/ay), və onu burada təkrarlamaq eyni səhvi ikinci yerə köçürmək olardı. Qiymət M3-də
 * offerings-dən dinamik gələndə bura da real dəyər qoyulacaq.
 */
export default function PaywallPage() {
  const allowed = useRequireApp();
  const router = useRouter();

  if (!allowed) return <Splash />;

  return (
    <Screen className="py-4">
      <PageHeader title={t("paywall.title")} />

      <div className="flex flex-col gap-6 pt-8">
        <p className="t-body text-muted">{t("paywall.subtitle")}</p>

        <ul className="flex flex-col gap-3">
          {BENEFITS.map((key) => (
            <li key={key} className="flex items-center gap-3">
              <CheckIcon size={18} className="shrink-0 text-ink" />
              <span className="t-body">{t(key)}</span>
            </li>
          ))}
        </ul>

        <p className="rounded-card border border-line bg-surface p-4 text-[13px] leading-[18px] text-muted">
          {t("paywall.webUnavailable")}
        </p>

        <Button
          label={t("paywall.notNow")}
          variant="secondary"
          onClick={() => router.push(routes.chat)}
        />
      </div>
    </Screen>
  );
}
