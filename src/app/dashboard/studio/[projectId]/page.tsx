"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft, CheckCircle, ChevronDown, Clock, ExternalLink, GitBranch,
  GitPullRequest, Loader2, Rocket, Users, XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrambleTextOnHover } from "@/components/scramble-text";
import { BitmapChevron } from "@/components/bitmap-chevron";
import { TeamEditor, AGENT_ROLES } from "@/components/studio/team-editor";
import { useProject } from "@/hooks/use-projects";
import { useOrchestrationRuns } from "@/hooks/use-orchestrator";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

/* Studio project workspace — the room a user returns to between builds:
 * brief the team again, swap agents, and revisit past runs. */

const EXAMPLE_BRIEFS = [
  "Add a settings page with profile editing",
  "Improve the mobile layout across all pages",
  "Add search with filters to the main list",
];

export default function StudioProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const { data: project } = useProject(projectId);
  const { data: runs } = useOrchestrationRuns(projectId);

  const [brief, setBrief] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [team, setTeam] = useState<Record<string, string>>({});
  const [teamOpen, setTeamOpen] = useState(false);
  const [savingTeam, setSavingTeam] = useState(false);
  const [teamLoaded, setTeamLoaded] = useState(false);

  useEffect(() => {
    if (project && !teamLoaded) {
      setTeam(project.model_routing_json || {});
      setTeamLoaded(true);
    }
  }, [project, teamLoaded]);

  const activeRun = runs?.find((r) => !["completed", "failed"].includes(r.status));

  const deploy = async () => {
    if (!brief.trim() || deploying) return;
    if (activeRun) return toast.error("A build is already running — wait for it to finish.");
    setDeploying(true);
    try {
      const task = await apiClient.post<{ id: string }>(`/api/v1/projects/${projectId}/tasks`, {
        title: brief.trim().slice(0, 80),
        description: brief.trim(),
      });
      const run = await apiClient.post<{ id: string }>(`/api/v1/projects/${projectId}/orchestrate`, {
        mode: "auto",
        assignments: {},
        task_ids: [task.id],
      });
      toast.success("Deploying your team…");
      router.push(`/dashboard/projects/${projectId}/runs/${run.id}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Couldn't start the run.");
      setDeploying(false);
    }
  };

  const saveTeam = async () => {
    setSavingTeam(true);
    try {
      const routing: Record<string, string> = {};
      for (const r of AGENT_ROLES) routing[r.key] = team[r.key] || "";
      await apiClient.patch(`/api/v1/projects/${projectId}`, { model_routing_json: routing });
      toast.success("Team updated — next build uses the new agents");
    } catch {
      toast.error("Couldn't save the team.");
    } finally {
      setSavingTeam(false);
    }
  };

  if (!project) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
      </div>
    );
  }

  const configuredCount = AGENT_ROLES.filter((r) => (team[r.key] || "").length > 0).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/studio">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Nexus Studio</p>
            <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
          </div>
        </div>
        <a
          href={project.github_repo_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          <GitBranch className="h-3.5 w-3.5" />
          {project.github_repo_owner}/{project.github_repo_name}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Active run banner */}
      {activeRun && (
        <Link href={`/dashboard/projects/${projectId}/runs/${activeRun.id}`}>
          <div className="flex cursor-pointer items-center justify-between rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 transition-colors hover:bg-accent/15">
            <span className="flex items-center gap-2.5 text-sm text-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              Your team is working — <span className="capitalize">{activeRun.status.replace(/_/g, " ")}</span>
            </span>
            <span className="font-mono text-[11px] uppercase tracking-widest text-accent">Watch live →</span>
          </div>
        </Link>
      )}

      {/* Brief composer — the hero */}
      <div className="glass-metal relative overflow-hidden p-6 sm:p-8">
        <div className="metal-edge" />
        <div className="relative">
          <h2 className="font-(family-name:--font-bebas) text-3xl tracking-wide text-foreground">
            What&apos;s next for this repo?
          </h2>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={4}
            placeholder={`e.g. "${EXAMPLE_BRIEFS[0]}"`}
            className="mt-4 w-full resize-none rounded-xl border border-border bg-background p-4 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus-visible:border-accent/70 focus-visible:outline-none"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLE_BRIEFS.map((ex) => (
              <button
                key={ex}
                onClick={() => setBrief(ex)}
                className="rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
              >
                {ex}
              </button>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> {configuredCount} custom agent{configuredCount === 1 ? "" : "s"} · rest on auto
            </span>
            <button
              onClick={deploy}
              disabled={deploying || !brief.trim() || !!activeRun}
              className="group inline-flex items-center gap-3 border border-foreground/20 bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-widest text-background transition-all duration-200 hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              {deploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              <ScrambleTextOnHover text={deploying ? "Deploying…" : "Deploy team"} duration={0.4} />
              <BitmapChevron className="transition-transform duration-400 group-hover:rotate-45" />
            </button>
          </div>
        </div>
      </div>

      {/* Team — collapsible editor to swap agents between builds */}
      <div className="rounded-2xl border border-border bg-surface">
        <button
          onClick={() => setTeamOpen((s) => !s)}
          className="flex w-full items-center justify-between px-5 py-4"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Users className="h-4 w-4 text-accent" /> Your team
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {configuredCount}/6 custom
            </span>
          </span>
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {teamOpen ? "Close" : "Swap agents"}
            <ChevronDown className={cn("h-4 w-4 transition-transform", teamOpen && "rotate-180")} />
          </span>
        </button>
        {teamOpen && (
          <div className="border-t border-border p-5">
            <TeamEditor value={team} onChange={setTeam} />
            <div className="mt-4 flex justify-end">
              <Button variant="primary" onClick={saveTeam} disabled={savingTeam}>
                {savingTeam ? "Saving…" : "Save team"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Past builds */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Clock className="h-4 w-4 text-accent" /> Builds
        </h2>
        <div className="space-y-2">
          {(runs || []).length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No builds yet — brief your team above to start the first one.
            </p>
          )}
          {(runs || []).map((r) => (
            <Link key={r.id} href={`/dashboard/projects/${projectId}/runs/${r.id}`}>
              <div className="mb-2 flex cursor-pointer items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-muted-foreground">
                <div className="flex items-center gap-3">
                  {r.status === "completed" ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-accent" />
                  ) : r.status === "failed" ? (
                    <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                  ) : (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" />
                  )}
                  <div>
                    <p className="font-mono text-xs text-foreground">Run {r.id.slice(0, 8)}</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {r.result_pr_url && (
                    <span className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-accent">
                      <GitPullRequest className="h-3.5 w-3.5" /> PR
                    </span>
                  )}
                  <span className={cn(
                    "rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest",
                    r.status === "completed" ? "bg-accent/15 text-accent"
                      : r.status === "failed" ? "bg-destructive/15 text-destructive"
                      : "bg-surface-2 text-muted-foreground",
                  )}>
                    {r.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
