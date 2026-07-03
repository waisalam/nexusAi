"use client";

import { useRef, useEffect } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgentLogs } from "@/hooks/use-agents";
import type { AgentResponse, TaskResponse } from "@/types/agent";

const BUSY = ["planning", "coding", "building", "testing", "pushing"];

const logColors: Record<string, string> = {
  plan: "text-amber-600",
  code: "text-blue-600",
  build: "text-accent",
  lock: "text-orange-600",
  error: "text-destructive",
};

const BORDER_COLORS = [
  "border-l-blue-500",
  "border-l-emerald-500",
  "border-l-emerald-500",
  "border-l-rose-500",
  "border-l-cyan-500",
  "border-l-amber-500",
  "border-l-pink-500",
  "border-l-teal-500",
];

interface PlanStep {
  file_path: string;
  action: string;
  description: string;
}

interface AgentRunCardProps {
  agent: AgentResponse;
  task?: TaskResponse;
  colorIndex: number;
  showPlan?: boolean;
}

export function AgentRunCard({ agent, task, colorIndex, showPlan = false }: AgentRunCardProps) {
  const { data: logs } = useAgentLogs(agent.id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const borderColor = BORDER_COLORS[colorIndex % BORDER_COLORS.length];

  const recentLogs = (logs || []).slice(-15);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [recentLogs.length]);

  const statusIcon = BUSY.includes(agent.status)
    ? <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
    : agent.status === "completed"
    ? <CheckCircle className="h-3.5 w-3.5 text-accent" />
    : agent.status === "error"
    ? <XCircle className="h-3.5 w-3.5 text-destructive" />
    : <div className="h-3.5 w-3.5 rounded-full bg-surface-2" />;

  const files = (task?.target_files as Record<string, unknown>)?.files as string[] | undefined;
  const steps = (task?.target_files as Record<string, unknown>)?.steps as PlanStep[] | undefined;
  const planMode = showPlan && !!steps && steps.length > 0;

  return (
    <div className={cn(
      "rounded-lg border border-border bg-surface overflow-hidden border-l-2",
      borderColor,
    )}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          {statusIcon}
          <span className="text-sm font-semibold text-foreground truncate">{agent.name}</span>
        </div>
        <span className={cn(
          "text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
          BUSY.includes(agent.status) ? "bg-blue-600/15 text-blue-600" :
          agent.status === "completed" ? "bg-accent/15 text-accent" :
          agent.status === "error" ? "bg-destructive/15 text-destructive" :
          "bg-surface-2 text-muted-foreground",
        )}>
          {agent.status}
        </span>
      </div>

      {task && (
        <div className="px-3 py-1.5 border-b border-border">
          <p className="text-[11px] text-muted-foreground truncate">{task.title}</p>
          {files && files.length > 0 && (
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
              {files.length} file(s): {files.slice(0, 3).join(", ")}{files.length > 3 ? "..." : ""}
            </p>
          )}
        </div>
      )}

      {planMode ? (
        <div className="max-h-64 overflow-y-auto px-3 py-2 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Planned changes ({steps!.length})
          </p>
          {steps!.map((s, i) => (
            <div key={i} className="rounded border border-border bg-surface p-2">
              <div className="mb-0.5 flex items-center gap-1.5">
                <span className={cn(
                  "rounded px-1 py-0.5 text-[9px] font-bold uppercase",
                  s.action === "create" ? "bg-accent/15 text-accent" :
                  s.action === "delete" ? "bg-destructive/15 text-destructive" :
                  "bg-blue-600/15 text-blue-600",
                )}>
                  {s.action}
                </span>
                <span className="truncate font-mono text-[11px] text-foreground">{s.file_path}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div ref={scrollRef} className="max-h-36 overflow-y-auto px-3 py-2 font-mono text-[10px] leading-relaxed space-y-0.5">
          {recentLogs.length === 0 ? (
            <p className="text-muted-foreground">Waiting...</p>
          ) : (
            recentLogs.map((log, i) => (
              <div key={log.id || i} className="flex gap-1.5">
                <span className="text-muted-foreground shrink-0">
                  {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className={cn("shrink-0", logColors[log.log_type] || "text-muted-foreground")}>
                  [{log.log_type}]
                </span>
                <span className="text-muted-foreground break-all">
                  {log.content.replace(`[${agent.name}] `, "")}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
