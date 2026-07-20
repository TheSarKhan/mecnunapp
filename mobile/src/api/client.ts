import axios, { AxiosError, AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'mecnun.accessToken';
const REFRESH_TOKEN_KEY = 'mecnun.refreshToken';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

export const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

let accessToken: string | null = null;

export async function loadTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
  const [access, refresh] = await Promise.all([
    AsyncStorage.getItem(ACCESS_TOKEN_KEY),
    AsyncStorage.getItem(REFRESH_TOKEN_KEY),
  ]);
  accessToken = access;
  return { accessToken: access, refreshToken: refresh };
}

export async function saveTokens(access: string, refresh: string): Promise<void> {
  accessToken = access;
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, access],
    [REFRESH_TOKEN_KEY, refresh],
  ]);
}

export async function clearTokens(): Promise<void> {
  accessToken = null;
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/** Backend errors are RFC 7807 ProblemDetail — pull out something showable. */
export function errorMessage(error: unknown): string {
  const detail = (error as AxiosError<{ detail?: string }>)?.response?.data?.detail;
  if (detail) return detail;
  if (error instanceof Error) return error.message;
  return 'Nəsə səhv getdi. Bir azdan yenidən yoxla.';
}

// TODO(next iteration): 401 response interceptor that calls /auth/refresh once and replays the request.
