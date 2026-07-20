interface Props {
  current: number;
  max: number;
}

/** Qalan mesaj sayı + doluluq zolağı. Premium-da göstərilmir — çağıran yer həll edir. */
export function LimitCounter({ current, max }: Props) {
  const pct = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;

  return (
    <div className="flex items-center gap-2.5 self-center rounded-[20px] border border-line bg-surface px-3.5 py-[7px]">
      <span className="text-[13px] font-semibold text-ink">
        {current}
        <span className="font-medium text-muted"> / {max}</span>
      </span>
      <span className="h-1 w-[52px] overflow-hidden rounded-[2px] bg-bubble">
        <span
          className="block h-full bg-ink transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </span>
    </div>
  );
}
