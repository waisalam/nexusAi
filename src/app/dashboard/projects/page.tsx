"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, FolderGit2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/ui/logo";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ProjectCard } from "@/components/dashboard/project-card";
import { useProjects, useCreateProject } from "@/hooks/use-projects";
import { projectCreateSchema, type ProjectCreateFormData } from "@/lib/validations";

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
      <ProjectsContent />
    </Suspense>
  );
}

function ProjectsContent() {
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(searchParams.get("new") === "true");
  const { data, isLoading } = useProjects();
  const createProject = useCreateProject();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectCreateFormData>({
    resolver: zodResolver(projectCreateSchema),
  });

  const onSubmit = async (formData: ProjectCreateFormData) => {
    try {
      await createProject.mutateAsync(formData);
      toast.success("Repository connected! Cloning & analyzing in the background…");
      reset();
      setShowForm(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create project");
    }
  };

  const hasProjects = !!data?.projects.length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-muted-foreground">Connect a GitHub repo to give your AI team a place to work</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Connect Repository"}
        </Button>
      </div>

      {showForm && (
        <Card className="animate-scale-in border-accent/25">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GithubIcon className="h-5 w-5 text-accent" /> Connect a GitHub Repository
            </CardTitle>
            <CardDescription>We clone & analyze it once, then your agents work from that memory.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">GitHub Repository URL</label>
                <Input placeholder="https://github.com/owner/repo" {...register("github_repo_url")} />
                {errors.github_repo_url && (
                  <p className="text-xs text-destructive">{errors.github_repo_url.message}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Project Name (optional)</label>
                  <Input placeholder="My Project" {...register("name")} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description (optional)</label>
                  <Input placeholder="A brief description" {...register("description")} />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? "Connecting..." : "Connect Repository"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-36 rounded-xl" />
          ))}
        </div>
      ) : hasProjects ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data!.projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="animate-fade-up grid-bg flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface text-muted-foreground">
              <FolderGit2 className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">No projects yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Connect your first GitHub repository to start deploying autonomous AI agents on your codebase.
            </p>
            <Button variant="primary" className="mt-6" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" /> Connect Repository
            </Button>
          </div>
        )
      )}
    </div>
  );
}
