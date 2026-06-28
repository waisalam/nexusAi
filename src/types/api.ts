export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  auth_provider: string;
  is_active: boolean;
  created_at: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description: string | null;
  github_repo_url: string;
  github_repo_owner: string;
  github_repo_name: string;
  default_branch: string;
  status: string;
  last_synced_at: string | null;
  last_synced_sha: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectListResponse {
  projects: ProjectResponse[];
  total: number;
}

export interface ApiError {
  detail: string;
}
