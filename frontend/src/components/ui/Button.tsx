"use client";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

interface Props {
  label: string;
  onClick?: () => void;
  variant?: Variant;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}

/** `mobile/src/components/ui/Button.tsx` ilə eyni üç variant, eyni ölçülər. */
export function Button({
  label,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  className,
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full rounded-pill py-[15px] text-[16px] font-semibold transition-opacity",
        variant === "primary" && "bg-ink text-bg",
        variant === "secondary" && "border border-line bg-surface text-ink",
        variant === "ghost" && "bg-transparent font-medium text-muted",
        disabled ? "opacity-40" : "hover:opacity-85 active:opacity-75",
        className,
      )}
    >
      {label}
    </button>
  );
}
