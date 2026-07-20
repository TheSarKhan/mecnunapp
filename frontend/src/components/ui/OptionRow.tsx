"use client";

import { cn } from "@/lib/cn";

import { CheckIcon } from "./icons";

interface Props {
  label: string;
  selected?: boolean;
  onClick: () => void;
}

/** Tək-seçimli sətir — cinsiyyət və münasibət statusu seçiciləri bunu işlədir. */
export function OptionRow({ label, selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center justify-between rounded-card bg-surface p-4 text-left transition-colors hover:opacity-85",
        selected ? "border-[1.5px] border-line-on" : "border border-line",
      )}
    >
      <span className="text-[15px] font-medium text-ink">{label}</span>
      <span className="flex h-[17px] w-[17px] items-center justify-center text-ink">
        {selected ? <CheckIcon size={17} /> : null}
      </span>
    </button>
  );
}
