"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface ActiveLock {
  file_path: string;
  agent_id: string;
  agent_name: string;
  acquired_at: string;
  ttl_remaining: number;
}

interface LocksResponse {
  locks: ActiveLock[];
  total: number;
}

export function useActiveLocks(projectId: string) {
  return useQuery<LocksResponse>({
    queryKey: ["locks", projectId],
    queryFn: () => apiClient.get(`/api/v1/projects/${projectId}/locks`),
    enabled: !!projectId,
    refetchInterval: 3000,
  });
}
