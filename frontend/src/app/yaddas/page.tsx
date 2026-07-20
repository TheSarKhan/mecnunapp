"use client";

import { useEffect, useState } from "react";

import { errorMessage, memoryApi } from "@/api";
import type { MemoryFactDto } from "@/api";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { Splash } from "@/components/Splash";
import { TrashIcon } from "@/components/ui";
import { t } from "@/i18n";
import { useRequireApp } from "@/lib/useGuard";

/**
 * Yaddaş şəffaflıq ekranı (brief §5.2): bot səninlə bağlı nə saxlayıbsa, hamısı burada görünür
 * və silinə bilər. Silmə həqiqətən unutdurur — sətir bazadan gedir, gizlədilmir.
 */
export default function MemoryPage() {
  const allowed = useRequireApp();

  const [facts, setFacts] = useState<MemoryFactDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!allowed) return;

    // `cancelled` bayrağı sorğu qayıdana qədər səhifədən çıxılan halı tutur — açılan komponentə
    // setState etmək React-ın xəbərdarlığıdır və burada həm də mənasız işdir.
    let cancelled = false;
    memoryApi
      .getMemory()
      .then((result) => {
        if (!cancelled) setFacts(result);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [allowed]);

  if (!allowed) return <Splash />;

  async function deleteFact(id: string) {
    // Optimistik silmə: siyahı dərhal yenilənir, xəta olsa serverdən yenidən yüklənir.
    const previous = facts;
    setFacts((current) => current.filter((fact) => fact.id !== id));
    try {
      await memoryApi.deleteFact(id);
    } catch (err) {
      setFacts(previous);
      setError(errorMessage(err));
    }
  }

  async function deleteAll() {
    if (!window.confirm(t("settings.memoryDeleteAllConfirm"))) return;
    try {
      await memoryApi.deleteAllMemory();
      setFacts([]);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <Screen className="py-4">
      <PageHeader title={t("settings.memory")} />

      <div className="flex flex-col gap-3 pt-4 pb-8">
        {loading ? (
          <p className="t-secondary mt-8 text-center">{t("common.loading")}</p>
        ) : facts.length === 0 ? (
          <p className="t-secondary mt-8 text-center">
            {t("settings.memoryEmpty")}
          </p>
        ) : (
          <>
            {facts.map((fact) => (
              <div
                key={fact.id}
                className="flex items-start justify-between gap-3 rounded-card border border-line bg-surface p-4"
              >
                <p className="t-body flex-1">{fact.factText}</p>
                <button
                  type="button"
                  onClick={() => deleteFact(fact.id)}
                  aria-label={t("common.delete")}
                  className="shrink-0 text-muted transition-colors hover:text-ink"
                >
                  <TrashIcon size={17} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={deleteAll}
              className="mt-2 rounded-card border border-line bg-surface p-4 text-[15px] font-medium text-ink transition-opacity hover:opacity-85"
            >
              {t("settings.memoryDeleteAll")}
            </button>
          </>
        )}

        {error ? <p className="t-secondary text-ink">{error}</p> : null}
      </div>
    </Screen>
  );
}
