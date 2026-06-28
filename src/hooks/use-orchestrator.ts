"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface OrchestrationRun {
  id: string;
  project_id: string;
  fixer_agent_id: string | null;
  mode: string;
  status: string;
  assignments: Record<string, string>;
  source_task_ids: string[] | null;
  integration_branch: string | null;
  result_pr_url: string | null;
  build_log: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export function useOrchestrationRuns(projectId: string) {
  return useQuery<OrchestrationRun[]>({
    queryKey: ["orchestration-runs", projectId],
    queryFn: () => apiClient.get(`/api/v1/projects/${projectId}/orchestrate/runs`),
    enabled: !!projectId,
    refetchInterval: 3000,
  });
}

export function useStartOrchestration(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { mode: "auto" | "manual"; assignments: Record<string, string>; task_ids?: string[] }) =>
      apiClient.post<OrchestrationRun>(`/api/v1/projects/${projectId}/orchestrate`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orchestration-runs", projectId] });
      queryClient.invalidateQueries({ queryKey: ["agents", projectId] });
    },
  });
}

export function useStopOrchestration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (runId: string) =>
      apiClient.post(`/api/v1/projects/orchestrate/runs/${runId}/stop`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orchestration-runs"] });
    },
  });
}
