"use client";

import { useRef, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Square, ExternalLink, Loader2, CheckCircle, XCircle,
  Brain, Bot, GitPullRequest, Clock, Hammer, GitMerge, ListChecks,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProject } from "@/hooks/use-projects";
import { useAgents, useTasks } from "@/hooks/use-agents";
import { useOrchestrationRuns, useStopOrchestration, useApproveOrchestration } from "@/hooks/use-orchestrator";
import { useOrchestratorStream } from "@/hooks/use-sse";
import { AgentRunCard } from "@/components/agents/agent-run-card";

/* Step-wise run view: one PRIMARY panel per phase (plan → agents → build → result),
 * never everything expanded at once. Passed/future steps collapse to slim rows; the
 * current step is the hero. The activity feed is a chat timeline, not a raw log. */

const STEPS = [
  { key: "plan", label: "Plan", icon: ListChecks, statuses: ["pending", "decomposing", "awaiting_approval", "approved"] },
  { key: "agents", label: "Agents", icon: Bot, statuses: ["agents_working"] },
  { key: "build", label: "Integrate & Build", icon: Hammer, statuses: ["integrating", "building", "fixing"] },
  { key: "result", label: "Pull Request", icon: GitPullRequest, statuses: ["completed", "failed"] },
];

function stepIndexFor(status: string): number {
  const i = STEPS.findIndex((s) => s.statuses.includes(status));
  return i === -1 ? 0 : i;
}

const PHASE_BLURB: Record<string, string> = {
  pending: "Preparing the run…",
  decomposing: "The Brain is reading your repo and splitting the task into subtasks…",
  awaiting_approval: "Plan ready — review it below and approve to start. Nothing changes until you do.",
  approved: "Plan approved — deploying the team…",
  agents_working: "Agents are coding in parallel, each on its own files…",
  integrating: "Merging every agent's branch into one integration branch…",
  building: "Running the real build to verify the integrated code…",
  fixing: "Build reported errors — the Fixer is patching and re-running…",
  completed: "Done — one verified pull request is ready for review.",
  failed: "The run stopped — see the error below and the activity feed for details.",
};

const typeChip: Record<string, string> = {
  plan: "bg-amber-500/15 text-amber-600",
  code: "bg-blue-500/15 text-blue-600",
  build: "bg-accent/15 text-accent",
  lock: "bg-orange-500/15 text-orange-600",
  error: "bg-destructive/15 text-destructive",
};

