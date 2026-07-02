"use client";

import { useRouter } from "next/navigation";
import {
  ListTodo, Layers, Network, GitBranch, ShieldCheck, GitPullRequest,
  ArrowRight, Cpu, Database, Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { GithubIcon } from "@/components/ui/logo";

const STEPS = [
  {
    icon: GithubIcon,
    title: "Connect your repository",
    desc: "Paste a GitHub URL. Nexus clones the repo once into a master cache and analyzes the whole codebase — file tree plus an AI summary of every key file. This is stored, so it never re-downloads or re-analyzes unless the code changes.",
  },
  {
    icon: ListTodo,
    title: "Describe a task",
    desc: "Write what you want in plain English — e.g. \"redesign the dashboard\" or \"add Stripe checkout\". One task is all you need; you don't have to break it down yourself.",
  },
  {
    icon: Layers,
    title: "The orchestrator decomposes it",
    desc: "The brain reads the repo context and splits your task into disjoint subtasks. Files are clustered by directory and partitioned so each agent owns a completely separate set — no two agents ever touch the same file.",
  },
  {
    icon: Network,
    title: "A team deploys in parallel",
    desc: "Up to 8 uniquely-named agents (Nova, Atlas, Orion…) spin up at once. Each plans, writes and edits its own files on its own branch — all at the same time. No waiting, no merge conflicts by design.",
  },
  {
    icon: GitBranch,
    title: "Branches are integrated",
    desc: "Every agent branch is merged into a single integration branch. Any rare conflict is auto-resolved by the orchestrator before moving on.",
  },
  {
    icon: ShieldCheck,
    title: "Build-verified & self-healed",
    desc: "The integrated code is installed, built and type-checked. If it fails, a Fixer loop installs missing dependencies and patches errors — retrying until it's green. Broken code is never pushed.",
  },
  {
    icon: GitPullRequest,
    title: "One clean pull request",
    desc: "You get a single, build-verified PR that combines all the agents' work — ready to review and merge. Everything that happened is recorded as project memory for the next run.",
  },
];

const PILLARS = [
  { icon: Cpu, title: "Project memory", desc: "Edits, errors and fixes are remembered per project and fed into future runs so agents keep getting smarter about your codebase." },
  { icon: Database, title: "Clone once", desc: "The repo is cached locally; agents copy from it in seconds instead of re-downloading from GitHub every run." },
  { icon: Workflow, title: "Self-healing", desc: "A dedicated Fixer agent owns build verification — installing deps and patching errors automatically." },
];

export default function HowItWorksPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-4xl space-y-12 pb-10">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">How Nexus AI works</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">From one task to one pull request</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Nexus AI turns a single plain-English task into a fully integrated, build-verified pull request —
          built by a team of autonomous agents working in parallel. Here&apos;s exactly what happens.
        </p>
      </div>

      {/* Vertical pipeline */}
      <div className="relative">
        <div className="absolute bottom-2 left-5.5 top-2 w-px bg-linear-to-b from-indigo-500/50 via-zinc-800 to-transparent" />
        <div className="space-y-5">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 60}>
              <div className="relative flex gap-5">
                <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-950/40 text-indigo-300">
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 rounded-xl border border-zinc-800 bg-[#12121c] p-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-400">STEP {i + 1}</span>
                  </div>
                  <h3 className="mt-1 text-base font-semibold text-white">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{step.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Pillars */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">What makes it fast &amp; reliable</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <div className="hover-lift h-full rounded-xl border border-zinc-800 bg-[#12121c] p-5">
                <p.icon className="h-5 w-5 text-indigo-400" />
                <h3 className="mt-3 text-sm font-semibold text-white">{p.title}</h3>
                <p className="mt-1.5 text-sm text-zinc-400">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-linear-to-b from-indigo-950/40 to-[#12121c] p-8 text-center">
        <h2 className="text-xl font-bold">Ready to deploy your team?</h2>
        <p className="mt-2 text-sm text-zinc-400">Connect a repo, add a task, and hit Deploy Team.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="primary" onClick={() => router.push("/dashboard/projects?new=true")}>
            <GithubIcon className="h-4 w-4" /> Connect a repository
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
