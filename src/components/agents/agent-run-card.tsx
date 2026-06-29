"use client";

import { useRef, useEffect } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgentLogs } from "@/hooks/use-agents";
import type { AgentResponse, TaskResponse } from "@/types/agent";

const BUSY = ["planning", "coding", "building", "testing", "pushing"];

const logColors: Record<string, string> = {
  plan: "text-amber-400",
  code: "text-blue-400",
  build: "text-violet-400",
  lock: "text-orange-400",
  error: "text-red-400",
};

const BORDER_COLORS = [
  "border-l-blue-500",
  "border-l-violet-500",
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
    ? <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
    : agent.status === "completed"
    ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
    : agent.status === "error"
    ? <XCircle className="h-3.5 w-3.5 text-red-400" />
    : <div className="h-3.5 w-3.5 rounded-full bg-zinc-600" />;

  const files = (task?.target_files as Record<string, unknown>)?.files as string[] | undefined;
  const steps = (task?.target_files as Record<string, unknown>)?.steps as PlanStep[] | undefined;
  const planMode = showPlan && !!steps && steps.length > 0;

  return (
    <div className={cn(
      "rounded-lg border border-zinc-800 bg-zinc-900/60 overflow-hidden border-l-2",
      borderColor,
    )}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/50">
        <div className="flex items-center gap-2 min-w-0">
          {statusIcon}
          <span className="text-sm font-semibold text-zinc-100 truncate">{agent.name}</span>
        </div>
        <span className={cn(
          "text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
          BUSY.includes(agent.status) ? "bg-blue-500/20 text-blue-300" :
          agent.status === "completed" ? "bg-emerald-500/20 text-emerald-300" :
          agent.status === "error" ? "bg-red-500/20 text-red-300" :
          "bg-zinc-700 text-zinc-400",
        )}>
          {agent.status}
        </span>
      </div>

      {task && (
        <div className="px-3 py-1.5 border-b border-zinc-800/30">
          <p className="text-[11px] text-zinc-400 truncate">{task.title}</p>
          {files && files.length > 0 && (
            <p className="text-[10px] text-zinc-600 truncate mt-0.5">
              {files.length} file(s): {files.slice(0, 3).join(", ")}{files.length > 3 ? "..." : ""}
            </p>
          )}
        </div>
      )}

      {planMode ? (
        <div className="max-h-64 overflow-y-auto px-3 py-2 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Planned changes ({steps!.length})
          </p>
          {steps!.map((s, i) => (
            <div key={i} className="rounded border border-zinc-800 bg-zinc-900/50 p-2">
              <div className="mb-0.5 flex items-center gap-1.5">
                <span className={cn(
                  "rounded px-1 py-0.5 text-[9px] font-bold uppercase",
                  s.action === "create" ? "bg-emerald-500/20 text-emerald-300" :
                  s.action === "delete" ? "bg-red-500/20 text-red-300" :
                  "bg-blue-500/20 text-blue-300",
                )}>
                  {s.action}
                </span>
                <span className="truncate font-mono text-[11px] text-zinc-300">{s.file_path}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-400">{s.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div ref={scrollRef} className="max-h-36 overflow-y-auto px-3 py-2 font-mono text-[10px] leading-relaxed space-y-0.5">
          {recentLogs.length === 0 ? (
            <p className="text-zinc-700">Waiting...</p>
          ) : (
            recentLogs.map((log, i) => (
              <div key={log.id || i} className="flex gap-1.5">
                <span className="text-zinc-700 shrink-0">
                  {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className={cn("shrink-0", logColors[log.log_type] || "text-zinc-500")}>
                  [{log.log_type}]
                </span>
                <span className="text-zinc-400 break-all">
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
