"use client";

import { Bot, Loader2, Pause, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AgentResponse } from "@/types/agent";
import type { ActiveLock } from "@/hooks/use-locks";

interface LiveAgentMapProps {
  agents: AgentResponse[];
  locks: ActiveLock[];
}

const BUSY = ["planning", "coding", "building", "testing", "pushing"];

const statusIcon = (status: string) => {
  if (BUSY.includes(status)) return <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-300" />;
  if (status === "completed") return <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />;
  if (status === "error") return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
  return <Pause className="h-3.5 w-3.5 text-zinc-500" />;
};

// Stable color per agent so the same agent is the same color across files.
const AGENT_COLORS = [
  "text-indigo-300", "text-orange-300", "text-amber-300", "text-pink-300",
  "text-rose-300", "text-fuchsia-300", "text-violet-300", "text-cyan-300",
];

export function LiveAgentMap({ agents, locks }: LiveAgentMapProps) {
  const workers = agents.filter((a) => a.name !== "Fixer (Orchestrator)");
  const busyCount = workers.filter((a) => BUSY.includes(a.status)).length;

  const colorFor = (agentId: string) => {
    const idx = workers.findIndex((a) => a.id === agentId);
    return AGENT_COLORS[idx % AGENT_COLORS.length] || "text-zinc-300";
  };

  return (
    <Card className="animate-scale-in border-indigo-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-400" />
          </span>
          <Bot className="h-4 w-4 text-indigo-400" />
          Live Agent Map
          <span className="ml-auto text-xs font-normal text-zinc-400">
            {busyCount} working simultaneously
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Agents row */}
        <div className="flex flex-wrap gap-2">
          {workers.length === 0 ? (
            <p className="text-sm text-zinc-500">No agents yet.</p>
          ) : (
            workers.map((a) => (
              <div key={a.id} className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5">
                {statusIcon(a.status)}
                <span className={cn("text-xs font-semibold", colorFor(a.id))}>{a.name}</span>
                <span className="text-[10px] text-zinc-500">{a.status}</span>
              </div>
            ))
          )}
        </div>

        {/* File ownership map — each file shows exactly one owning agent */}
        <div>
          <p className="mb-1 text-xs text-zinc-500">File ownership (conflict-free)</p>
          {locks.length === 0 ? (
            <p className="text-xs text-zinc-600">No files locked right now.</p>
          ) : (
            <div className="space-y-1">
              {locks.map((lock, i) => (
                <div key={`${lock.file_path}-${i}`} className="flex items-center justify-between text-xs">
                  <span className="truncate font-mono text-zinc-400">{lock.file_path}</span>
                  <span className={cn("ml-2 shrink-0 font-semibold", colorFor(lock.agent_id))}>
                    {lock.agent_name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
