"use client";

import { useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Square, ExternalLink, Loader2, CheckCircle, XCircle,
  Brain, Bot, GitPullRequest, Clock,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProject } from "@/hooks/use-projects";
import { useAgents, useTasks } from "@/hooks/use-agents";
import { useOrchestrationRuns, useStopOrchestration, useApproveOrchestration } from "@/hooks/use-orchestrator";
import { useOrchestratorStream } from "@/hooks/use-sse";
import { AgentRunCard } from "@/components/agents/agent-run-card";

const PIPELINE = [
  { key: "decomposing", label: "Decompose" },
  { key: "agents_working", label: "Agents" },
  { key: "integrating", label: "Integrate" },
  { key: "building", label: "Build" },
  { key: "fixing", label: "Fix" },
  { key: "completed", label: "Done" },
];
const STAGE_KEYS = PIPELINE.map((s) => s.key);

const brainLogColors: Record<string, string> = {
  plan: "text-amber-400",
  code: "text-blue-400",
  build: "text-violet-400",
  lock: "text-orange-400",
  error: "text-red-400",
  status: "text-emerald-400",
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
  const brainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (brainRef.current) {
      brainRef.current.scrollTop = brainRef.current.scrollHeight;
    }
  }, [brainLogs.length]);

  if (!project || !run) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-500">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading run...
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
  const currentStageIdx = STAGE_KEYS.indexOf(run.status);

  const busyAgents = runAgents.filter((a) =>
    ["planning", "coding", "building", "testing", "pushing"].includes(a.status),
  ).length;
  const doneAgents = runAgents.filter((a) => a.status === "completed").length;

  const elapsed = run.completed_at
    ? Math.round((new Date(run.completed_at).getTime() - new Date(run.created_at).getTime()) / 1000)
    : Math.round((Date.now() - new Date(run.created_at).getTime()) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  const onStop = async () => {
    try {
      await stopOrchestration.mutateAsync(run.id);
      toast.success("Orchestration stopped");
    } catch {
      toast.error("Failed to stop");
    }
  };

  const awaitingApproval = run.status === "awaiting_approval";

  const onApprove = async () => {
    try {
      await approveOrchestration.mutateAsync(run.id);
      toast.success("Plan approved — deploying the team");
    } catch {
      toast.error("Failed to approve");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/projects/${projectId}`}>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">{project.name}</h1>
            <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
              <span>Run #{run.id.slice(0, 8)}</span>
              <span className="capitalize">{run.mode} mode</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {mins}m {secs}s
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isFailed ? (
            <span className="flex items-center gap-1.5 text-sm font-medium text-red-400">
              <XCircle className="h-4 w-4" /> Failed
            </span>
          ) : run.status === "completed" ? (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-400">
              <CheckCircle className="h-4 w-4" /> Completed
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-sm font-medium text-blue-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              {run.status.replace(/_/g, " ")}
            </span>
          )}
          {isActive && (
            <Button variant="destructive" size="sm" onClick={onStop}>
              <Square className="h-3.5 w-3.5 mr-1" /> Stop
            </Button>
          )}
        </div>
      </div>

      {/* Plan-approval gate — shows the FULL plan right here, next to Approve */}
      {awaitingApproval && (
        <div className="rounded-xl border border-amber-600/50 bg-amber-950/30 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                <Clock className="h-4 w-4" /> Plan ready — your approval needed
              </h2>
              <p className="mt-1 text-xs text-amber-200/70">
                {runAgents.length} agent{runAgents.length === 1 ? "" : "s"} will work in parallel on
                disjoint files. Review the plan below. <strong>Nothing is changed until you approve.</strong>
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

          {/* The plan itself: each agent + the file changes it will make */}
          <div className="mt-3 max-h-96 space-y-2 overflow-y-auto">
            {runAgents.map((agent, idx) => {
              const task = agentTaskMap[agent.id];
              const steps = (task?.target_files as Record<string, unknown> | undefined)?.steps as
                | Array<{ file_path: string; action: string; description: string }>
                | undefined;
              return (
                <div key={agent.id} className="rounded-lg border border-amber-900/30 bg-zinc-900/50 p-2.5">
                  <p className="mb-1 text-xs font-semibold text-amber-200">
                    {idx + 1}. {agent.name}
                  </p>
                  {steps && steps.length > 0 ? (
                    <ul className="space-y-1.5">
                      {steps.map((s, i) => (
                        <li key={i} className="text-[11px] leading-relaxed text-zinc-400">
                          <span className={cn(
                            "mr-1.5 rounded px-1 py-0.5 text-[9px] font-bold uppercase",
                            s.action === "create" ? "bg-emerald-500/20 text-emerald-300" :
                            s.action === "delete" ? "bg-red-500/20 text-red-300" :
                            "bg-blue-500/20 text-blue-300",
                          )}>
                            {s.action}
                          </span>
                          <span className="font-mono text-zinc-300">{s.file_path}</span>
                          <span className="text-zinc-500"> — {s.description}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-zinc-600">Generating plan…</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pipeline Progress */}
      <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
        <div className="flex items-center gap-0.5">
          {PIPELINE.map((stage, i) => {
            const reached = currentStageIdx >= i && currentStageIdx >= 0;
            const isCurrent = run.status === stage.key;
            return (
              <div key={stage.key} className="flex items-center flex-1">
                <div
                  className={cn(
                    "flex flex-col items-center gap-1.5 flex-1 rounded-lg py-2.5 px-1 text-center transition-all",
                    isCurrent
                      ? "bg-blue-950/80 ring-1 ring-blue-500/40"
                      : reached
                      ? "bg-zinc-800/50"
                      : "bg-transparent",
                  )}
                >
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full transition-colors",
                      isCurrent
                        ? "bg-blue-400 shadow-lg shadow-blue-400/40"
                        : reached
                        ? "bg-emerald-500"
                        : "bg-zinc-700",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-medium",
                      isCurrent ? "text-blue-300" : reached ? "text-zinc-400" : "text-zinc-600",
                    )}
                  >
                    {stage.label}
                  </span>
                </div>
                {i < PIPELINE.length - 1 && (
                  <div className={cn("h-px w-4 shrink-0", reached ? "bg-emerald-800" : "bg-zinc-800")} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Deployed Agents Grid */}
      {runAgents.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-400" />
              {awaitingApproval ? `Proposed Plan — ${runAgents.length} agent${runAgents.length === 1 ? "" : "s"}` : `Deployed Agents (${runAgents.length})`}
            </h2>
            <span className="text-xs text-zinc-500">
              {busyAgents} working · {doneAgents} done
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {runAgents.map((agent, i) => (
              <AgentRunCard
                key={agent.id}
                agent={agent}
                task={agentTaskMap[agent.id]}
                colorIndex={i}
                showPlan={awaitingApproval}
              />
            ))}
          </div>
        </div>
      )}

      {/* Brain Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <Brain className="h-4 w-4 text-amber-400" />
            Orchestrator Brain
          </h2>
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", connected ? "bg-emerald-400" : "bg-zinc-600")} />
            <span className="text-[10px] text-zinc-500">{connected ? "Live" : "Disconnected"}</span>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden">
          <div
            ref={brainRef}
            className="max-h-80 overflow-y-auto p-4 font-mono text-xs space-y-1"
          >
            {brainLogs.length === 0 ? (
              <p className="text-zinc-700">Waiting for orchestrator activity...</p>
            ) : (
              brainLogs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-zinc-600 shrink-0">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 uppercase font-bold w-14",
                      brainLogColors[log.log_type] || "text-zinc-500",
                    )}
                  >
                    [{log.log_type}]
                  </span>
                  <span className="text-zinc-300 whitespace-pre-wrap break-all">{log.content}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {run.error_message && (
        <div className="rounded-xl bg-red-950/30 border border-red-900/50 p-4 text-sm text-red-300">
          <p className="font-medium mb-1">Error</p>
          {run.error_message}
        </div>
      )}

      {/* PR Link */}
      {run.result_pr_url && (
        <a href={run.result_pr_url} target="_blank" rel="noopener noreferrer">
          <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-emerald-300 hover:bg-emerald-950/50 transition-colors cursor-pointer">
            <GitPullRequest className="h-5 w-5" />
            <span className="font-medium">View Integrated Pull Request</span>
            <ExternalLink className="h-4 w-4" />
          </div>
        </a>
      )}
    </div>
  );
}
