"use client";

import { useEffect, useRef } from "react";
import { Brain, GitMerge, Hammer, Wrench, GitPullRequest, CheckCircle, XCircle, Loader2, ExternalLink, Square } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OrchestrationRun } from "@/hooks/use-orchestrator";
import { useOrchestratorStream } from "@/hooks/use-sse";

const STAGES = [
  { key: "agents_working", label: "Agents Working", icon: Brain },
  { key: "integrating", label: "Integrating Branches", icon: GitMerge },
  { key: "building", label: "Building & Testing", icon: Hammer },
  { key: "fixing", label: "Fixer Active", icon: Wrench },
  { key: "completed", label: "PR Created", icon: GitPullRequest },
];

const STAGE_ORDER = ["pending", "agents_working", "integrating", "building", "fixing", "completed"];

const logColors: Record<string, string> = {
  plan: "text-yellow-600",
  code: "text-blue-600",
  build: "text-purple-600",
  lock: "text-orange-600",
  error: "text-destructive",
  status: "text-accent",
};

interface OrchestratorPanelProps {
  run: OrchestrationRun;
  onStop: (runId: string) => void;
}

export function OrchestratorPanel({ run, onStop }: OrchestratorPanelProps) {
  const { logs, connected } = useOrchestratorStream(run.id);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  const currentIdx = STAGE_ORDER.indexOf(run.status);
  const isActive = !["completed", "failed"].includes(run.status);
  const isFailed = run.status === "failed";

  return (
    <Card className="border-blue-600/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-600" />
            Orchestrator — One Brain Watching All Agents
          </CardTitle>
          <div className="flex items-center gap-2">
            {isFailed ? (
              <span className="flex items-center gap-1 text-xs text-destructive"><XCircle className="h-3.5 w-3.5" /> Failed</span>
            ) : run.status === "completed" ? (
              <span className="flex items-center gap-1 text-xs text-accent"><CheckCircle className="h-3.5 w-3.5" /> Completed</span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-blue-600"><Loader2 className="h-3.5 w-3.5 animate-spin" /> {run.status}</span>
            )}
            {isActive && (
              <Button variant="destructive" size="sm" onClick={() => onStop(run.id)}>
                <Square className="h-3 w-3" /> Stop
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pipeline stages */}
        <div className="flex items-center gap-1">
          {STAGES.map((stage, i) => {
            const stageIdx = STAGE_ORDER.indexOf(stage.key);
            const reached = currentIdx >= stageIdx && currentIdx >= 0;
            const isCurrent = run.status === stage.key;
            return (
              <div key={stage.key} className="flex items-center gap-1 flex-1">
                <div className={cn(
                  "flex flex-col items-center gap-1 flex-1 rounded-lg p-2 text-center transition-colors",
                  isCurrent ? "bg-blue-600/10 border border-blue-600/40" : reached ? "bg-surface-2" : "bg-surface"
                )}>
                  <stage.icon className={cn("h-4 w-4", isCurrent ? "text-blue-600" : reached ? "text-accent" : "text-muted-foreground")} />
                  <span className={cn("text-[10px] leading-tight", isCurrent ? "text-blue-600" : reached ? "text-foreground" : "text-muted-foreground")}>
                    {stage.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Result PR */}
        {run.result_pr_url && (
          <a href={run.result_pr_url} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" size="sm" className="w-full">
              <GitPullRequest className="h-3.5 w-3.5" /> View Integrated PR <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
        )}
        {run.error_message && (
          <div className="rounded-md bg-destructive/10 border border-destructive/30 p-2 text-xs text-destructive">
            {run.error_message}
          </div>
        )}
        {isFailed && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-surface p-2.5 text-xs">
            <span className="text-muted-foreground">
              Nexus AI is still in development — a run hiccup helps us most when you tell us about it.
            </span>
            <button
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("nexus:feedback", {
                    detail: { message: `Demo run failed: ${run.error_message || "(no message)"}\n\nWhat I was trying to build: ` },
                  })
                )
              }
              className="shrink-0 rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 font-medium text-accent transition-colors hover:bg-accent/20"
            >
              Report this
            </button>
          </div>
        )}

        {/* Live brain logs */}
        <div className="rounded-lg border border-border bg-background">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border">
            <div className={cn("h-2 w-2 rounded-full", connected ? "bg-accent" : "bg-muted-foreground")} />
            <span className="text-xs text-muted-foreground">Orchestrator activity</span>
          </div>
          <div className="max-h-64 overflow-y-auto p-3 font-mono text-xs space-y-1">
            {logs.length === 0 ? (
              <p className="text-muted-foreground">Waiting for orchestrator...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-muted-foreground shrink-0">{new Date(log.created_at).toLocaleTimeString()}</span>
                  <span className={cn("shrink-0 uppercase font-bold w-14", logColors[log.log_type] || "text-muted-foreground")}>[{log.log_type}]</span>
                  <span className="text-foreground whitespace-pre-wrap break-all">{log.content}</span>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
