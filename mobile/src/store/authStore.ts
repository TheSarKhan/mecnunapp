import { create } from 'zustand';
import { authApi, clearTokens, loadTokens, saveTokens, setOnAuthLost, userApi } from '../api';
import type { Me } from '../api';

interface AuthState {
  /** False while the stored session is still being restored. */
  ready: boolean;
  authenticated: boolean;
  /** Whether the profile questions (18+, gender, persona, name, status) have been answered. */
  onboarded: boolean;
  me: Me | null;

  bootstrap: () => Promise<void>;
  register: (identifier: string, password: string) => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  setMe: (me: Me) => void;
  markOnboarded: () => void;
}

/**
 * Onboarding state is derived from the account, not stored on the device.
 *
 * A relationship status is the one answer onboarding cannot finish without, so its presence is
 * the signal. Keeping this server-side means signing in on a second device does not ask the same
 * questions again, and a reinstall does not lose the answers.
 */
function isOnboarded(me: Me): boolean {
  return me.relationshipStatus !== 'UNSPECIFIED';
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ready: false,
  authenticated: false,
  onboarded: false,
  me: null,

  bootstrap: async () => {
    // The api layer calls this when a session cannot be renewed.
    setOnAuthLost(() => set({ authenticated: false, onboarded: false, me: null }));

    const { accessToken, refreshToken } = await loadTokens();
    if (!accessToken && !refreshToken) {
      set({ ready: true, authenticated: false, onboarded: false, me: null });
      return;
    }

    try {
      // An expired access token is renewed by the response interceptor, so this succeeds as long
      // as the refresh token is still good — which is the normal case on every relaunch.
      const me = await userApi.getMe();
      set({ ready: true, authenticated: true, onboarded: isOnboarded(me), me });
    } catch {
      await clearTokens();
      set({ ready: true, authenticated: false, onboarded: false, me: null });
    }
  },

  register: async (identifier, password) => {
    const tokens = await authApi.register(identifier, password);
    await saveTokens(tokens.accessToken, tokens.refreshToken);
    const me = await userApi.getMe();
    // A fresh account has answered nothing yet, so onboarding runs next.
    set({ authenticated: true, onboarded: isOnboarded(me), me });
  },

  login: async (identifier, password) => {
    const tokens = await authApi.login(identifier, password);
    await saveTokens(tokens.accessToken, tokens.refreshToken);
    const me = await userApi.getMe();
    set({ authenticated: true, onboarded: isOnboarded(me), me });
  },

  loginWithGoogle: async (idToken) => {
    const tokens = await authApi.loginWithGoogle(idToken);
    await saveTokens(tokens.accessToken, tokens.refreshToken);
    const me = await userApi.getMe();
    set({ authenticated: true, onboarded: isOnboarded(me), me });
  },

  logout: async () => {
    await clearTokens();
    set({ authenticated: false, onboarded: false, me: null });
  },

  refreshMe: async () => {
    if (!get().authenticated) return;
    const me = await userApi.getMe();
    set({ me, onboarded: isOnboarded(me) });
  },

  setMe: (me) => set({ me, onboarded: isOnboarded(me) }),

  markOnboarded: () => set({ onboarded: true }),
}));
