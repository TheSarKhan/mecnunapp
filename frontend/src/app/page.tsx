"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Splash } from "@/components/Splash";
import { routes } from "@/lib/routes";
import { useAuthStage } from "@/lib/useGuard";

const DESTINATION = {
  login: routes.login,
  onboarding: routes.onboardingAge,
  app: routes.chat,
} as const;

/**
 * Yalnız yönləndirmə. `Bootstrap` bura çatana qədər sessiyanı həll edib, ona görə burada
 * "hələ bilinmir" halı yoxdur — istifadəçi dayandığı mərhələyə göndərilir.
 */
export default function Home() {
  const router = useRouter();
  const stage = useAuthStage();

  useEffect(() => {
    router.replace(DESTINATION[stage]);
  }, [stage, router]);

  return <Splash />;
}
