"use client";

import { Bot, Loader2, CheckCircle, AlertCircle, Pause } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AgentResponse } from "@/types/agent";

interface AgentCardProps {
  agent: AgentResponse;
  selected?: boolean;
  onClick?: () => void;
}

const statusIcons: Record<string, React.ReactNode> = {
  idle: <Pause className="h-4 w-4 text-muted-foreground" />,
  planning: <Loader2 className="h-4 w-4 text-amber-600 animate-spin" />,
  coding: <Loader2 className="h-4 w-4 text-accent animate-spin" />,
  building: <Loader2 className="h-4 w-4 text-purple-600 animate-spin" />,
  testing: <Loader2 className="h-4 w-4 text-cyan-600 animate-spin" />,
  pushing: <Loader2 className="h-4 w-4 text-accent animate-spin" />,
  completed: <CheckCircle className="h-4 w-4 text-accent" />,
  error: <AlertCircle className="h-4 w-4 text-destructive" />,
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
      className={`transition-all ${onClick ? "cursor-pointer" : ""} ${selected ? "border-accent/60 bg-accent/10" : "hover:border-muted-foreground"}`}
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface">
          <Bot className="h-5 w-5 text-accent" />
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
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            {agent.work_branch && <span className="truncate">branch: {agent.work_branch}</span>}
            {tokens > 0 && <span>{tokens.toLocaleString()} tokens</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
