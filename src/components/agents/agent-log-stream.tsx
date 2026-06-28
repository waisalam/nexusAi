"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { AgentLogEntry } from "@/types/agent";

interface AgentLogStreamProps {
  logs: AgentLogEntry[];
  connected: boolean;
}

const logTypeColors: Record<string, string> = {
  plan: "text-yellow-400",
  code: "text-blue-400",
  build: "text-purple-400",
  test: "text-cyan-400",
  error: "text-red-400",
  lock: "text-orange-400",
  message: "text-gray-400",
};

export function AgentLogStream({ logs, connected }: AgentLogStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800">
        <div className={cn("h-2 w-2 rounded-full", connected ? "bg-green-400" : "bg-gray-600")} />
        <span className="text-xs text-gray-500">
          {connected ? "Live" : "Disconnected"} — {logs.length} entries
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1">
        {logs.length === 0 ? (
          <p className="text-gray-600">Waiting for agent activity...</p>
        ) : (
          logs.map((log, i) => (
            <div key={log.id || i} className="flex gap-2">
              <span className="text-gray-600 shrink-0">
                {new Date(log.created_at).toLocaleTimeString()}
              </span>
              <span className={cn("shrink-0 w-12 uppercase font-bold", logTypeColors[log.log_type] || "text-gray-400")}>
                [{log.log_type}]
              </span>
              <span className="text-gray-300 whitespace-pre-wrap break-all">{log.content}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
