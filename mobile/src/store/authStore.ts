import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, clearTokens, loadTokens, saveTokens, setOnAuthLost, userApi } from '../api';
import type { Me } from '../api';
import { getOrCreateDeviceCredentials } from '../lib/deviceAccount';

const ONBOARDED_KEY = 'mecnun.onboarded';

function isConflict(error: unknown): boolean {
  return (error as { response?: { status?: number } })?.response?.status === 409;
}

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
    // The api layer calls this when a session cannot be recovered at all.
    setOnAuthLost(() => set({ authenticated: false, me: null }));

    const { accessToken } = await loadTokens();
    const onboarded = (await AsyncStorage.getItem(ONBOARDED_KEY)) === 'true';

    if (!accessToken && !onboarded) {
      set({ ready: true, authenticated: false, onboarded: false });
      return;
    }

    // An onboarded user whose access token expired must not be stranded: the account is anonymous
    // and tied to this device, so log back in with the stored credentials rather than making them
    // redo onboarding. Access tokens last an hour, so this is the normal path on every relaunch.
    try {
      if (!accessToken) {
        const { identifier, password } = await getOrCreateDeviceCredentials();
        const tokens = await authApi.login(identifier, password);
        await saveTokens(tokens.accessToken, tokens.refreshToken);
      }
      const me = await userApi.getMe();
      set({ ready: true, authenticated: true, onboarded, me });
    } catch {
      await clearTokens();
      set({ ready: true, authenticated: false, onboarded, me: null });
    }
  },

  register: async (identifier, password) => {
    // The device credentials outlive a half-finished onboarding, so a retry hits an account that
    // already exists. Logging in is the correct recovery — refusing would lock the user out of
    // their own device account with no login screen to reach it from.
    let tokens;
    try {
      tokens = await authApi.register(identifier, password);
    } catch (error) {
      if (isConflict(error)) {
        tokens = await authApi.login(identifier, password);
      } else {
        throw error;
      }
    }
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
