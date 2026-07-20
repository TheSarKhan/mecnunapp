"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Screen } from "@/components/Screen";
import { Splash } from "@/components/Splash";
import {
  ChatBubble,
  Composer,
  LimitCounter,
  ModePill,
  SettingsIcon,
  TypingBubble,
} from "@/components/ui";
import { t } from "@/i18n";
import { routes } from "@/lib/routes";
import { useRequireApp } from "@/lib/useGuard";
import { isPending, useChatStore } from "@/store";

export default function ChatPage() {
  const allowed = useRequireApp();

  const mode = useChatStore((s) => s.mode);
  const messages = useChatStore((s) => s.messages);
  const limit = useChatStore((s) => s.limit);
  const sending = useChatStore((s) => s.sending);
  const opening = useChatStore((s) => s.opening);
  const error = useChatStore((s) => s.error);
  const setMode = useChatStore((s) => s.setMode);
  const send = useChatStore((s) => s.send);
  const loadLimit = useChatStore((s) => s.loadLimit);
  const openConversation = useChatStore((s) => s.openConversation);

  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (allowed) void loadLimit();
  }, [allowed, loadLimit]);

  // Söhbəti persona açır, ona görə boş sap göstəriləsi hal deyil — həll ediləsi haldır.
  // Mod dəyişəndə yenidən işləyir, çünki `setMode` conversationId-ni sıfırlayır.
  useEffect(() => {
    if (allowed) void openConversation();
  }, [allowed, mode, openConversation]);

  // `sending` də izlənir ki, yazır-bubble-ı yarananda dərhal görünsün.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, sending]);

  if (!allowed) return <Splash />;

  const limitReached = limit != null && limit.remaining <= 0;

  async function onSend() {
    const content = draft;
    setDraft("");
    await send(content);
  }

  return (
    <Screen fill className="py-4">
      <header className="flex items-center justify-between pb-3">
        <ModePill mode={mode} onChange={setMode} />
        <Link
          href={routes.settings}
          aria-label={t("settings.title")}
          className="text-muted transition-colors hover:text-ink"
        >
          <SettingsIcon size={20} />
        </Link>
      </header>

      {limit && !limit.premium ? (
        <div className="flex justify-center pb-2">
          <LimitCounter current={limit.used} max={limit.total} />
        </div>
      ) : null}

      <div className="scrollbar-subtle flex-1 overflow-y-auto pb-2">
        {messages.length === 0 ? (
          <p className="mt-24 text-center text-[13px] leading-[18px] text-muted">
            {opening
              ? t("common.loading")
              : mode === "QEYBET"
                ? t("chat.emptyQeybet")
                : t("chat.emptyChat")}
          </p>
        ) : (
          messages.map((message, index) => (
            <ChatBubble
              key={message.id}
              text={message.content}
              from={message.sender === "USER" ? "user" : "bot"}
              grouped={
                index > 0 && messages[index - 1].sender === message.sender
              }
              pending={isPending(message)}
            />
          ))
        )}

        {sending ? <TypingBubble /> : null}
        <div ref={endRef} />
      </div>

      {error && !limitReached ? (
        <p className="pb-2 text-center text-[13px] leading-[18px] text-ink">
          {error}
        </p>
      ) : null}

      {limitReached ? (
        <Link
          href={routes.paywall}
          className="mb-2 flex flex-col gap-1 rounded-card border border-line bg-surface p-4 transition-opacity hover:opacity-85"
        >
          <span className="text-[15px] font-medium text-ink">
            {t("chat.limitReached")}
          </span>
          <span className="text-[13px] leading-[18px] text-muted">
            {t("chat.goPremium")}
          </span>
        </Link>
      ) : null}

      <div className="pt-1 pb-2">
        <Composer
          value={draft}
          onChange={setDraft}
          onSend={onSend}
          disabled={sending || limitReached}
        />
        <p className="mt-2 text-center text-[11px] text-muted">
          {t("chat.sendHint")}
        </p>
      </div>
    </Screen>
  );
}
