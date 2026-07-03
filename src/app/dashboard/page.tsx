"use client";

import { useRouter } from "next/navigation";
import { Plus, ArrowRight, Sparkles, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/ui/logo";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { ProjectCard } from "@/components/dashboard/project-card";
import { useProjects } from "@/hooks/use-projects";
import { useAuth } from "@/hooks/use-auth";
import { HighlightText } from "@/components/highlight-text";

const ONBOARD = [
  { icon: GithubIcon, title: "Connect a repository", desc: "Paste a GitHub URL. We clone & analyze it once, then remember it." },
  { icon: Plus, title: "Describe a task", desc: "Add a task like \"redesign the landing page\" — plain English is fine." },
  { icon: Network, title: "Deploy the team", desc: "Hit Deploy Team and watch agents build it in parallel → one PR." },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading } = useProjects();

  const hasProjects = !!data?.projects.length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            <HighlightText>Welcome{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}</HighlightText>
          </h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">Your autonomous engineering workspace</p>
        </div>
        <Button variant="primary" onClick={() => router.push("/dashboard/projects?new=true")}>
          <Plus className="h-4 w-4" /> Connect Repository
        </Button>
      </div>

      <StatsOverview totalProjects={data?.total || 0} />

      {/* Onboarding (only when no projects) */}
      {!isLoading && !hasProjects && (
        <div className="animate-scale-in rounded-2xl border border-border bg-surface p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent">
            <Sparkles className="h-3.5 w-3.5" /> Get started in 3 steps
          </div>
          <h2 className="mt-4 text-xl font-bold text-foreground">Deploy your first AI engineering team</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {ONBOARD.map((step, i) => (
              <div key={step.title} className="rounded-xl border border-border bg-surface-2 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-sm font-bold text-accent">
                    {i + 1}
                  </span>
                  <step.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="primary" onClick={() => router.push("/dashboard/projects?new=true")}>
              <GithubIcon className="h-4 w-4" /> Connect your first repo
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard/how-it-works")}>
              How it works <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Recent projects */}
      {(isLoading || hasProjects) && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Your Projects</h2>
            {hasProjects && (
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/projects")}>
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-36 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data!.projects.slice(0, 6).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
