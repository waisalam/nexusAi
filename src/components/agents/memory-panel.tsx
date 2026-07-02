"use client";

import { useState } from "react";
import { Brain, Lightbulb, AlertTriangle, Wrench, History, ChevronDown, ChevronUp, Globe } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useProjectMemory, useGlobalLearnings } from "@/hooks/use-memory";
import type { Lesson, Snapshot } from "@/hooks/use-memory";

interface MemoryPanelProps {
  projectId: string;
}

export function MemoryPanel({ projectId }: MemoryPanelProps) {
  const { data: memory } = useProjectMemory(projectId);
  const { data: globalStats } = useGlobalLearnings();
  const [expandedSection, setExpandedSection] = useState<string | null>("lessons");

  if (!memory) {
    return (
      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-indigo-300 animate-pulse" />
            AI Memory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">Loading memory...</p>
        </CardContent>
      </Card>
    );
  }

  const hasContent = memory.total_lessons > 0 || memory.total_errors > 0 ||
    memory.total_fixes > 0 || memory.total_snapshots > 0;

  const toggle = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  return (
    <Card className="border-zinc-800 bg-zinc-950">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-indigo-300" />
            AI Memory
          </span>
          <div className="flex gap-2">
            <Badge variant="default" className="border-indigo-500/40 text-indigo-300 text-xs">
              {memory.total_lessons} lessons
            </Badge>
            <Badge variant="default" className="border-zinc-700 text-zinc-400 text-xs">
              {memory.total_edits} edits
            </Badge>
            <Badge variant="default" className="border-zinc-700 text-zinc-400 text-xs">
              {memory.total_fixes} fixes
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {!hasContent ? (
          <p className="text-sm text-zinc-500">
            No memory yet. Run agents on this project and they will learn from their mistakes.
          </p>
        ) : (
          <>
            {/* Lessons */}
            {memory.lessons.length > 0 && (
              <SectionToggle
                title="Lessons Learned"
                icon={<Lightbulb className="h-3.5 w-3.5 text-amber-400" />}
                count={memory.lessons.length}
                isOpen={expandedSection === "lessons"}
                onToggle={() => toggle("lessons")}
              >
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {memory.lessons.map((lesson, i) => (
                    <LessonCard key={i} lesson={lesson} />
                  ))}
                </div>
              </SectionToggle>
            )}

            {/* Recent Errors */}
            {memory.recent_errors.length > 0 && (
              <SectionToggle
                title="Recent Errors"
                icon={<AlertTriangle className="h-3.5 w-3.5 text-red-400" />}
                count={memory.recent_errors.length}
                isOpen={expandedSection === "errors"}
                onToggle={() => toggle("errors")}
              >
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {memory.recent_errors.map((err, i) => (
                    <div key={i} className="rounded border border-red-900/30 bg-red-950/20 p-2">
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                        <span className="text-red-400 font-medium">{err.agent}</span>
                        <span>{err.command}</span>
                      </div>
                      <p className="text-xs text-zinc-500 font-mono line-clamp-2">{err.error}</p>
                    </div>
                  ))}
                </div>
              </SectionToggle>
            )}

            {/* Recent Fixes */}
            {memory.recent_fixes.length > 0 && (
              <SectionToggle
                title="Recent Fixes"
                icon={<Wrench className="h-3.5 w-3.5 text-green-400" />}
                count={memory.recent_fixes.length}
                isOpen={expandedSection === "fixes"}
                onToggle={() => toggle("fixes")}
              >
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {memory.recent_fixes.map((fix, i) => (
                    <div key={i} className="rounded border border-green-900/30 bg-green-950/20 p-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-green-400 font-medium">{fix.agent}</span>
                        <span className="text-zinc-500">{fix.file}</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">{fix.description}</p>
                    </div>
                  ))}
                </div>
              </SectionToggle>
            )}

            {/* Snapshots */}
            {memory.recent_snapshots.length > 0 && (
              <SectionToggle
                title="Change History"
                icon={<History className="h-3.5 w-3.5 text-blue-400" />}
                count={memory.recent_snapshots.length}
                isOpen={expandedSection === "snapshots"}
                onToggle={() => toggle("snapshots")}
              >
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {memory.recent_snapshots.map((snap, i) => (
                    <SnapshotCard key={i} snapshot={snap} />
                  ))}
                </div>
              </SectionToggle>
            )}

            {/* Global Learnings */}
            {globalStats && globalStats.total_learnings > 0 && (
              <SectionToggle
                title="Global Knowledge"
                icon={<Globe className="h-3.5 w-3.5 text-purple-400" />}
                count={globalStats.total_learnings}
                isOpen={expandedSection === "global"}
                onToggle={() => toggle("global")}
              >
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {globalStats.learnings.slice(-10).map((g, i) => (
                    <div key={i} className="rounded border border-purple-900/30 bg-purple-950/20 p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="default" className="border-purple-800 text-purple-300 text-[10px] px-1.5 py-0">
                          {g.category}
                        </Badge>
                        {g.hit_count > 1 && (
                          <span className="text-[10px] text-zinc-500">seen {g.hit_count}x</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-300">{g.pattern}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{g.solution}</p>
                    </div>
                  ))}
                </div>
              </SectionToggle>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}


function SectionToggle({
  title, icon, count, isOpen, onToggle, children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-900/50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm text-zinc-300">
          {icon}
          {title}
          <span className="text-zinc-600">({count})</span>
        </span>
        {isOpen ? (
          <ChevronUp className="h-3.5 w-3.5 text-zinc-600" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-zinc-600" />
        )}
      </button>
      {isOpen && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}


function LessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <div className="rounded border border-amber-900/30 bg-amber-950/10 p-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {lesson.tags.map((tag) => (
            <Badge
              key={tag}
              variant="default"
              className="border-amber-800/50 text-amber-300 text-[10px] px-1.5 py-0"
            >
              {tag}
            </Badge>
          ))}
        </div>
        {lesson.times_matched > 0 && (
          <span className="text-[10px] text-zinc-500">
            matched {lesson.times_matched}x
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex gap-1.5">
          <span className="text-[10px] text-red-400 font-medium shrink-0 mt-0.5">ERROR</span>
          <p className="text-xs text-zinc-300">{lesson.error_pattern}</p>
        </div>
        <div className="flex gap-1.5">
          <span className="text-[10px] text-amber-400 font-medium shrink-0 mt-0.5">CAUSE</span>
          <p className="text-xs text-zinc-400">{lesson.root_cause}</p>
        </div>
        <div className="flex gap-1.5">
          <span className="text-[10px] text-green-400 font-medium shrink-0 mt-0.5">FIX</span>
          <p className="text-xs text-zinc-400">{lesson.fix_approach}</p>
        </div>
      </div>
      {lesson.files.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {lesson.files.slice(0, 5).map((f) => (
            <span key={f} className="text-[10px] text-zinc-600 bg-zinc-900 rounded px-1.5 py-0.5 font-mono">
              {f}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}


function SnapshotCard({ snapshot }: { snapshot: Snapshot }) {
  return (
    <div className="rounded border border-blue-900/30 bg-blue-950/20 p-2">
      <div className="flex items-center gap-2 text-xs mb-1">
        <span className="text-blue-400 font-medium">{snapshot.agent}</span>
        <span className="text-zinc-500">{snapshot.files.length} file(s)</span>
      </div>
      <p className="text-xs text-zinc-400">{snapshot.summary}</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {snapshot.files.slice(0, 5).map((f, i) => (
          <span key={i} className="text-[10px] text-zinc-600 bg-zinc-900 rounded px-1.5 py-0.5 font-mono">
            {f.file}
          </span>
        ))}
        {snapshot.files.length > 5 && (
          <span className="text-[10px] text-zinc-600">+{snapshot.files.length - 5} more</span>
        )}
      </div>
    </div>
  );
}