export default function RunDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const runId = params.runId as string;

  const { data: project } = useProject(projectId);
  const { data: runs } = useOrchestrationRuns(projectId);
  const { data: agents } = useAgents(projectId);
  const { data: tasksData } = useTasks(projectId);
  const stopOrchestration = useStopOrchestration();
  const approveOrchestration = useApproveOrchestration();

  const run = runs?.find((r) => r.id === runId);
  const { logs: brainLogs, connected } = useOrchestratorStream(run ? run.id : null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [brainLogs.length]);

  // Build & Fix convergence: pull "Converging: X → Y error(s)" trail out of the logs.
  const convergence = useMemo(() => {
    const counts: number[] = [];
    let attempts = 0;
    for (const log of brainLogs) {
      const m = log.content.match(/Converging: (\d+) → (\d+) error/);
      if (m) {
        if (counts.length === 0) counts.push(Number(m[1]));
        counts.push(Number(m[2]));
      }
      if (/Fixer patching code \(attempt \d+/.test(log.content)) attempts += 1;
    }
    return { counts, attempts };
  }, [brainLogs]);

  if (!project || !run) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading run...
      </div>
    );
  }

  const agentIds = Object.values(run.assignments || {}) as string[];
  const runAgents = (agents || []).filter(
    (a) => agentIds.includes(a.id) && a.name !== "Fixer (Orchestrator)",
  );
  const allTasks = tasksData?.tasks || [];

  const agentTaskMap: Record<string, (typeof allTasks)[number]> = {};
  for (const [taskId, agentId] of Object.entries(run.assignments || {})) {
    const task = allTasks.find((t) => t.id === taskId);
    if (task) agentTaskMap[agentId as string] = task;
  }

  const isActive = !["completed", "failed"].includes(run.status);
  const isFailed = run.status === "failed";
  const awaitingApproval = run.status === "awaiting_approval";
  const currentStep = stepIndexFor(run.status);

  const busyAgents = runAgents.filter((a) =>
    ["planning", "coding", "building", "testing", "pushing"].includes(a.status),
  ).length;
  const doneAgents = runAgents.filter((a) => a.status === "completed").length;

  const elapsed = run.completed_at
    ? Math.round((new Date(run.completed_at).getTime() - new Date(run.created_at).getTime()) / 1000)
    : Math.round((Date.now() - new Date(run.created_at).getTime()) / 1000);

  const onStop = async () => {
    try {
      await stopOrchestration.mutateAsync(run.id);
      toast.success("Orchestration stopped");
    } catch {
      toast.error("Failed to stop");
    }
  };

  const onApprove = async () => {
    try {
      await approveOrchestration.mutateAsync(run.id);
      toast.success("Plan approved — deploying the team");
    } catch {
      toast.error("Failed to approve");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/projects/${projectId}`}>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
            <div className="mt-0.5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              <span>Run {run.id.slice(0, 8)}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {Math.floor(elapsed / 60)}m {elapsed % 60}s
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isFailed ? (
            <span className="flex items-center gap-1.5 text-sm font-medium text-destructive">
              <XCircle className="h-4 w-4" /> Failed
            </span>
          ) : run.status === "completed" ? (
            <span className="flex items-center gap-1.5 text-sm font-medium text-accent">
              <CheckCircle className="h-4 w-4" /> Completed
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              <span className="capitalize">{run.status.replace(/_/g, " ")}</span>
            </span>
          )}
          {isActive && (
            <Button variant="destructive" size="sm" onClick={onStop}>
              <Square className="mr-1 h-3.5 w-3.5" /> Stop
            </Button>
          )}
        </div>
      </div>

      {/* ── Stepper + phase blurb ──────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center">
          {STEPS.map((s, i) => {
            const reached = currentStep > i || (currentStep === i && !isActive) || (isFailed && currentStep >= i);
            const isCurrent = currentStep === i && isActive;
            const done = currentStep > i || (run.status === "completed" && i === STEPS.length - 1);
            return (
              <div key={s.key} className={cn("flex items-center", i < STEPS.length - 1 && "flex-1")}>
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all",
                      done
                        ? "border-accent bg-accent text-accent-foreground"
                        : isCurrent
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-surface-2 text-muted-foreground",
                    )}
                  >
                    {done ? <CheckCircle className="h-4 w-4" /> : isCurrent && isActive ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <s.icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p className={cn(
                      "font-mono text-[10px] uppercase tracking-widest",
                      isCurrent ? "text-accent" : done ? "text-foreground" : "text-muted-foreground",
                    )}>
                      Step {i + 1}
                    </p>
                    <p className={cn(
                      "text-xs font-medium",
                      isCurrent || done ? "text-foreground" : "text-muted-foreground",
                    )}>
                      {s.label}
                    </p>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("mx-3 h-px flex-1", currentStep > i ? "bg-accent" : "bg-border")} />
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">
          {PHASE_BLURB[run.status] || "Working…"}
        </p>
      </div>

      {/* ── STEP 1 hero: plan approval ─────────────────────────────────── */}
      {awaitingApproval && (
        <div className="rounded-xl border border-amber-600/40 bg-amber-600/10 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4" /> Plan ready — your approval needed
              </h2>
              <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-300/70">
                {runAgents.length} agent{runAgents.length === 1 ? "" : "s"} will work in parallel on
                disjoint files. <strong>Nothing is changed until you approve.</strong>
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="destructive" size="sm" onClick={onStop} disabled={stopOrchestration.isPending}>
                <Square className="mr-1 h-3.5 w-3.5" /> Cancel
              </Button>
              <Button size="sm" onClick={onApprove} disabled={approveOrchestration.isPending}>
                <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve &amp; Run
              </Button>
            </div>
          </div>
          <div className="mt-3 max-h-96 space-y-2 overflow-y-auto">
            {runAgents.map((agent, idx) => {
              const task = agentTaskMap[agent.id];
              const steps = (task?.target_files as Record<string, unknown> | undefined)?.steps as
                | Array<{ file_path: string; action: string; description: string }>
                | undefined;
              return (
                <div key={agent.id} className="rounded-lg border border-amber-600/25 bg-surface p-2.5">
                  <p className="mb-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
                    {idx + 1}. {agent.name}
                  </p>
                  {steps && steps.length > 0 ? (
                    <ul className="space-y-1.5">
                      {steps.map((s, i) => (
                        <li key={i} className="text-[11px] leading-relaxed text-muted-foreground">
                          <span className={cn(
                            "mr-1.5 rounded px-1 py-0.5 text-[9px] font-bold uppercase",
                            s.action === "create" ? "bg-accent/15 text-accent" :
                            s.action === "delete" ? "bg-destructive/15 text-destructive" :
                            "bg-blue-600/15 text-blue-600",
                          )}>
                            {s.action}
                          </span>
                          <span className="font-mono text-foreground">{s.file_path}</span>
                          <span className="text-muted-foreground"> — {s.description}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">Generating plan…</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEP 2 hero: agents (full grid only while they work; compact strip after) ── */}
      {runAgents.length > 0 && !awaitingApproval && (
        run.status === "agents_working" ? (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Bot className="h-4 w-4 text-accent" /> Deployed Agents ({runAgents.length})
              </h2>
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {busyAgents} working · {doneAgents} done
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {runAgents.map((agent, i) => (
                <AgentRunCard key={agent.id} agent={agent} task={agentTaskMap[agent.id]} colorIndex={i} showPlan={false} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3">
            <Bot className="h-4 w-4 shrink-0 text-accent" />
            <span className="mr-1 text-xs text-muted-foreground">Team:</span>
            {runAgents.map((a) => (
              <span
                key={a.id}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 font-mono text-[11px]",
                  a.status === "completed"
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : a.status === "error"
                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                    : "border-border text-muted-foreground",
                )}
              >
                {a.name}
              </span>
            ))}
          </div>
        )
      )}

      {/* ── STEP 3 hero: integrate & build (convergence) ───────────────── */}
      {["integrating", "building", "fixing"].includes(run.status) && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            {run.status === "integrating" ? (
              <><GitMerge className="h-4 w-4 text-accent" /> Merging agent branches</>
            ) : (
              <><Hammer className="h-4 w-4 text-accent" /> Build verification</>
            )}
          </h2>
          {convergence.counts.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">Errors remaining after each fix pass</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-sm">
                {convergence.counts.map((c, i) => (
                  <span key={i} className="flex items-center gap-2">
                    <span className={cn(
                      "rounded-md border px-2 py-0.5",
                      i === convergence.counts.length - 1
                        ? "border-accent/50 bg-accent/10 text-accent"
                        : "border-border text-muted-foreground",
                    )}>
                      {c}
                    </span>
                    {i < convergence.counts.length - 1 && <span className="text-muted-foreground">→</span>}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {convergence.attempts} fix pass{convergence.attempts === 1 ? "" : "es"} so far — the
                Fixer keeps going while the number drops.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              {run.status === "fixing"
                ? "The Fixer is analyzing the build errors…"
                : "Installing dependencies and running the project's real build…"}
            </p>
          )}
        </div>
      )}

      {/* ── STEP 4 hero: result ────────────────────────────────────────── */}
      {run.error_message && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="mb-1 font-medium">Error</p>
          {run.error_message}
        </div>
      )}
      {run.result_pr_url && (
        <a href={run.result_pr_url} target="_blank" rel="noopener noreferrer">
          <div className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 p-5 text-accent transition-colors hover:bg-accent/15">
            <GitPullRequest className="h-5 w-5" />
            <span className="font-medium">View Integrated Pull Request</span>
            <ExternalLink className="h-4 w-4" />
          </div>
        </a>
      )}

      {/* Studio: the loop continues — brief the team again on this same repo */}
      {!isActive && project.workspace === "studio" && (
        <Link href={`/dashboard/studio/${projectId}`}>
          <div className="mt-2 flex cursor-pointer items-center justify-between rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:border-accent">
            <span className="text-sm text-foreground">
              Done reviewing? <span className="text-muted-foreground">Give your team the next task on this repo.</span>
            </span>
            <span className="font-mono text-[11px] uppercase tracking-widest text-accent">Brief again →</span>
          </div>
        </Link>
      )}

      {/* ── Activity: chat timeline (Brain ↔ team), collapsible ────────── */}
      <details open={isActive} className="group rounded-xl border border-border bg-surface">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Brain className="h-4 w-4 text-amber-500" /> Live activity
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {brainLogs.length} events
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", connected ? "bg-accent" : "bg-muted-foreground/40")} />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {connected ? "Live" : "Idle"}
            </span>
          </span>
        </summary>
        <div ref={feedRef} className="max-h-96 space-y-2.5 overflow-y-auto border-t border-border p-4">
          {brainLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Waiting for activity…</p>
          ) : (
            brainLogs
              .filter((log) => log.log_type !== "status")
              .map((log, i) => {
                // Chat sender: "Fixer …" lines come from the Fixer; the rest is the Brain.
                const sender = log.content.startsWith("Fixer") ? "Fixer" : "Brain";
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold",
                        sender === "Fixer"
                          ? "border-orange-500/40 bg-orange-500/10 text-orange-500"
                          : "border-amber-500/40 bg-amber-500/10 text-amber-500",
                      )}
                      title={sender}
                    >
                      {sender === "Fixer" ? "F" : "B"}
                    </span>
                    <div className="min-w-0 flex-1 rounded-lg rounded-tl-none border border-border bg-background px-3 py-2">
                      <div className="mb-0.5 flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-foreground">{sender}</span>
                        <span className={cn(
                          "rounded px-1.5 py-px font-mono text-[9px] font-bold uppercase",
                          typeChip[log.log_type] || "bg-surface-2 text-muted-foreground",
                        )}>
                          {log.log_type}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap wrap-break-word text-xs leading-relaxed text-muted-foreground">
                        {log.content}
                      </p>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </details>
    </div>
  );
}
