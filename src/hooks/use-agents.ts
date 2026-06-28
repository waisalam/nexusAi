"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AgentResponse, AgentLogEntry, TaskResponse, TaskListResponse } from "@/types/agent";

export function useTasks(projectId: string) {
  return useQuery<TaskListResponse>({
    queryKey: ["tasks", projectId],
    queryFn: () => apiClient.get(`/api/v1/projects/${projectId}/tasks`),
    enabled: !!projectId,
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description: string; task_type?: string; priority?: number }) =>
      apiClient.post<TaskResponse>(`/api/v1/projects/${projectId}/tasks`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}

export function useAgents(projectId: string) {
  return useQuery<AgentResponse[]>({
    queryKey: ["agents", projectId],
    queryFn: () => apiClient.get(`/api/v1/projects/${projectId}/agents`),
    enabled: !!projectId,
    refetchInterval: 5000,
  });
}

export function useCreateAgent(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string }) =>
      apiClient.post<AgentResponse>(`/api/v1/projects/${projectId}/agents`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents", projectId] });
    },
  });
}

export function useStartExecution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ agentId, taskId }: { agentId: string; taskId: string }) =>
      apiClient.post(`/api/v1/projects/agents/${agentId}/execute/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useStopExecution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (agentId: string) =>
      apiClient.post(`/api/v1/projects/agents/${agentId}/stop`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useAgentLogs(agentId: string) {
  return useQuery<AgentLogEntry[]>({
    queryKey: ["agent-logs", agentId],
    queryFn: () => apiClient.get(`/api/v1/projects/agents/${agentId}/logs`),
    enabled: !!agentId,
    refetchInterval: 3000,
  });
}
