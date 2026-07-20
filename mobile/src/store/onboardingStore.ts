import { create } from 'zustand';
import type { Gender, Persona, RelationshipStatus } from '../api';

/**
 * Onboarding is multi-screen but a single API write — answers accumulate here and are
 * flushed once, on the last screen, via PUT /users/me/profile.
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
  gender: 'UNSPECIFIED' as Gender,
  persona: 'MECNUN' as Persona,
  displayName: '',
  relationshipStatus: 'UNSPECIFIED' as RelationshipStatus,
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
