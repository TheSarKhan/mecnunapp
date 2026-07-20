"use client";

import { cn } from "@/lib/cn";

interface Props {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  /** Pulsuz tarif — basmaq keçirməli yox, paywall-a aparmalıdır. */
  locked?: boolean;
  onLockedClick?: () => void;
}

export function Toggle({
  label,
  value,
  onChange,
  locked,
  onLockedClick,
}: Props) {
  const on = value && !locked;

  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2">
        <span className="text-[15px] text-ink">{label}</span>
        {locked ? (
          <span className="rounded-md bg-ink px-[7px] py-[2px] text-[10px] font-semibold tracking-[0.5px] text-bg">
            PREMIUM
          </span>
        ) : null}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => (locked ? onLockedClick?.() : onChange(!value))}
        className={cn(
          "flex h-7 w-[46px] items-center rounded-[15px] p-[3px] transition-colors",
          on ? "bg-ink" : "border border-line bg-bubble",
        )}
      >
        <span
          className={cn(
            "h-5 w-5 rounded-full transition-transform",
            on ? "translate-x-[18px] bg-bg" : "translate-x-0 bg-muted",
          )}
        />
      </button>
    </div>
  );
}
