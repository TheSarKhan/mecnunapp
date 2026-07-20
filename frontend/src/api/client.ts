import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

import { readLocal, removeLocal, writeLocal } from "@/lib/storage";

const ACCESS_TOKEN_KEY = "mecnun.accessToken";
const REFRESH_TOKEN_KEY = "mecnun.refreshToken";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const API_ROOT = `${API_BASE_URL}/api/v1`;

export const api: AxiosInstance = axios.create({
  baseURL: API_ROOT,
  // Gemini cavabı bir neçə saniyə çəkir; 60s tavan "model düşünür"ü "şəbəkə öldü"dən ayırır.
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

/** Auth çağırışları üçün çılpaq klient — bərpa interceptor-un içindən özünə qayıtmasın. */
const authApi = axios.create({ baseURL: API_ROOT, timeout: 30000 });

let accessToken: string | null = null;
let refreshToken: string | null = null;
let hydrated = false;

/**
 * Tokenləri `localStorage`-dan birinci ehtiyac anında oxuyur.
 *
 * Modul yüklənəndə deyil — modul serverdə də icra olunur, orada `localStorage` yoxdur. Sinxron
 * olduğuna görə mobildəki `loadTokens()` await-i burada lazım deyil.
 */
function hydrate(): void {
  if (hydrated || typeof window === "undefined") return;
  accessToken = readLocal(ACCESS_TOKEN_KEY);
  refreshToken = readLocal(REFRESH_TOKEN_KEY);
  hydrated = true;
}

export function hasSession(): boolean {
  hydrate();
  return accessToken !== null;
}

export function saveTokens(access: string, refresh: string): void {
  accessToken = access;
  refreshToken = refresh;
  hydrated = true;
  writeLocal(ACCESS_TOKEN_KEY, access);
  writeLocal(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
  hydrated = true;
  removeLocal(ACCESS_TOKEN_KEY);
  removeLocal(REFRESH_TOKEN_KEY);
}

/** Sessiya yenilənə bilməyəndə çağırılır ki, app istifadəçini giriş ekranına qaytarsın. */
let onAuthLost: (() => void) | null = null;

export function setOnAuthLost(handler: (() => void) | null): void {
  onAuthLost = handler;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  hydrate();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/**
 * Bitmiş access token-i saxlanmış refresh token ilə yeniləyir.
 *
 * Alınmasa cəhd ediləsi başqa yol yoxdur: hesablar artıq realdır, ona görə düzgün nəticə
 * sessiyanı atıb istifadəçini giriş ekranına qaytarmaqdır.
 *
 * Tək axın: eyni anda düşən bir neçə sorğu bir yeniləmə başlatmalıdır, hər biri öz yeniləməsini yox.
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
      const { data } = await authApi.post("/auth/refresh", { refreshToken });
      saveTokens(data.accessToken, data.refreshToken);
      return true;
    } catch {
      // Refresh token bitib və ya rədd olunub — sessiya həqiqətən bitib.
    }
  }

  clearTokens();
  onAuthLost?.();
  return false;
}

/**
 * Bir dəfə yenidən autentifikasiya edib sorğunu təkrarlayır.
 *
 * 403 də 401 ilə yanaşı auth xətası sayılır: Spring Security entry point qurulmayanda
 * autentifikasiyasız sorğuya 403 cavab verir — bitmiş access token buradan məhz belə görünür.
 */
api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const status = error.response?.status;
  const original = error.config as
    | (AxiosRequestConfig & { _retried?: boolean })
    | undefined;

  const isAuthCall = original?.url?.startsWith("/auth/");
  if (
    (status === 401 || status === 403) &&
    original &&
    !original._retried &&
    !isAuthCall
  ) {
    original._retried = true;
    if (await reauthenticate()) {
      return api(original);
    }
  }
  return Promise.reject(error);
});

/** Backend xətaları RFC 7807 ProblemDetail-dır — göstərilə bilən nəyisə çıxar. */
export function errorMessage(error: unknown): string {
  const detail = (error as AxiosError<{ detail?: string }>)?.response?.data
    ?.detail;
  if (detail) return detail;
  if (error instanceof Error) return error.message;
  return "Nəsə səhv getdi. Bir azdan yenidən yoxla.";
}

/** Limit tükənəndə backend 429 qaytarır — paywall-ı açmaq üçün ayrıca tanınmalıdır. */
export function isLimitReached(error: unknown): boolean {
  return (error as AxiosError)?.response?.status === 429;
}

/** Premium tələb edən əməliyyat (söyüş modu) — backend 402 qaytarır. */
export function isPremiumRequired(error: unknown): boolean {
  return (error as AxiosError)?.response?.status === 402;
}
