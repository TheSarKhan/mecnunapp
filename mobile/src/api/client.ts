import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'mecnun.accessToken';
const REFRESH_TOKEN_KEY = 'mecnun.refreshToken';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';
const API_ROOT = `${API_BASE_URL}/api/v1`;

export const api: AxiosInstance = axios.create({
  baseURL: API_ROOT,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

/** Bare client for auth calls, so re-authentication cannot recurse through the interceptor. */
const authApi = axios.create({ baseURL: API_ROOT, timeout: 30000 });

let accessToken: string | null = null;
let refreshToken: string | null = null;

/** Called when re-authentication is impossible, so the app can send the user back to onboarding. */
let onAuthLost: (() => void) | null = null;

export function setOnAuthLost(handler: (() => void) | null): void {
  onAuthLost = handler;
}

export async function loadTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
  const [access, refresh] = await Promise.all([
    AsyncStorage.getItem(ACCESS_TOKEN_KEY),
    AsyncStorage.getItem(REFRESH_TOKEN_KEY),
  ]);
  accessToken = access;
  refreshToken = refresh;
  return { accessToken: access, refreshToken: refresh };
}

export async function saveTokens(access: string, refresh: string): Promise<void> {
  accessToken = access;
  refreshToken = refresh;
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, access],
    [REFRESH_TOKEN_KEY, refresh],
  ]);
}

export async function clearTokens(): Promise<void> {
  accessToken = null;
  refreshToken = null;
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/**
 * Renews an expired access token using the stored refresh token.
 *
 * If that fails there is nothing else to try: accounts are real now, so the honest outcome is to
 * drop the session and let the user sign in again.
 *
 * Single-flight: several requests failing at once must trigger one renewal, not one each.
 */
let recovery: Promise<boolean> | null = null;

function reauthenticate(): Promise<boolean> {
  if (!recovery) {
    recovery = attemptRecovery().finally(() => {
      recovery = null;
    });
  }
  return recovery;
}

async function attemptRecovery(): Promise<boolean> {
  if (refreshToken) {
    try {
      const { data } = await authApi.post('/auth/refresh', { refreshToken });
      await saveTokens(data.accessToken, data.refreshToken);
      return true;
    } catch {
      // Refresh token expired or was rejected — the session is genuinely over.
    }
  }

  await clearTokens();
  onAuthLost?.();
  return false;
}

/**
 * Retries once after re-authenticating.
 *
 * 403 is treated as an auth failure alongside 401 because Spring Security answers unauthenticated
 * requests with 403 when no entry point is configured — which is exactly what an expired access
 * token looks like from here.
 */
api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const status = error.response?.status;
  const original = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;

  const isAuthCall = original?.url?.startsWith('/auth/');
  if ((status === 401 || status === 403) && original && !original._retried && !isAuthCall) {
    original._retried = true;
    if (await reauthenticate()) {
      return api(original);
    }
  }
  return Promise.reject(error);
});

/** Backend errors are RFC 7807 ProblemDetail — pull out something showable. */
export function errorMessage(error: unknown): string {
  const detail = (error as AxiosError<{ detail?: string }>)?.response?.data?.detail;
  if (detail) return detail;
  if (error instanceof Error) return error.message;
  return 'Nəsə səhv getdi. Bir azdan yenidən yoxla.';
}
