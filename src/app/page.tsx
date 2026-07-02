"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, GitBranch, ShieldCheck, Workflow, Zap, GitPullRequest,
  Cpu, Layers, Network, Sparkles, CheckCircle2, Lock, Eye, Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo, LogoMark, GithubIcon } from "@/components/ui/logo";
import { Reveal } from "@/components/ui/reveal";

const PIPELINE = [
  {
    icon: Layers,
    title: "Decompose",
    desc: "The orchestrator reads your whole repo, then splits your task into disjoint subtasks — each with its own isolated set of files so no two agents ever collide.",
  },
  {
    icon: Network,
    title: "Deploy the team",
    desc: "Up to 8 uniquely-named agents spin up at once and work in parallel on their own branches — planning, writing and editing code simultaneously.",
  },
  {
    icon: GitBranch,
    title: "Integrate & verify",
    desc: "Every branch merges into one integration branch, then it's built, type-checked and tested. A self-healing Fixer loop patches errors until it's green.",
  },
  {
    icon: GitPullRequest,
    title: "One clean PR",
    desc: "You get a single, build-verified pull request that combines all the agents' work — it even boots your app to confirm it actually runs.",
  },
];

const FEATURES = [
  { icon: Zap, title: "Truly parallel", desc: "A whole team works at once on disjoint files — minutes, not hours.", span: true },
  { icon: ShieldCheck, title: "Conflict-free by design", desc: "Files are partitioned up front, so agents never edit each other's code." },
  { icon: Cpu, title: "Project memory", desc: "Every run teaches the system — edits, errors and fixes feed the next run." },
  { icon: Workflow, title: "Self-healing builds", desc: "Failed builds trigger an auto-fix loop before anything is ever pushed." },
  { icon: Eye, title: "Live run view", desc: "Watch every agent's logs, the pipeline and the orchestrator brain in real time." },
  { icon: GitPullRequest, title: "One PR, every time", desc: "All the work lands as a single, reviewable, build-verified pull request.", span: true },
];

const TRUST = [
  { icon: Lock, text: "GitHub tokens encrypted at rest" },
  { icon: ShieldCheck, text: "Isolated workspaces, deleted after every run" },
  { icon: GitPullRequest, text: "Only PR access — never a direct push to main" },
];

