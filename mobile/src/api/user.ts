import { api } from './client';
import type { Me, UpdateProfileRequest } from './types';

export async function getMe(): Promise<Me> {
  const { data } = await api.get<Me>('/users/me');
  return data;
}

export async function updateProfile(request: UpdateProfileRequest): Promise<Me> {
  const { data } = await api.put<Me>('/users/me/profile', request);
  return data;
}

export async function updateSettings(profanityEnabled: boolean): Promise<Me> {
  const { data } = await api.patch<Me>('/users/me/settings', { profanityEnabled });
  return data;
}

export async function deleteAccount(): Promise<void> {
  await api.delete('/users/me');
}
