"use client";

import { cn } from "@/lib/cn";

interface Props {
  initial: string;
  name: string;
  description: string;
  selected?: boolean;
  onClick?: () => void;
}

export function PersonaCard({
  initial,
  name,
  description,
  selected,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-[13px] rounded-card bg-surface p-4 text-left transition-colors",
        selected ? "border-[1.5px] border-line-on" : "border border-line",
      )}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bubble text-[18px] font-semibold text-ink">
        {initial}
      </span>
      <span className="flex flex-col gap-[3px]">
        <span className="text-[16px] font-semibold text-ink">{name}</span>
        <span className="text-[13px] leading-[18px] text-muted">
          {description}
        </span>
      </span>
    </button>
  );
}
