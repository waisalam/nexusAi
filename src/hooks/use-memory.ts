"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface Lesson {
  ts: string;
  error_pattern: string;
  root_cause: string;
  fix_approach: string;
  files: string[];
  agent: string;
  run_id: string;
  tags: string[];
  times_matched: number;
}

export interface Snapshot {
  ts: string;
  run_id: string;
  agent: string;
  summary: string;
  files: { file: string; action: string }[];
}

export interface ProjectMemory {
  project_id: string;
  total_edits: number;
  total_errors: number;
  total_fixes: number;
  total_lessons: number;
  total_snapshots: number;
  lessons: Lesson[];
  recent_snapshots: Snapshot[];
  recent_errors: { ts: string; agent: string; command: string; error: string }[];
  recent_fixes: { ts: string; agent: string; file: string; description: string }[];
}

export interface GlobalLearning {
  ts: string;
  pattern: string;
  solution: string;
  category: string;
  source_project: string;
  tags: string[];
  hit_count: number;
}

export interface GlobalStats {
  total_learnings: number;
  categories: Record<string, number>;
  learnings: GlobalLearning[];
}

export function useProjectMemory(projectId: string) {
  return useQuery<ProjectMemory>({
    queryKey: ["memory", projectId],
    queryFn: () => apiClient.get(`/api/v1/projects/${projectId}/memory`),
    enabled: !!projectId,
    refetchInterval: 30_000,
  });
}

export function useGlobalLearnings() {
  return useQuery<GlobalStats>({
    queryKey: ["global-learnings"],
    queryFn: () => apiClient.get(`/api/v1/projects/global/learnings`),
    refetchInterval: 60_000,
  });
}