/** Animated product mock: the orchestration console "running" a task. Pure CSS. */
function ConsoleMock() {
  const agents = [
    { name: "Nova", color: "text-indigo-300", file: "pricing/page.tsx", delay: 2.2 },
    { name: "Atlas", color: "text-violet-300", file: "pricing-card.tsx", delay: 2.7 },
    { name: "Lyra", color: "text-fuchsia-300", file: "header.tsx", delay: 3.2 },
  ];
  return (
    <div className="beam-edge relative rounded-2xl border border-[#26263a] bg-[#0d0d16]/90 shadow-2xl shadow-indigo-950/40 backdrop-blur">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-[#1e1e30] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="ml-3 font-mono text-xs text-zinc-500">nexus · orchestration run</span>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          LIVE
        </span>
      </div>

      <div className="space-y-3 p-4 font-mono text-xs">
        {/* the task */}
        <div className="rounded-lg border border-[#1e1e30] bg-[#12121c] p-3">
          <span className="text-zinc-500">task</span>
          <span className="console-caret ml-2 text-zinc-200">Build the pricing page</span>
        </div>

        {/* agents working in parallel */}
        <div className="grid grid-cols-3 gap-2">
          {agents.map((a) => (
            <div key={a.name} className="rounded-lg border border-[#1e1e30] bg-[#12121c] p-2.5">
              <div className="mb-2 flex items-center gap-1.5">
                <Bot className={`h-3 w-3 ${a.color}`} />
                <span className={`text-[10px] font-semibold ${a.color}`}>{a.name}</span>
              </div>
              <p className="mb-1.5 truncate text-[9px] text-zinc-600">{a.file}</p>
              <div className="space-y-1">
                {[0, 1, 2].map((line) => (
                  <span
                    key={line}
                    className="console-line h-1.5 rounded-sm bg-linear-to-r from-indigo-500/50 to-violet-500/30"
                    style={{ animationDelay: `${a.delay + line * 0.45}s`, maxWidth: `${90 - line * 18}%` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* build + PR */}
        <div className="rounded-lg border border-[#1e1e30] bg-[#12121c] p-3">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-zinc-500">integrate → build → verify</span>
            <span className="animate-fade-in text-emerald-400" style={{ animationDelay: "6.4s", opacity: 0 }}>✓ build passed</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#1e1e30]">
            <div className="progress-fill h-full rounded-full bg-linear-to-r from-indigo-500 to-violet-500" style={{ animationDelay: "5s", width: 0 }} />
          </div>
        </div>

        <div className="animate-fade-up flex items-center justify-between rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3" style={{ animationDelay: "6.8s", opacity: 0 }}>
          <span className="flex items-center gap-2 text-indigo-200">
            <GitPullRequest className="h-3.5 w-3.5" /> PR #16 · one build-verified pull request
          </span>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("access_token")) {
      setAuthed(true);
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a10]">
      {/* Background: drifting aurora + grid */}
      <div className="glow-blob animate-aurora" style={{ width: 700, height: 700, top: -260, left: "8%" }} />
      <div className="glow-blob glow-blob-violet animate-aurora" style={{ width: 600, height: 600, top: -160, right: "-10%", animationDelay: "-6s" }} />
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

      {/* Hero — copy left, live console right */}
      <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-14 lg:grid-cols-2">
        <div>
          <div className="animate-fade-down inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs text-indigo-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-400" />
            </span>
            Autonomous engineering teams
          </div>

          <h1 className="animate-fade-up delay-75 mt-6 text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl">
            One task in.
            <br />
            <span className="text-gradient-animated">One verified PR out.</span>
          </h1>

          <p className="animate-fade-up delay-150 mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
            Nexus AI splits your task across a team of AI agents that code in parallel on
            separate files, integrates their work, verifies the build —
            <span className="text-zinc-200"> and even runs your app to prove it works.</span>
          </p>

          <div className="animate-fade-up delay-300 mt-9 flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" size="lg" onClick={() => router.push(authed ? "/dashboard" : "/signup")}>
              {authed ? "Open Dashboard" : "Start building free"} <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/login")}>
              <GithubIcon className="h-4 w-4" /> Continue with GitHub
            </Button>
          </div>

          <div className="animate-fade-up delay-500 mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> Free runs to start</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> Works with any repo</span>
          </div>
        </div>

        <div className="animate-fade-up delay-300 relative">
          <div className="absolute -inset-6 rounded-3xl bg-linear-to-tr from-indigo-500/10 via-transparent to-violet-500/10 blur-2xl" />
          <ConsoleMock />
        </div>
      </section>

      {/* What is Nexus AI */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">What is Nexus AI</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Not one assistant. A whole engineering team.
          </h2>
          <p className="mt-4 leading-relaxed text-zinc-400">
            Most AI tools give you a single chat that edits one file at a time. Nexus AI deploys
            many specialized agents that divide the work, run at the same time, and coordinate
            so the result is integrated, verified, and ready to merge.
          </p>
        </Reveal>
      </section>

      {/* Pipeline */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        <Reveal className="mb-14 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">How it works</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">From one task to one pull request</h2>
        </Reveal>

        <div className="relative grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* connector rail (desktop) */}
          <div className="pointer-events-none absolute left-[12%] right-[12%] top-10 hidden h-px bg-linear-to-r from-transparent via-indigo-500/40 to-transparent lg:block" />
          {PIPELINE.map((step, i) => (
            <Reveal key={step.title} delay={i * 110}>
              <div className="card-premium group h-full p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="icon-chip h-11 w-11">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-[11px] font-bold tracking-widest text-zinc-600">0{i + 1}</span>
                </div>
                <h3 className="text-base font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features — bento grid */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <Reveal className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">Why teams choose it</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Built for speed and trust</h2>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 80} className={f.span ? "lg:col-span-2" : ""}>
              <div className="card-premium group h-full p-6">
                <div className="icon-chip h-10 w-10">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Security strip */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-8">
        <Reveal>
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-[#26263a] bg-[#12121c]/60 px-6 py-6 text-sm text-zinc-400 sm:flex-row sm:gap-10">
            {TRUST.map((t) => (
              <span key={t.text} className="flex items-center gap-2">
                <t.icon className="h-4 w-4 text-indigo-400" /> {t.text}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-28 pt-14">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-linear-to-b from-indigo-950/40 to-[#12121c] p-10 text-center sm:p-14">
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
      <footer className="relative z-10 border-t border-[#1a1a2a]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-zinc-500 sm:flex-row">
          <Logo size={22} wordClassName="text-base" />
          <p>© {new Date().getFullYear()} Nexus AI · Autonomous engineering teams</p>
          <div className="flex gap-5">
            <Link href="/login" className="hover:text-zinc-300">Sign in</Link>
            <Link href="/signup" className="hover:text-zinc-300">Get started</Link>
            <Link href="/contact" className="hover:text-zinc-300">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
