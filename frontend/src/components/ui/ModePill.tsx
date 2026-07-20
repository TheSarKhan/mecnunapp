"use client";

import type { ChatMode } from "@/api";
import { t } from "@/i18n";
import { cn } from "@/lib/cn";

interface Props {
  mode: ChatMode;
  onChange: (mode: ChatMode) => void;
}

/**
 * Qeybət modu ağ dolğuya çevrilir — monoxrom UI-da vəziyyət dəyişikliyini bildirən yeganə yer.
 * Bu, dizaynın bilərəkdən qərarıdır: rəng yoxdursa, inversiya "aksent" rolunu oynayır.
 */
export function ModePill({ mode, onChange }: Props) {
  return (
    <div
      role="tablist"
      className="flex self-center rounded-[22px] border border-line bg-surface p-[3px]"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "CHAT"}
        onClick={() => onChange("CHAT")}
        className={cn(
          "rounded-[18px] px-4 py-1.5 text-[12px] transition-colors",
          mode === "CHAT"
            ? "bg-bubble font-semibold text-ink"
            : "font-medium text-muted hover:text-ink",
        )}
      >
        {t("chat.mode.chat")}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "QEYBET"}
        onClick={() => onChange("QEYBET")}
        className={cn(
          "rounded-[18px] px-4 py-1.5 text-[12px] transition-colors",
          mode === "QEYBET"
            ? "bg-ink font-bold text-bg"
            : "font-medium text-muted hover:text-ink",
        )}
      >
        {t("chat.mode.qeybet")}
      </button>
    </div>
  );
}
