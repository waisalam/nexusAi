"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ProjectListResponse, ProjectResponse } from "@/types/api";

export function useProjects(workspace?: "main" | "studio") {
  return useQuery<ProjectListResponse>({
    queryKey: ["projects", { workspace: workspace || "all" }],
    queryFn: () =>
      apiClient.get(`/api/v1/projects${workspace ? `?workspace=${workspace}` : ""}`),
  });
}

export function useProject(projectId: string) {
  return useQuery<ProjectResponse>({
    queryKey: ["projects", projectId],
    queryFn: () => apiClient.get(`/api/v1/projects/${projectId}`),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { github_repo_url: string; name?: string; description?: string; workspace?: "main" | "studio" }) =>
      apiClient.post<ProjectResponse>("/api/v1/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useSyncProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post<ProjectResponse>(`/api/v1/projects/${projectId}/sync`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => apiClient.delete(`/api/v1/projects/${projectId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
