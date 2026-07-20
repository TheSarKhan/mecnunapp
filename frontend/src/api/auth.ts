import { api } from "./client";
import type { TokenResponse } from "./types";

export async function register(
  identifier: string,
  password: string,
): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>("/auth/register", {
    identifier,
    password,
  });
  return data;
}

export async function login(
  identifier: string,
  password: string,
): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>("/auth/login", {
    identifier,
    password,
  });
  return data;
}

export async function refresh(refreshToken: string): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>("/auth/refresh", {
    refreshToken,
  });
  return data;
}

/** Google-un verdiyi ID token-i öz tokenlərimizə dəyişir; hesab yoxdursa yaradılır. */
export async function loginWithGoogle(
  idToken: string,
): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>("/auth/google", { idToken });
  return data;
}
