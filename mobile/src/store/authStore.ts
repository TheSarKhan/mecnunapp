import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, clearTokens, loadTokens, saveTokens, userApi } from '../api';
import type { Me } from '../api';

const ONBOARDED_KEY = 'mecnun.onboarded';

interface AuthState {
  /** null while we are still restoring the session from storage. */
  ready: boolean;
  authenticated: boolean;
  onboarded: boolean;
  me: Me | null;

  bootstrap: () => Promise<void>;
  register: (identifier: string, password: string) => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  setMe: (me: Me) => void;
  markOnboarded: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ready: false,
  authenticated: false,
  onboarded: false,
  me: null,

  bootstrap: async () => {
    const { accessToken } = await loadTokens();
    const onboarded = (await AsyncStorage.getItem(ONBOARDED_KEY)) === 'true';
    if (!accessToken) {
      set({ ready: true, authenticated: false, onboarded });
      return;
    }
    try {
      const me = await userApi.getMe();
      set({ ready: true, authenticated: true, onboarded, me });
    } catch {
      await clearTokens();
      set({ ready: true, authenticated: false, onboarded, me: null });
    }
  },

  register: async (identifier, password) => {
    const tokens = await authApi.register(identifier, password);
    await saveTokens(tokens.accessToken, tokens.refreshToken);
    const me = await userApi.getMe();
    set({ authenticated: true, me });
  },

  login: async (identifier, password) => {
    const tokens = await authApi.login(identifier, password);
    await saveTokens(tokens.accessToken, tokens.refreshToken);
    const me = await userApi.getMe();
    set({ authenticated: true, onboarded: true, me });
  },

  logout: async () => {
    await clearTokens();
    set({ authenticated: false, me: null });
  },

  refreshMe: async () => {
    if (!get().authenticated) return;
    set({ me: await userApi.getMe() });
  },

  setMe: (me) => set({ me }),

  markOnboarded: async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
    set({ onboarded: true });
  },
}));
