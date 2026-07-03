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
  if (BUSY.includes(status)) return <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />;
  if (status === "completed") return <CheckCircle className="h-3.5 w-3.5 text-accent" />;
  if (status === "error") return <AlertCircle className="h-3.5 w-3.5 text-destructive" />;
  return <Pause className="h-3.5 w-3.5 text-muted-foreground" />;
};

// Stable color per agent (a small distinguishing palette, not the brand accent)
// so the same agent reads as the same color across files.
const AGENT_COLORS = [
  "text-accent", "text-orange-500", "text-amber-500", "text-pink-500",
  "text-rose-500", "text-teal-500", "text-sky-500", "text-cyan-500",
];

export function LiveAgentMap({ agents, locks }: LiveAgentMapProps) {
  const workers = agents.filter((a) => a.name !== "Fixer (Orchestrator)");
  const busyCount = workers.filter((a) => BUSY.includes(a.status)).length;

  const colorFor = (agentId: string) => {
    const idx = workers.findIndex((a) => a.id === agentId);
    return AGENT_COLORS[idx % AGENT_COLORS.length] || "text-foreground";
  };

  return (
    <Card className="animate-scale-in border-accent/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <Bot className="h-4 w-4 text-accent" />
          Live Agent Map
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {busyCount} working simultaneously
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Agents row */}
        <div className="flex flex-wrap gap-2">
          {workers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No agents yet.</p>
          ) : (
            workers.map((a) => (
              <div key={a.id} className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5">
                {statusIcon(a.status)}
                <span className={cn("text-xs font-semibold", colorFor(a.id))}>{a.name}</span>
                <span className="text-[10px] text-muted-foreground">{a.status}</span>
              </div>
            ))
          )}
        </div>

        {/* File ownership map — each file shows exactly one owning agent */}
        <div>
          <p className="mb-1 text-xs text-muted-foreground">File ownership (conflict-free)</p>
          {locks.length === 0 ? (
            <p className="text-xs text-muted-foreground">No files locked right now.</p>
          ) : (
            <div className="space-y-1">
              {locks.map((lock, i) => (
                <div key={`${lock.file_path}-${i}`} className="flex items-center justify-between text-xs">
                  <span className="truncate font-mono text-muted-foreground">{lock.file_path}</span>
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
