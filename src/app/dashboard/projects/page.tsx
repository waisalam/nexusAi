"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, FolderGit2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/dashboard/project-card";
import { NewProjectWizard } from "@/components/dashboard/new-project-wizard";
import { useProjects } from "@/hooks/use-projects";

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
  // Company surface only — Studio (BYOM) repos live in /studio, never mixed here.
  const { data, isLoading } = useProjects("main");

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
        <NewProjectWizard onDone={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
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
