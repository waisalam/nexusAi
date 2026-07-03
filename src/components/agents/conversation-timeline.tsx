"use client";

import { useEffect, useRef } from "react";
import { MessagesSquare, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AgentMessage } from "@/hooks/use-messages";

interface ConversationTimelineProps {
  messages: AgentMessage[];
}

const typeStyles: Record<string, { border: string; label: string; chip: string }> = {
  lock_request: { border: "border-l-yellow-600", label: "requests access", chip: "bg-yellow-600/10 text-yellow-600" },
  lock_response: { border: "border-l-accent", label: "responds", chip: "bg-accent/10 text-accent" },
  coordination: { border: "border-l-blue-600", label: "coordinates", chip: "bg-blue-600/10 text-blue-600" },
  status_update: { border: "border-l-muted-foreground", label: "status", chip: "bg-surface-2 text-foreground" },
};

export function ConversationTimeline({ messages }: ConversationTimelineProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <MessagesSquare className="h-4 w-4 text-blue-600" />
          Agent Conversations ({messages.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-80 overflow-y-auto space-y-2">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No agent conversations yet. When two agents need the same file, they&apos;ll negotiate here.
            </p>
          ) : (
            messages.map((msg) => {
              const style = typeStyles[msg.message_type] || typeStyles.status_update;
              return (
                <div
                  key={msg.id}
                  className={cn("rounded-lg border border-border border-l-2 bg-surface p-3", style.border)}
                >
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span className="font-semibold text-blue-600">{msg.from_agent_name}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-semibold text-purple-600">{msg.to_agent_name || "everyone"}</span>
                    <span className={cn("ml-auto rounded px-1.5 py-0.5 text-[10px]", style.chip)}>{style.label}</span>
                  </div>
                  <p className="text-sm text-foreground">{msg.text}</p>
                  {msg.payload && typeof msg.payload.file_path === "string" && (
                    <p className="text-[11px] font-mono text-muted-foreground mt-1">📄 {msg.payload.file_path as string}</p>
                  )}
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </CardContent>
    </Card>
  );
}
