"use client";

import { useEffect, useRef } from "react";

import { useAuthStore } from "@/store";

import { Splash } from "./Splash";

/**
 * Sessiyanı bir dəfə bərpa edir və hazır olana qədər splash göstərir.
 *
 * Root layout-da oturur ki, hər səhifə artıq həll olunmuş auth vəziyyəti ilə render olunsun —
 * əks halda hər ekran özü "hələ bilinmir" halını daşımalı olardı.
 *
 * `ref` ilə mühafizə React 18+ StrictMode-a görədir: dev-də effekt qəsdən iki dəfə işləyir və
 * onsuz bootstrap iki paralel login sorğusu atırdı.
 */
export function Bootstrap({ children }: { children: React.ReactNode }) {
  const ready = useAuthStore((s) => s.ready);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void bootstrap();
  }, [bootstrap]);

  if (!ready) return <Splash />;
  return <>{children}</>;
}
