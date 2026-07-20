"use client";

import { useState } from "react";

import { t } from "@/i18n";
import { cn } from "@/lib/cn";

interface Props {
  text: string;
  from: "user" | "bot";
  /** Əvvəlki mesaj eyni tərəfdəndirsə true — aralıq daralır. */
  grouped?: boolean;
  /** Mesaj hələ yoldadırsa bubble-ı solğunlaşdırır. */
  pending?: boolean;
}

/**
 * Mobildə kopyalama uzun basmaqla olur — web-də belə jest yoxdur, ona görə hover/fokusda
 * görünən düymə ilə əvəzlənib. Davranış eynidir, çatdırılması fərqli.
 */
export function ChatBubble({ text, from, grouped, pending }: Props) {
  const isUser = from === "user";
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard icazəsi yoxdur (HTTP-də və ya rədd edilib) — səssiz keç, mətn yerindədir.
    }
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-2",
        isUser ? "flex-row-reverse" : "flex-row",
        grouped ? "mt-1.5" : "mt-3.5",
      )}
    >
      <div
        className={cn(
          "max-w-[82%] rounded-[20px] px-3.5 py-2.5 text-[15px] leading-[20px] whitespace-pre-wrap break-words",
          isUser
            ? "rounded-br-[6px] bg-ink text-bg"
            : "rounded-bl-[6px] bg-bubble text-ink",
          pending && "opacity-55",
        )}
      >
        {text}
      </div>

      <button
        type="button"
        onClick={copy}
        aria-label={t("chat.copied")}
        className="shrink-0 text-[11px] text-muted opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        {copied ? t("chat.copied") : "⧉"}
      </button>
    </div>
  );
}
