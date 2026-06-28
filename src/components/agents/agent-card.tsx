"use client";

import { Bot, Loader2, CheckCircle, AlertCircle, Pause } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AgentResponse } from "@/types/agent";

interface AgentCardProps {
  agent: AgentResponse;
  selected: boolean;
  onClick: () => void;
}

const statusIcons: Record<string, React.ReactNode> = {
  idle: <Pause className="h-4 w-4 text-zinc-400" />,
  planning: <Loader2 className="h-4 w-4 text-amber-400 animate-spin" />,
  coding: <Loader2 className="h-4 w-4 text-red-400 animate-spin" />,
  building: <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />,
  testing: <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />,
  pushing: <Loader2 className="h-4 w-4 text-green-400 animate-spin" />,
  completed: <CheckCircle className="h-4 w-4 text-green-400" />,
  error: <AlertCircle className="h-4 w-4 text-red-400" />,
};

const statusColors: Record<string, "default" | "active" | "paused" | "archived"> = {
  idle: "default",
  planning: "paused",
  coding: "active",
  building: "active",
  testing: "active",
  pushing: "active",
  completed: "active",
  error: "archived",
};

export function AgentCard({ agent, selected, onClick }: AgentCardProps) {
  const tokens = agent.token_usage?.total_tokens || 0;

  return (
    <Card
      className={`cursor-pointer transition-all ${selected ? "border-red-600/70 bg-red-950/20" : "hover:border-zinc-700"}`}
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
          <Bot className="h-5 w-5 text-red-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{agent.name}</span>
            <Badge variant={statusColors[agent.status] || "default"}>
              <span className="flex items-center gap-1">
                {statusIcons[agent.status]}
                {agent.status}
              </span>
            </Badge>
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
            {agent.work_branch && <span className="truncate">branch: {agent.work_branch}</span>}
            {tokens > 0 && <span>{tokens.toLocaleString()} tokens</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
