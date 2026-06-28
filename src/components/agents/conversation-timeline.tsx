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
  lock_request: { border: "border-l-yellow-500", label: "requests access", chip: "bg-yellow-950 text-yellow-300" },
  lock_response: { border: "border-l-green-500", label: "responds", chip: "bg-green-950 text-green-300" },
  coordination: { border: "border-l-blue-500", label: "coordinates", chip: "bg-blue-950 text-blue-300" },
  status_update: { border: "border-l-gray-500", label: "status", chip: "bg-gray-800 text-gray-300" },
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
          <MessagesSquare className="h-4 w-4 text-blue-400" />
          Agent Conversations ({messages.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-80 overflow-y-auto space-y-2">
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500">
              No agent conversations yet. When two agents need the same file, they&apos;ll negotiate here.
            </p>
          ) : (
            messages.map((msg) => {
              const style = typeStyles[msg.message_type] || typeStyles.status_update;
              return (
                <div
                  key={msg.id}
                  className={cn("rounded-lg border border-gray-800 border-l-2 bg-gray-900/50 p-3", style.border)}
                >
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span className="font-semibold text-blue-300">{msg.from_agent_name}</span>
                    <ArrowRight className="h-3 w-3 text-gray-600" />
                    <span className="font-semibold text-purple-300">{msg.to_agent_name || "everyone"}</span>
                    <span className={cn("ml-auto rounded px-1.5 py-0.5 text-[10px]", style.chip)}>{style.label}</span>
                  </div>
                  <p className="text-sm text-gray-200">{msg.text}</p>
                  {msg.payload && typeof msg.payload.file_path === "string" && (
                    <p className="text-[11px] font-mono text-gray-500 mt-1">📄 {msg.payload.file_path as string}</p>
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
