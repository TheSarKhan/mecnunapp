"use client";

import { useEffect, useRef } from "react";

import { t } from "@/i18n";
import { cn } from "@/lib/cn";

import { SendIcon } from "./icons";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  /** Məsələn, limit tükənib. */
  disabled?: boolean;
  placeholder?: string;
}

const MAX_HEIGHT = 120;

export function Composer({
  value,
  onChange,
  onSend,
  disabled,
  placeholder = t("chat.placeholder"),
}: Props) {
  const canSend = value.trim().length > 0 && !disabled;
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /*
   * Textarea öz-özünə uzanır. `height`-i əvvəlcə sıfırlamaq şərtdir: sıfırlamadan `scrollHeight`
   * həmişə cari hündürlüyü qaytarır, ona görə sahə yalnız böyüyür, mətn silinəndə kiçilmir.
   */
  useEffect(() => {
    const node = inputRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter göndərir, Shift+Enter sətir salır — chat üçün gözlənilən davranış.
    // IME (məsələn, mobil klaviaturanın söz tamamlaması) aktivdirsə Enter təsdiqləmə üçündür.
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (canSend) onSend();
    }
  }

  return (
    <div className="flex items-end gap-2.5">
      <textarea
        ref={inputRef}
        rows={1}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={placeholder}
        className="scrollbar-subtle flex-1 resize-none rounded-[22px] border border-line bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-muted disabled:opacity-50"
        style={{ maxHeight: MAX_HEIGHT }}
      />
      <button
        type="button"
        onClick={canSend ? onSend : undefined}
        disabled={!canSend}
        aria-label={t("chat.send")}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
          canSend ? "bg-ink text-bg" : "bg-bubble text-muted",
        )}
      >
        <SendIcon size={18} />
      </button>
    </div>
  );
}
