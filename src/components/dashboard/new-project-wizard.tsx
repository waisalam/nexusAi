"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Check, Zap, Palette, Box } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { GithubIcon } from "@/components/ui/logo";
import { useCreateProject } from "@/hooks/use-projects";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api-client";
import { projectCreateSchema, type ProjectCreateFormData } from "@/lib/validations";
import { cn } from "@/lib/utils";

/** Step-wise new-project flow: one decision per screen (never everything at once).
 * Step 1 — pick the work type. Engineering is live; Figma/3D are demand-gated:
 * choosing one shows an in-development notice + waitlist join (source-tagged, so
 * the admin panel measures which upcoming capability people actually want).
 * Step 2 — connect the GitHub repo. */

type WorkType = "engineering" | "figma" | "3d";

const WORK_TYPES: {
  key: WorkType;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  live: boolean;
}[] = [
  {
    key: "engineering",
    title: "Engineering",
    desc: "A team of AI agents writes code on your GitHub repo and opens one verified pull request.",
    icon: Zap,
    live: true,
  },
  {
    key: "figma",
    title: "UI/UX Design",
    desc: "Generate real Figma designs from a brief, via MCP.",
    icon: Palette,
    live: false,
  },
  {
    key: "3d",
    title: "3D Models",
    desc: "Generate 3D assets and scenes from a description, via MCP.",
    icon: Box,
    live: false,
  },
];

export function NewProjectWizard({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const { user } = useAuth();
  const createProject = useCreateProject();
  const [step, setStep] = useState<1 | 2>(1);
  const [workType, setWorkType] = useState<WorkType | null>(null);
  const [waitlistState, setWaitlistState] = useState<"idle" | "sending" | "done">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectCreateFormData>({ resolver: zodResolver(projectCreateSchema) });

  const pickType = (t: WorkType) => {
    setWorkType(t);
    setWaitlistState("idle");
    const info = WORK_TYPES.find((w) => w.key === t)!;
    if (info.live) setStep(2);
  };

  const joinWaitlist = async () => {
    if (!workType || waitlistState !== "idle") return;
    setWaitlistState("sending");
    try {
      await apiClient.post("/api/v1/waitlist", {
        email: user?.email,
        source: workType === "figma" ? "figma-mcp" : "3d-mcp",
      });
      setWaitlistState("done");
    } catch {
      setWaitlistState("done"); // never block the user on a tracking call
    }
  };

  const onSubmit = async (formData: ProjectCreateFormData) => {
    try {
      await createProject.mutateAsync(formData);
      toast.success("Repository connected! Cloning & analyzing in the background…");
      reset();
      onDone();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create project");
    }
  };

  const selected = WORK_TYPES.find((w) => w.key === workType);

  return (
    <Card className="animate-scale-in border-accent/25">
      <CardContent className="p-6 sm:p-8">
        {/* Step indicator */}
        <div className="mb-7 flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className={cn(step === 1 ? "text-accent" : "text-foreground")}>01 · Choose work</span>
          <span className="h-px flex-1 bg-border" />
          <span className={cn(step === 2 ? "text-accent" : "")}>02 · Connect repo</span>
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground">What should your AI team do?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pick one to continue.</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {WORK_TYPES.map((w) => (
                <button
                  key={w.key}
                  onClick={() => pickType(w.key)}
                  className={cn(
                    "group relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all",
                    workType === w.key
                      ? "border-accent bg-accent/10"
                      : "border-border bg-surface hover:border-muted-foreground"
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <w.icon className="h-5 w-5 text-accent" />
                    {w.live ? (
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-accent">
                        Live
                      </span>
                    ) : (
                      <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Upcoming
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{w.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{w.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Demand-gated: upcoming type selected */}
            {selected && !selected.live && (
              <div className="mt-5 rounded-xl border border-border bg-surface p-5">
                {waitlistState === "done" ? (
                  <div className="flex items-center gap-2.5 text-sm text-accent">
                    <Check className="h-4 w-4 shrink-0" />
                    You&apos;re on the {selected.title} waitlist — waitlisted users get a free trial at launch.
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{selected.title}</span> is in development.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Join the waitlist and you&apos;ll get a free trial when it launches — we build the
                      most-requested capability first.
                    </p>
                    <Button variant="primary" size="sm" className="mt-3" onClick={joinWaitlist} disabled={waitlistState === "sending"}>
                      {waitlistState === "sending" ? "Joining…" : "Join the waitlist"}
                    </Button>
                  </>
                )}
              </div>
            )}

            <div className="mt-6">
              <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <button
              onClick={() => setStep(1)}
              className="mb-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <GithubIcon className="h-5 w-5 text-accent" /> Connect a GitHub repository
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We clone &amp; analyze it once, then your agents work from that memory.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">GitHub Repository URL</label>
                <Input placeholder="https://github.com/owner/repo" {...register("github_repo_url")} />
                {errors.github_repo_url && (
                  <p className="text-xs text-destructive">{errors.github_repo_url.message}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Project Name (optional)</label>
                  <Input placeholder="My Project" {...register("name")} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description (optional)</label>
                  <Input placeholder="A brief description" {...register("description")} />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? "Connecting..." : "Connect Repository"}
                </Button>
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
              </div>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
