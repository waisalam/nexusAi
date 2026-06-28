"use client";

import { Lock, Unlock, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ActiveLock } from "@/hooks/use-locks";

interface FileLockPanelProps {
  locks: ActiveLock[];
}

export function FileLockPanel({ locks }: FileLockPanelProps) {
  if (locks.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Unlock className="h-4 w-4 text-green-400" />
            File Locks (0)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No files are currently locked. All files available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Lock className="h-4 w-4 text-yellow-400" />
          Active Locks ({locks.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {locks.map((lock, i) => (
          <div
            key={`${lock.file_path}-${i}`}
            className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-mono text-yellow-300 truncate">{lock.file_path}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Held by <span className="text-blue-400 font-medium">{lock.agent_name}</span>
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0 ml-3">
              <Clock className="h-3 w-3" />
              <span>{lock.ttl_remaining}s left</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
