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
  plan: "text-yellow-400",
  code: "text-blue-400",
  build: "text-purple-400",
  lock: "text-orange-400",
  error: "text-red-400",
  status: "text-green-400",
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
    <Card className="border-blue-900/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-400" />
            Orchestrator — One Brain Watching All Agents
          </CardTitle>
          <div className="flex items-center gap-2">
            {isFailed ? (
              <span className="flex items-center gap-1 text-xs text-red-400"><XCircle className="h-3.5 w-3.5" /> Failed</span>
            ) : run.status === "completed" ? (
              <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle className="h-3.5 w-3.5" /> Completed</span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-blue-400"><Loader2 className="h-3.5 w-3.5 animate-spin" /> {run.status}</span>
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
                  isCurrent ? "bg-blue-950 border border-blue-700" : reached ? "bg-gray-800" : "bg-gray-900/50"
                )}>
                  <stage.icon className={cn("h-4 w-4", isCurrent ? "text-blue-400" : reached ? "text-green-400" : "text-gray-600")} />
                  <span className={cn("text-[10px] leading-tight", isCurrent ? "text-blue-300" : reached ? "text-gray-300" : "text-gray-600")}>
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
          <div className="rounded-md bg-red-950/50 border border-red-900 p-2 text-xs text-red-300">
            {run.error_message}
          </div>
        )}

        {/* Live brain logs */}
        <div className="rounded-lg border border-gray-800 bg-gray-950">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-800">
            <div className={cn("h-2 w-2 rounded-full", connected ? "bg-green-400" : "bg-gray-600")} />
            <span className="text-xs text-gray-500">Orchestrator activity</span>
          </div>
          <div className="max-h-64 overflow-y-auto p-3 font-mono text-xs space-y-1">
            {logs.length === 0 ? (
              <p className="text-gray-600">Waiting for orchestrator...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-gray-600 shrink-0">{new Date(log.created_at).toLocaleTimeString()}</span>
                  <span className={cn("shrink-0 uppercase font-bold w-14", logColors[log.log_type] || "text-gray-400")}>[{log.log_type}]</span>
                  <span className="text-gray-300 whitespace-pre-wrap break-all">{log.content}</span>
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
