import { api } from "./client";
import type { LimitStatus } from "./types";

export async function getLimitStatus(): Promise<LimitStatus> {
  const { data } = await api.get<LimitStatus>("/limits/status");
  return data;
}
