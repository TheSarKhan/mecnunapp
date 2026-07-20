import { api } from './client';
import type { MemoryFactDto } from './types';

export async function getMemory(): Promise<MemoryFactDto[]> {
  const { data } = await api.get<MemoryFactDto[]>('/memory');
  return data;
}

export async function deleteFact(factId: string): Promise<void> {
  await api.delete(`/memory/${factId}`);
}

export async function deleteAllMemory(): Promise<void> {
  await api.delete('/memory');
}
