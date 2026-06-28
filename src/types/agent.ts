export interface TaskResponse {
  id: string;
  project_id: string;
  title: string;
  description: string;
  task_type: string;
  status: string;
  priority: number;
  assigned_agent_id: string | null;
  parent_task_id: string | null;
  target_files: Record<string, unknown> | null;
  result_branch: string | null;
  result_pr_url: string | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  completed_at: string | null;
}

export interface TaskListResponse {
  tasks: TaskResponse[];
  total: number;
}

export interface AgentResponse {
  id: string;
  project_id: string;
  name: string;
  status: string;
  current_task_id: string | null;
  model_config_json: Record<string, unknown>;
  work_branch: string | null;
  workspace_path: string | null;
  token_usage: Record<string, number>;
  last_heartbeat: string | null;
  created_at: string;
}

export interface AgentLogEntry {
  id: string;
  agent_id: string;
  task_id: string | null;
  log_type: string;
  content: string;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
}
