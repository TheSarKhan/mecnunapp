/** Marşrutlar tək yerdə — sətir kimi səpələnəndə birini dəyişmək qalanları səssizcə sındırır. */
export const routes = {
  login: "/giris",
  register: "/qeydiyyat",
  onboardingAge: "/onboarding/yas",
  onboardingGender: "/onboarding/cinsiyyet",
  onboardingPersona: "/onboarding/persona",
  onboardingProfile: "/onboarding/profil",
  chat: "/chat",
  settings: "/ayarlar",
  memory: "/yaddas",
  paywall: "/premium",
} as const;
