"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Plus, Play, GitBranch, ExternalLink, RotateCcw, Square, Rocket, RefreshCw,
  ListTodo, Bot, ArrowRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentCard } from "@/components/agents/agent-card";
import { AgentLogStream } from "@/components/agents/agent-log-stream";
import { FileLockPanel } from "@/components/agents/file-lock-indicator";
import { OrchestratorPanel } from "@/components/agents/orchestrator-panel";
import { ConversationTimeline } from "@/components/agents/conversation-timeline";
import { LiveAgentMap } from "@/components/agents/live-agent-map";
import { MemoryPanel } from "@/components/agents/memory-panel";
import { useProject, useSyncProject } from "@/hooks/use-projects";
import { useTasks, useCreateTask, useAgents, useCreateAgent, useStopExecution, useAgentLogs } from "@/hooks/use-agents";
import { useAgentStream } from "@/hooks/use-sse";
import { useActiveLocks } from "@/hooks/use-locks";
import { useOrchestrationRuns, useStartOrchestration, useStopOrchestration } from "@/hooks/use-orchestrator";
import { useMessages } from "@/hooks/use-messages";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});
type TaskFormData = z.infer<typeof taskSchema>;

const BUSY_STATUSES = ["planning", "coding", "building", "testing", "pushing"];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const { data: project } = useProject(projectId);
  const syncProject = useSyncProject(projectId);
  const { data: tasksData } = useTasks(projectId);
  const { data: agents } = useAgents(projectId);
  const { data: locksData } = useActiveLocks(projectId);
  const { data: messages } = useMessages(projectId);
  const createTask = useCreateTask(projectId);
  const createAgent = useCreateAgent(projectId);
  const stopExecution = useStopExecution();
  const { data: runs } = useOrchestrationRuns(projectId);
  const startOrchestration = useStartOrchestration(projectId);
  const stopOrchestration = useStopOrchestration();

  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [agentName, setAgentName] = useState("");
  const { logs, connected } = useAgentStream(selectedAgentId);
  const { data: historicalLogs } = useAgentLogs(selectedAgentId || "");

  const displayLogs = logs.length > 0 ? logs : (historicalLogs || []);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const onCreateTask = async (data: TaskFormData) => {
    try {
      await createTask.mutateAsync(data);
      toast.success("Task created");
      reset();
      setShowTaskForm(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create task");
    }
  };

  const onCreateAgent = async (name?: string) => {
    try {
      const agent = await createAgent.mutateAsync(name ? { name } : {});
      setSelectedAgentId(agent.id);
      toast.success(`${agent.name} created`);
      setShowAgentForm(false);
      setAgentName("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create agent");
    }
  };

  const openAgentForm = () => {
    const suggestions = ["Atlas", "Nova", "Orion", "Vega", "Lyra", "Iris", "Echo", "Sol", "Juno", "Sage"];
    const used = new Set((agents || []).map(a => a.name));
    const suggestion = suggestions.find(s => !used.has(s)) || "";
    setAgentName(suggestion);
    setShowAgentForm(true);
  };

  const onStopAgent = async (agentId: string) => {
    try {
      await stopExecution.mutateAsync(agentId);
      toast.success("Agent stopped");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to stop agent");
    }
  };

  // Deploy Team — the orchestrator splits the task and creates the agents itself.
  const onDeployTeam = async () => {
    const pendingTasks = (tasksData?.tasks || []).filter(t => t.status === "pending" || t.status === "failed");
    if (pendingTasks.length === 0) {
      toast.error("Create at least one task first");
      return;
    }
    try {
      const run = await startOrchestration.mutateAsync({ mode: "auto", assignments: {} });
      toast.success("Deploying your AI team — splitting the work across parallel agents");
      router.push(`/dashboard/projects/${projectId}/runs/${run.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to start orchestration");
    }
  };

  // Per-task Play — auto-deploy a team for THIS task and jump to the live run view.
  const onDeployTask = async (taskId: string) => {
    try {
      const run = await startOrchestration.mutateAsync({ mode: "auto", assignments: {}, task_ids: [taskId] });
      toast.success("Deploying your AI team for this task — splitting it across parallel agents");
      router.push(`/dashboard/projects/${projectId}/runs/${run.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to deploy team");
    }
  };

  const onStopRun = async (runId: string) => {
    try {
      await stopOrchestration.mutateAsync(runId);
      toast.success("Orchestration stopped");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to stop");
    }
  };

  const activeRun = runs?.find(r => !["completed", "failed"].includes(r.status)) || runs?.[0];
  const runActive = !!activeRun && !["completed", "failed"].includes(activeRun.status);

  const allTasks = tasksData?.tasks || [];
  const parentTasks = allTasks.filter(t => !t.parent_task_id);
  const childrenOf = (id: string) => allTasks.filter(t => t.parent_task_id === id);
  const visibleAgents = (agents || []).filter(a => a.name !== "Fixer (Orchestrator)");

  const renderTaskRow = (task: typeof allTasks[number], isChild = false) => (
    <div key={task.id} className={cn("flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 transition-colors hover:border-zinc-700", isChild && "ml-4 border-l-2 border-l-red-800/70")}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{isChild && "↳ "}{task.title}</p>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant={task.status === "completed" ? "active" : task.status === "failed" ? "archived" : task.status === "in_progress" ? "paused" : "default"}>
            {task.status}
          </Badge>
          <span className="text-xs text-zinc-500">{task.task_type}</span>
        </div>
        {task.error_message && <p className="mt-1 truncate text-xs text-red-400">{task.error_message}</p>}
      </div>
      <div className="ml-2 flex shrink-0 items-center gap-1">
        {(task.status === "pending" || task.status === "failed") && !isChild && (
          <Button
            variant="ghost"
            size="sm"
            disabled={runActive || startOrchestration.isPending}
            title={task.status === "failed" ? "Retry — deploy an AI team for this task" : "Deploy an AI team for this task"}
            onClick={() => onDeployTask(task.id)}
          >
            {task.status === "failed" ? <RotateCcw className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
        )}
        {task.result_pr_url && (
          <a href={task.result_pr_url} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm"><ExternalLink className="h-3.5 w-3.5" /></Button>
          </a>
        )}
      </div>
    </div>
  );

  if (!project) return <div className="text-zinc-400">Loading project...</div>;

  const hasPendingWork = allTasks.some(t => (t.status === "pending" || t.status === "failed") && !t.parent_task_id);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Project Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button onClick={() => router.push("/dashboard/projects")} className="mb-1.5 flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300">
            ← Projects
          </button>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5" />
              {project.github_repo_owner}/{project.github_repo_name}
            </span>
            <a href={project.github_repo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white">
              <ExternalLink className="h-3.5 w-3.5" /> GitHub
            </a>
            {project.last_synced_sha && (
              <span className="rounded border border-zinc-800 bg-zinc-900/60 px-1.5 py-0.5 font-mono text-xs text-zinc-500" title={`Last synced SHA: ${project.last_synced_sha}`}>
                {project.last_synced_sha.slice(0, 7)}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            onClick={async () => {
              try {
                await syncProject.mutateAsync();
                toast.success("Repo synced — context updated");
              } catch (err: unknown) {
                toast.error(err instanceof Error ? err.message : "Sync failed");
              }
            }}
            disabled={syncProject.isPending}
            title="Pull latest from GitHub and refresh cached context"
          >
            <RefreshCw className={cn("h-4 w-4", syncProject.isPending && "animate-spin")} /> {syncProject.isPending ? "Syncing" : "Sync"}
          </Button>
          <Button variant="outline" onClick={() => setShowTaskForm(!showTaskForm)}>
            <Plus className="h-4 w-4" /> New Task
          </Button>
          <Button variant="primary" onClick={onDeployTeam} disabled={runActive || !hasPendingWork} title="Splits your task into subtasks and deploys a team of agents in parallel → one PR">
            <Rocket className="h-4 w-4" /> Deploy Team
          </Button>
        </div>
      </div>

      {/* How-to hint */}
      <div className="flex items-start gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-4 py-3 text-xs text-zinc-400">
        <Rocket className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
        <p>
          <strong className="text-zinc-200">Deploy Team</strong> breaks your task into subtasks and spawns up to 8 agents that work in parallel on disjoint files, then integrates &amp; build-verifies everything into <strong className="text-zinc-200">one pull request</strong>. The Play (▶) on a task runs a single agent — handy for retrying one subtask.
        </p>
      </div>

      {/* Task Creation Form */}
      {showTaskForm && (
        <Card className="animate-scale-in border-red-900/30">
          <CardHeader>
            <CardTitle>Create Task</CardTitle>
            <CardDescription>Describe what you want your AI team to build — plain English is fine.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onCreateTask)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Title</label>
                <Input placeholder="e.g. Redesign the landing page with a dark theme" {...register("title")} />
                {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Description</label>
                <textarea
                  className="flex min-h-25 w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus-visible:border-red-500/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20"
                  placeholder="Describe the task in detail..."
                  {...register("description")}
                />
                {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Task"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowTaskForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Spawn Agent — name form */}
      {showAgentForm && (
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle>Spawn an Agent</CardTitle>
            <CardDescription>Optional — for running a single task manually. Deploy Team creates its own agents.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-zinc-300">Agent name</label>
                <Input
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g. Nova"
                  onKeyDown={(e) => { if (e.key === "Enter") onCreateAgent(agentName.trim() || undefined); }}
                />
              </div>
              <Button variant="primary" onClick={() => onCreateAgent(agentName.trim() || undefined)}>
                Create
              </Button>
              <Button variant="ghost" onClick={() => setShowAgentForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orchestrator session — link to full run view */}
      {activeRun && (
        <div className="space-y-2">
          <OrchestratorPanel run={activeRun} onStop={onStopRun} />
          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/projects/${projectId}/runs/${activeRun.id}`)}
            >
              Open Full Run View <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Live agent map — who's working on what, in real time */}
      {runActive && <LiveAgentMap agents={agents || []} locks={locksData?.locks || []} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Tasks + Agents + Locks */}
        <div className="space-y-6">
          {/* Tasks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ListTodo className="h-4 w-4 text-red-500" /> Tasks ({tasksData?.total || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {parentTasks.length ? (
                parentTasks.map((task) => (
                  <div key={task.id} className="space-y-2">
                    {renderTaskRow(task)}
                    {childrenOf(task.id).map((child) => renderTaskRow(child, true))}
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-zinc-800 py-8 text-center">
                  <p className="text-sm text-zinc-500">No tasks yet.</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowTaskForm(true)}>
                    <Plus className="h-3.5 w-3.5" /> New Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agents (hide Fixer — it's orchestrator-internal) */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bot className="h-4 w-4 text-red-500" /> Agents ({visibleAgents.length})
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={openAgentForm} title="Spawn an agent (optional)">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {visibleAgents.length ? (
                visibleAgents.map((agent) => (
                  <div key={agent.id} className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <AgentCard
                        agent={agent}
                        selected={selectedAgentId === agent.id}
                        onClick={() => setSelectedAgentId(agent.id)}
                      />
                    </div>
                    {BUSY_STATUSES.includes(agent.status) && (
                      <Button variant="destructive" size="icon" title="Stop agent" onClick={() => onStopAgent(agent.id)}>
                        <Square className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="py-2 text-sm text-zinc-500">No agents yet — Deploy Team creates them automatically.</p>
              )}
            </CardContent>
          </Card>

          {/* File Locks */}
          <FileLockPanel locks={locksData?.locks || []} />

          {/* Agent-to-agent conversation timeline */}
          <ConversationTimeline messages={messages || []} />

          {/* AI Memory */}
          <MemoryPanel projectId={projectId} />
        </div>

        {/* Right Column: Agent Log Stream */}
        <div className="lg:col-span-2">
          <Card className="flex h-175 flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {selectedAgentId
                  ? `Agent Logs — ${visibleAgents.find(a => a.id === selectedAgentId)?.name || "Agent"}`
                  : "Agent Logs"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              {selectedAgentId ? (
                <AgentLogStream logs={displayLogs} connected={connected} />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-zinc-500">
                  <Bot className="h-8 w-8 text-zinc-700" />
                  Select an agent to view its live logs
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
