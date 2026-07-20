import { create } from "zustand";

import {
  authApi,
  clearTokens,
  hasSession,
  saveTokens,
  setOnAuthLost,
  userApi,
} from "@/api";
import type { Me } from "@/api";

interface AuthState {
  /** Sessiya storage-dan bərpa olunana qədər false. */
  ready: boolean;
  authenticated: boolean;
  /** Profil sualları (18+, cinsiyyət, persona, ad, status) cavablanıbmı. */
  onboarded: boolean;
  me: Me | null;

  bootstrap: () => Promise<void>;
  register: (identifier: string, password: string) => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  setMe: (me: Me) => void;
}

/**
 * Onboarding vəziyyəti cihazda deyil, hesabda saxlanılır.
 *
 * Münasibət statusu onboarding-in bitməsi üçün mütləq olan yeganə cavabdır, ona görə siqnal
 * odur. Serverdə olması o deməkdir ki, başqa brauzerdə və ya telefonda girəndə eyni suallar
 * təkrarlanmır, `localStorage` təmizlənəndə isə cavablar itmir.
 */
function isOnboarded(me: Me): boolean {
  return me.relationshipStatus !== "UNSPECIFIED";
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ready: false,
  authenticated: false,
  onboarded: false,
  me: null,

  bootstrap: async () => {
    // Sessiya yenilənə bilməyəndə api qatı bunu çağırır.
    setOnAuthLost(() =>
      set({ authenticated: false, onboarded: false, me: null }),
    );

    if (!hasSession()) {
      set({ ready: true, authenticated: false, onboarded: false, me: null });
      return;
    }

    try {
      /*
       * Bitmiş access token-i response interceptor özü yeniləyir, ona görə refresh token sağ
       * olduqca bu keçir — hər qayıdışda normal yol budur, istisna deyil.
       */
      const me = await userApi.getMe();
      set({ ready: true, authenticated: true, onboarded: isOnboarded(me), me });
    } catch {
      clearTokens();
      set({ ready: true, authenticated: false, onboarded: false, me: null });
    }
  },

  register: async (identifier, password) => {
    const tokens = await authApi.register(identifier, password);
    saveTokens(tokens.accessToken, tokens.refreshToken);
    const me = await userApi.getMe();
    // Təzə hesab hələ heç nə cavablamayıb, ona görə növbəti addım onboarding-dir.
    set({ authenticated: true, onboarded: isOnboarded(me), me });
  },

  login: async (identifier, password) => {
    const tokens = await authApi.login(identifier, password);
    saveTokens(tokens.accessToken, tokens.refreshToken);
    const me = await userApi.getMe();
    set({ authenticated: true, onboarded: isOnboarded(me), me });
  },

  loginWithGoogle: async (idToken) => {
    const tokens = await authApi.loginWithGoogle(idToken);
    saveTokens(tokens.accessToken, tokens.refreshToken);
    const me = await userApi.getMe();
    set({ authenticated: true, onboarded: isOnboarded(me), me });
  },

  logout: () => {
    clearTokens();
    set({ authenticated: false, onboarded: false, me: null });
  },

  refreshMe: async () => {
    if (!get().authenticated) return;
    const me = await userApi.getMe();
    set({ me, onboarded: isOnboarded(me) });
  },

  setMe: (me) => set({ me, onboarded: isOnboarded(me) }),
}));
