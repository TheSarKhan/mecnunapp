import { create } from "zustand";

import type { Gender, Persona, RelationshipStatus } from "@/api";

/**
 * Onboarding çox ekranlıdır, amma tək API yazısıdır — cavablar burada yığılır və sonuncu
 * ekranda bir dəfə `PUT /users/me/profile` ilə göndərilir.
 */
interface OnboardingState {
  ageConfirmed: boolean;
  gender: Gender;
  persona: Persona;
  displayName: string;
  relationshipStatus: RelationshipStatus;

  setAgeConfirmed: (value: boolean) => void;
  setGender: (gender: Gender) => void;
  setPersona: (persona: Persona) => void;
  setDisplayName: (name: string) => void;
  setRelationshipStatus: (status: RelationshipStatus) => void;
  reset: () => void;
}

const initial = {
  ageConfirmed: false,
  gender: "UNSPECIFIED" as Gender,
  persona: "MECNUN" as Persona,
  displayName: "",
  relationshipStatus: "UNSPECIFIED" as RelationshipStatus,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initial,

  setAgeConfirmed: (ageConfirmed) => set({ ageConfirmed }),
  setGender: (gender) => set({ gender }),
  setPersona: (persona) => set({ persona }),
  setDisplayName: (displayName) => set({ displayName }),
  setRelationshipStatus: (relationshipStatus) => set({ relationshipStatus }),
  reset: () => set(initial),
}));
