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
      <Card className="border-border bg-background">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-accent animate-pulse" />
            AI Memory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading memory...</p>
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
    <Card className="border-border bg-background">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-accent" />
            AI Memory
          </span>
          <div className="flex gap-2">
            <Badge variant="default" className="border-accent/40 text-accent text-xs">
              {memory.total_lessons} lessons
            </Badge>
            <Badge variant="default" className="border-border text-muted-foreground text-xs">
              {memory.total_edits} edits
            </Badge>
            <Badge variant="default" className="border-border text-muted-foreground text-xs">
              {memory.total_fixes} fixes
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {!hasContent ? (
          <p className="text-sm text-muted-foreground">
            No memory yet. Run agents on this project and they will learn from their mistakes.
          </p>
        ) : (
          <>
            {/* Lessons */}
            {memory.lessons.length > 0 && (
              <SectionToggle
                title="Lessons Learned"
                icon={<Lightbulb className="h-3.5 w-3.5 text-amber-600" />}
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
                icon={<AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                count={memory.recent_errors.length}
                isOpen={expandedSection === "errors"}
                onToggle={() => toggle("errors")}
              >
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {memory.recent_errors.map((err, i) => (
                    <div key={i} className="rounded border border-destructive/20 bg-destructive/10 p-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <span className="text-destructive font-medium">{err.agent}</span>
                        <span>{err.command}</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono line-clamp-2">{err.error}</p>
                    </div>
                  ))}
                </div>
              </SectionToggle>
            )}

            {/* Recent Fixes */}
            {memory.recent_fixes.length > 0 && (
              <SectionToggle
                title="Recent Fixes"
                icon={<Wrench className="h-3.5 w-3.5 text-accent" />}
                count={memory.recent_fixes.length}
                isOpen={expandedSection === "fixes"}
                onToggle={() => toggle("fixes")}
              >
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {memory.recent_fixes.map((fix, i) => (
                    <div key={i} className="rounded border border-accent/20 bg-accent/10 p-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-accent font-medium">{fix.agent}</span>
                        <span className="text-muted-foreground">{fix.file}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{fix.description}</p>
                    </div>
                  ))}
                </div>
              </SectionToggle>
            )}

            {/* Snapshots */}
            {memory.recent_snapshots.length > 0 && (
              <SectionToggle
                title="Change History"
                icon={<History className="h-3.5 w-3.5 text-blue-600" />}
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
                icon={<Globe className="h-3.5 w-3.5 text-purple-600" />}
                count={globalStats.total_learnings}
                isOpen={expandedSection === "global"}
                onToggle={() => toggle("global")}
              >
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {globalStats.learnings.slice(-10).map((g, i) => (
                    <div key={i} className="rounded border border-purple-900/30 bg-purple-950/20 p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="default" className="border-purple-600/40 text-purple-600 text-[10px] px-1.5 py-0">
                          {g.category}
                        </Badge>
                        {g.hit_count > 1 && (
                          <span className="text-[10px] text-muted-foreground">seen {g.hit_count}x</span>
                        )}
                      </div>
                      <p className="text-xs text-foreground">{g.pattern}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{g.solution}</p>
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
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-surface-2 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm text-foreground">
          {icon}
          {title}
          <span className="text-muted-foreground">({count})</span>
        </span>
        {isOpen ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
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
          <span className="text-[10px] text-muted-foreground">
            matched {lesson.times_matched}x
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex gap-1.5">
          <span className="text-[10px] text-destructive font-medium shrink-0 mt-0.5">ERROR</span>
          <p className="text-xs text-foreground">{lesson.error_pattern}</p>
        </div>
        <div className="flex gap-1.5">
          <span className="text-[10px] text-amber-600 font-medium shrink-0 mt-0.5">CAUSE</span>
          <p className="text-xs text-muted-foreground">{lesson.root_cause}</p>
        </div>
        <div className="flex gap-1.5">
          <span className="text-[10px] text-accent font-medium shrink-0 mt-0.5">FIX</span>
          <p className="text-xs text-muted-foreground">{lesson.fix_approach}</p>
        </div>
      </div>
      {lesson.files.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {lesson.files.slice(0, 5).map((f) => (
            <span key={f} className="text-[10px] text-muted-foreground bg-surface rounded px-1.5 py-0.5 font-mono">
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
        <span className="text-blue-600 font-medium">{snapshot.agent}</span>
        <span className="text-muted-foreground">{snapshot.files.length} file(s)</span>
      </div>
      <p className="text-xs text-muted-foreground">{snapshot.summary}</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {snapshot.files.slice(0, 5).map((f, i) => (
          <span key={i} className="text-[10px] text-muted-foreground bg-surface rounded px-1.5 py-0.5 font-mono">
            {f.file}
          </span>
        ))}
        {snapshot.files.length > 5 && (
          <span className="text-[10px] text-muted-foreground">+{snapshot.files.length - 5} more</span>
        )}
      </div>
    </div>
  );
}
