"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, GitBranch, Boxes, ShieldCheck, Workflow, Zap, GitPullRequest,
  Cpu, Layers, Network, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo, LogoMark, GithubIcon } from "@/components/ui/logo";
import { Reveal } from "@/components/ui/reveal";

const PIPELINE = [
  {
    icon: Layers,
    title: "1 · Decompose",
    desc: "The orchestrator reads your whole repo, then splits your task into disjoint subtasks — each with its own isolated set of files so no two agents ever collide.",
  },
  {
    icon: Network,
    title: "2 · Deploy the team",
    desc: "Up to 8 uniquely-named agents spin up at once and work in parallel on their own branches — planning, writing and editing code simultaneously. No waiting, no conflicts.",
  },
  {
    icon: GitBranch,
    title: "3 · Integrate & verify",
    desc: "Every branch is merged into one integration branch, then built and type-checked. A self-healing Fixer loop installs missing deps and patches errors until it's green.",
  },
  {
    icon: GitPullRequest,
    title: "4 · One clean PR",
    desc: "You get a single, build-verified pull request that combines all the agents' work — ready to review and merge. Your GitHub stays clean.",
  },
];

const FEATURES = [
  { icon: Zap, title: "Truly parallel", desc: "A whole team works at once on disjoint files — minutes, not hours." },
  { icon: ShieldCheck, title: "Conflict-free by design", desc: "Files are partitioned up front, so agents never edit each other's code." },
  { icon: Cpu, title: "Project memory", desc: "Your repo is cloned once and remembered — edits, errors and fixes feed the next run." },
  { icon: Workflow, title: "Self-healing builds", desc: "Failed builds trigger an auto-fix loop before anything is ever pushed." },
  { icon: Boxes, title: "Live run view", desc: "Watch every agent's logs, the pipeline progress and the orchestrator brain in real time." },
  { icon: GitPullRequest, title: "One PR, every time", desc: "All the work lands as a single, reviewable, build-verified pull request." },
];

export default function Home() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("access_token")) {
      setAuthed(true);
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08080a]">
      {/* Background accents */}
      <div className="glow-blob animate-glow-pulse" style={{ width: 600, height: 600, top: -200, left: "50%", transform: "translateX(-50%)" }} />
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-40 mask-[radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      {/* Nav */}
      <header className="relative z-20">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Logo />
          <div className="flex items-center gap-2">
            {authed ? (
              <Button variant="primary" onClick={() => router.push("/dashboard")}>
                Open Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => router.push("/login")}>
                  Sign in
                </Button>
                <Button variant="primary" onClick={() => router.push("/signup")}>
                  Get started <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pt-20 pb-24 text-center">
        <div className="animate-fade-down inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 text-xs text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          Autonomous engineering teams, powered by AI
        </div>

        <h1 className="animate-fade-up delay-75 mt-7 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          Ship features with a
          <br />
          <span className="text-gradient-red">team of AI agents</span>
        </h1>

        <p className="animate-fade-up delay-150 mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
          Nexus AI connects your GitHub repo, splits your task across a fleet of autonomous
          agents that code in parallel, then build-verifies and ships it all as
          <span className="text-zinc-200"> one clean pull request.</span>
        </p>

        <div className="animate-fade-up delay-300 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button variant="primary" size="lg" onClick={() => router.push(authed ? "/dashboard" : "/signup")}>
            {authed ? "Open Dashboard" : "Start building free"} <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.push("/login")}>
            <GithubIcon className="h-4 w-4" /> Sign in
          </Button>
        </div>

        {/* Floating mini pipeline preview */}
        <div className="animate-fade-up delay-500 mt-16 flex items-center justify-center gap-3 text-xs text-zinc-500">
          {["Decompose", "Deploy team", "Integrate", "One PR"].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <span className="rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-zinc-300">{s}</span>
              {i < 3 && <ArrowRight className="h-3.5 w-3.5 text-red-500/60" />}
            </div>
          ))}
        </div>
      </section>

      {/* What we do */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-500">What is Nexus AI</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Not one assistant. A whole engineering team.
          </h2>
          <p className="mt-4 text-zinc-400">
            Most AI tools give you a single chat that edits one file at a time. Nexus AI deploys
            many specialized agents that divide the work, run at the same time, and coordinate
            so the result is integrated, verified, and ready to merge.
          </p>
        </Reveal>
      </section>

      {/* How the AI works — pipeline */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        <Reveal className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-500">How it works</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">From one task to one pull request</h2>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PIPELINE.map((step, i) => (
            <Reveal key={step.title} delay={i * 100}>
              <div className="hover-lift group h-full rounded-xl border border-zinc-800 bg-[#101013] p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-red-900/40 bg-red-950/40 text-red-400 transition-colors group-hover:bg-red-900/40">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <Reveal className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-500">Why teams choose it</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Built for speed and trust</h2>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 90}>
              <div className="hover-lift h-full rounded-xl border border-zinc-800 bg-[#101013] p-6">
                <f.icon className="h-6 w-6 text-red-500" />
                <h3 className="mt-4 text-base font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-28 pt-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-red-900/40 bg-linear-to-b from-red-950/30 to-[#101013] p-10 text-center sm:p-14">
            <div className="glow-blob animate-glow-pulse" style={{ width: 400, height: 400, bottom: -200, left: "50%", transform: "translateX(-50%)" }} />
            <LogoMark size={44} className="animate-float mx-auto" />
            <h2 className="relative mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Connect a repo. Deploy your team.
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-zinc-400">
              Sign up, paste a GitHub URL, describe what you want — and watch a team of agents build it.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button variant="primary" size="lg" onClick={() => router.push(authed ? "/dashboard" : "/signup")}>
                <Sparkles className="h-4 w-4" /> {authed ? "Open Dashboard" : "Create your account"}
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push("/login")}>
                Sign in
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-zinc-500 sm:flex-row">
          <Logo size={22} wordClassName="text-base" />
          <p>© {new Date().getFullYear()} Nexus AI · Autonomous engineering teams</p>
          <div className="flex gap-5">
            <Link href="/login" className="hover:text-zinc-300">Sign in</Link>
            <Link href="/signup" className="hover:text-zinc-300">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
