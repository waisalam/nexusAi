"use client";

import Link from "next/link";
import { GitBranch, ExternalLink, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDeleteProject } from "@/hooks/use-projects";
import type { ProjectResponse } from "@/types/api";

interface ProjectCardProps {
  project: ProjectResponse;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusVariant = project.status === "active" ? "active" : project.status === "paused" ? "paused" : "archived";
  const deleteProject = useDeleteProject();

  const onDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete project "${project.name}"? This removes it from Nexus AI (your GitHub repo is NOT touched).`)) {
      return;
    }
    try {
      await deleteProject.mutateAsync(project.id);
      toast.success("Project deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete project");
    }
  };

  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <div className="hover-lift group relative h-full rounded-xl border border-border bg-surface p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-foreground group-hover:text-accent">
              {project.name}
            </h3>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {project.github_repo_owner}/{project.github_repo_name}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge variant={statusVariant}>{project.status}</Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              title="Delete project"
              onClick={onDelete}
              disabled={deleteProject.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5" />
              {project.default_branch}
            </span>
            <a
              href={project.github_repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              GitHub
            </a>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
            Open <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
