"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "@/store";

import { routes } from "./routes";

/**
 * Üç mərhələ, bu ardıcıllıqla: giriş → profil sualları → app.
 *
 * Hər guard yalnız öz mərhələsini qoruyur, beləliklə istifadəçi hansı URL-i yazsa da dayandığı
 * yerə düşür.
 */
export function useAuthStage(): "login" | "onboarding" | "app" {
  const authenticated = useAuthStore((s) => s.authenticated);
  const onboarded = useAuthStore((s) => s.onboarded);

  if (!authenticated) return "login";
  if (!onboarded) return "onboarding";
  return "app";
}

/** App ekranlarında: sessiya yoxdursa girişə, onboarding yarımçıqdırsa onboarding-ə qaytarır. */
export function useRequireApp(): boolean {
  const router = useRouter();
  const stage = useAuthStage();

  useEffect(() => {
    if (stage === "login") router.replace(routes.login);
    else if (stage === "onboarding") router.replace(routes.onboardingAge);
  }, [stage, router]);

  return stage === "app";
}

/** Onboarding ekranlarında: hesab yoxdursa girişə, artıq bitibsə chat-a ötürür. */
export function useRequireOnboarding(): boolean {
  const router = useRouter();
  const stage = useAuthStage();

  useEffect(() => {
    if (stage === "login") router.replace(routes.login);
    else if (stage === "app") router.replace(routes.chat);
  }, [stage, router]);

  return stage === "onboarding";
}

/** Giriş/qeydiyyat ekranlarında: artıq daxil olubsa irəli ötürür. */
export function useRedirectIfSignedIn(): boolean {
  const router = useRouter();
  const stage = useAuthStage();

  useEffect(() => {
    if (stage === "onboarding") router.replace(routes.onboardingAge);
    else if (stage === "app") router.replace(routes.chat);
  }, [stage, router]);

  return stage !== "login";
}
