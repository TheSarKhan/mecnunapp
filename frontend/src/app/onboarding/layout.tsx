"use client";

import { Splash } from "@/components/Splash";
import { useRequireOnboarding } from "@/lib/useGuard";

/**
 * Bu ekranlar yalnız hesabı olan, amma sualları hələ cavablamayan istifadəçi üçündür.
 *
 * Hər iki tərəfdən qorunur: hesabsız gələn girişə, artıq bitirmiş isə chat-a gedir — geri
 * düyməsi ilə də. Yönləndirmə gedərkən splash göstərilir ki, ekran bir an görünüb yox olmasın.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allowed = useRequireOnboarding();
  if (!allowed) return <Splash />;
  return <>{children}</>;
}
