"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Box, Check, FolderGit2, GitBranch, Loader2,
  Palette, Plus, Rocket, Users, Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GithubIcon } from "@/components/ui/logo";
import { ScrambleTextOnHover } from "@/components/scramble-text";
import { BitmapChevron } from "@/components/bitmap-chevron";
import { TeamEditor, AGENT_ROLES } from "@/components/studio/team-editor";
import { useAuth } from "@/hooks/use-auth";
import { useProjects } from "@/hooks/use-projects";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

/* Nexus Studio — the self-serve BYOM workspace. Home shows YOUR studio projects
 * (each opens its workspace: brief again, swap agents, past builds). "New project"
 * runs the guided wizard: 01 Create → 02 Team → 03 Repo → 04 Brief. */

interface ProjectResp {
  id: string;
  name: string;
}

const STEPS = ["Create", "Team", "Repo", "Brief"];

const EXAMPLE_BRIEFS = [
  "Build a landing page with pricing and a waitlist form",
  "Add dark mode across the whole app",
  "Create a REST API for user profiles with tests",
];

export default function StudioPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: projectsData, isLoading } = useProjects("studio");

  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(0);
  const [workType, setWorkType] = useState<"software" | "figma" | "3d" | null>(null);
  const [waitlistState, setWaitlistState] = useState<"idle" | "sending" | "done">("idle");

  const [team, setTeam] = useState<Record<string, string>>({});

  const [repoUrl, setRepoUrl] = useState("");
  const [repoName, setRepoName] = useState("");
  const [creatingRepo, setCreatingRepo] = useState(false);
  const [project, setProject] = useState<ProjectResp | null>(null);

  const [brief, setBrief] = useState("");
  const [deploying, setDeploying] = useState(false);

  const studioProjects = projectsData?.projects || [];
  const showWizard = creating || (!isLoading && studioProjects.length === 0);

  const joinWaitlist = async (src: "figma" | "3d") => {
    if (waitlistState !== "idle") return;
    setWaitlistState("sending");
    try {
      await apiClient.post("/api/v1/waitlist", {
        email: user?.email,
        source: src === "figma" ? "figma-mcp" : "3d-mcp",
      });
    } catch { /* tracking call — never block the user */ }
    setWaitlistState("done");
  };

  const connectRepo = async () => {
    if (!repoUrl.trim()) return toast.error("Paste your GitHub repository URL.");
    setCreatingRepo(true);
    try {
      const p = await apiClient.post<ProjectResp>("/api/v1/projects", {
        github_repo_url: repoUrl.trim(),
        name: repoName.trim() || undefined,
        workspace: "studio",
      });
      const routing: Record<string, string> = {};
      for (const r of AGENT_ROLES) routing[r.key] = team[r.key] || "";
      await apiClient.patch(`/api/v1/projects/${p.id}`, { model_routing_json: routing });
      setProject(p);
      setStep(3);
      toast.success("Repository connected — your team is bound to it");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Couldn't connect the repository.");
    } finally {
      setCreatingRepo(false);
    }
  };

  const deploy = async () => {
    if (!project || !brief.trim() || deploying) return;
    setDeploying(true);
    try {
      const task = await apiClient.post<{ id: string }>(`/api/v1/projects/${project.id}/tasks`, {
        title: brief.trim().slice(0, 80),
        description: brief.trim(),
      });
      const run = await apiClient.post<{ id: string }>(`/api/v1/projects/${project.id}/orchestrate`, {
        mode: "auto",
        assignments: {},
        task_ids: [task.id],
      });
      toast.success("Deploying your team…");
      router.push(`/dashboard/projects/${project.id}/runs/${run.id}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Couldn't start the run.");
      setDeploying(false);
    }
  };

  const configuredCount = AGENT_ROLES.filter((r) => (team[r.key] || "").length > 0).length;

  return (
    <div className="mx-auto max-w-5xl">
      {/* ── Editorial header ─────────────────────────────────────────── */}
      <div className="grid-bg relative overflow-hidden rounded-2xl border border-border p-8 sm:p-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">[ Nexus Studio · Your keys · Free ]</p>
        <h1 className="mt-3 font-(family-name:--font-bebas) text-5xl leading-none tracking-wide text-foreground sm:text-6xl">
          Build with your own AI team
        </h1>
        <p className="mt-3 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
          Assemble agents from any models — Claude, GPT, DeepSeek, Kimi — on your own API keys.
          Unlimited runs. You review the PR.
        </p>

        {showWizard && (
          <div className="mt-8 flex items-center gap-1">
            {STEPS.map((label, i) => (
              <div key={label} className={cn("flex items-center", i < STEPS.length - 1 && "flex-1")}>
                <button
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3.5 py-1.5 transition-all",
                    i === step
                      ? "border-accent bg-accent/10"
                      : i < step
                      ? "border-accent/40 bg-surface hover:border-accent"
                      : "border-border bg-surface opacity-50",
                  )}
                >
                  <span className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px]",
                    i < step ? "bg-accent text-accent-foreground" : i === step ? "bg-accent/20 text-accent" : "bg-surface-2 text-muted-foreground",
                  )}>
                    {i < step ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  <span className={cn(
                    "font-mono text-[11px] uppercase tracking-widest",
                    i === step ? "text-accent" : i < step ? "text-foreground" : "text-muted-foreground",
                  )}>
                    {label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={cn("mx-2 h-px flex-1", i < step ? "bg-accent/60" : "bg-border")} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Project list (returning users) ───────────────────────────── */}
      {!showWizard && (
        <div className="animate-fade-up mt-8">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FolderGit2 className="h-4 w-4 text-accent" /> Studio projects ({studioProjects.length})
            </h2>
            <Button variant="primary" onClick={() => { setCreating(true); setStep(0); }}>
              <Plus className="h-4 w-4" /> New project
            </Button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {studioProjects.map((p, i) => (
              <Link key={p.id} href={`/dashboard/studio/${p.id}`}>
                <div
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="animate-fade-up group cursor-pointer rounded-2xl border border-border bg-surface p-5 transition-all hover:border-accent"
                >
                  <div className="flex items-center justify-between">
                    <span className="icon-chip"><GitBranch className="h-4 w-4" /></span>
                    <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {Object.values(p.model_routing_json || {}).filter((v) => v).length}/6 custom
                    </span>
                  </div>
                  <p className="mt-4 font-(family-name:--font-bebas) text-2xl tracking-wide text-foreground">{p.name}</p>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                    {p.github_repo_owner}/{p.github_repo_name}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-accent">
                    <ScrambleTextOnHover text="Open workspace" duration={0.4} />
                    <BitmapChevron className="transition-transform duration-400 group-hover:rotate-45" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 1 · Create ──────────────────────────────────────────── */}
      {showWizard && step === 0 && (
        <div className="animate-fade-up mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-(family-name:--font-bebas) text-3xl tracking-wide text-foreground">What do you want to create?</h2>
            {studioProjects.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setCreating(false)}>
                <ArrowLeft className="h-4 w-4" /> My projects
              </Button>
            )}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <button
              onClick={() => { setWorkType("software"); setStep(1); }}
              className="glass-metal group relative overflow-hidden p-6 text-left transition-all hover:border-accent"
            >
              <div className="metal-edge" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="icon-chip"><Zap className="h-5 w-5" /></span>
                  <span className="rounded-full bg-accent/15 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent">Live</span>
                </div>
                <p className="mt-4 font-(family-name:--font-bebas) text-2xl tracking-wide text-foreground">Software</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  Any language, any framework. Your team codes it in parallel and opens one verified PR.
                </p>
                <span className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-accent">
                  <ScrambleTextOnHover text="Start building" duration={0.4} />
                  <BitmapChevron className="transition-transform duration-400 group-hover:rotate-45" />
                </span>
              </div>
            </button>

            {([
              { key: "figma" as const, name: "Figma design", icon: Palette, desc: "Real Figma files from a brief, generated via MCP." },
              { key: "3d" as const, name: "3D models", icon: Box, desc: "3D assets and scenes from a description, via MCP." },
            ]).map((t) => (
              <button
                key={t.key}
                onClick={() => { setWorkType(t.key); setWaitlistState("idle"); }}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border p-6 text-left transition-all",
                  workType === t.key ? "border-accent/60 bg-surface" : "border-border bg-surface hover:border-muted-foreground",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="icon-chip opacity-70"><t.icon className="h-5 w-5" /></span>
                  <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Upcoming</span>
                </div>
                <p className="mt-4 font-(family-name:--font-bebas) text-2xl tracking-wide text-foreground">{t.name}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{t.desc}</p>
                {workType === t.key && (
                  <div className="mt-4 border-t border-border pt-3">
                    {waitlistState === "done" ? (
                      <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-accent">
                        <Check className="h-3.5 w-3.5" /> On the waitlist — free trial at launch
                      </span>
                    ) : (
                      <span
                        onClick={(e) => { e.stopPropagation(); joinWaitlist(t.key); }}
                        className="inline-flex cursor-pointer items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-foreground hover:text-accent"
                      >
                        {waitlistState === "sending" ? "Joining…" : "In development — join the waitlist"}
                        <BitmapChevron className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2 · Team ────────────────────────────────────────────── */}
      {showWizard && step === 1 && (
        <div className="animate-fade-up mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-(family-name:--font-bebas) text-3xl tracking-wide text-foreground">Assemble your team</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Give each specialist a model — mix providers freely, keys are asked once. Leave any on
                Auto and it runs on our default.
              </p>
            </div>
            <span className="rounded-full border border-border bg-surface px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {configuredCount}/6 custom · rest on auto
            </span>
          </div>
          <div className="mt-5">
            <TeamEditor value={team} onChange={setTeam} />
          </div>
          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button variant="primary" onClick={() => setStep(2)}>
              Continue to repo <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3 · Repo ────────────────────────────────────────────── */}
      {showWizard && step === 2 && (
        <div className="animate-fade-up mt-8">
          <h2 className="font-(family-name:--font-bebas) text-3xl tracking-wide text-foreground">Connect a repository</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Studio repos are separate from your main projects. Empty repos work too — the team can
            build from scratch.
          </p>
          <div className="glass-metal relative mt-5 overflow-hidden p-6">
            <div className="metal-edge" />
            <div className="relative space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <GithubIcon className="h-4 w-4 text-accent" /> GitHub repository URL
                </label>
                <Input placeholder="https://github.com/owner/repo" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Name (optional)</label>
                <Input placeholder="My studio project" value={repoName} onChange={(e) => setRepoName(e.target.value)} />
              </div>
              <div className="flex items-center justify-between pt-1">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button variant="primary" onClick={connectRepo} disabled={creatingRepo}>
                  {creatingRepo ? "Connecting…" : "Connect & continue"} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 4 · Brief ───────────────────────────────────────────── */}
      {showWizard && step === 3 && project && (
        <div className="animate-fade-up mt-8">
          <h2 className="font-(family-name:--font-bebas) text-3xl tracking-wide text-foreground">Brief your team</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Describe what to build in plain language. The Brain plans it and splits it across your
            agents on disjoint files — no two agents ever edit the same file.
          </p>
          <div className="glass-metal relative mt-5 overflow-hidden p-6">
            <div className="metal-edge" />
            <div className="relative">
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={6}
                placeholder={`e.g. "${EXAMPLE_BRIEFS[0]}"`}
                className="w-full resize-none rounded-xl border border-border bg-background p-4 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus-visible:border-accent/70 focus-visible:outline-none"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {EXAMPLE_BRIEFS.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setBrief(ex)}
                    className="rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
                  >
                    {ex}
                  </button>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {project.name} · {configuredCount || "0"} custom agent{configuredCount === 1 ? "" : "s"}
                </span>
                <button
                  onClick={deploy}
                  disabled={deploying || !brief.trim()}
                  className="group inline-flex items-center gap-3 border border-foreground/20 bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-widest text-background transition-all duration-200 hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  {deploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                  <ScrambleTextOnHover text={deploying ? "Deploying…" : "Deploy team"} duration={0.4} />
                  <BitmapChevron className="transition-transform duration-400 group-hover:rotate-45" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
