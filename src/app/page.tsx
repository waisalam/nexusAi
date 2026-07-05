"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight, GitBranch, ShieldCheck, Workflow, Zap, GitPullRequest,
  Cpu, Layers, Network, CheckCircle2, Lock, Eye, Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo, GithubIcon } from "@/components/ui/logo";
import { Reveal } from "@/components/ui/reveal";
import { FlipReveal } from "@/components/ui/flip-reveal";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SideNav } from "@/components/side-nav";
import { HighlightText } from "@/components/highlight-text";
import { ScrambleTextOnHover } from "@/components/scramble-text";
import { SplitFlapAudioProvider, SplitFlapText, SplitFlapMuteToggle } from "@/components/split-flap-text";
import { BitmapChevron } from "@/components/bitmap-chevron";
import { WaitlistForm } from "@/components/waitlist-form";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const NAV_SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "demo", label: "Live Demo" },
  { id: "about", label: "About" },
  { id: "how-it-works", label: "How it works" },
  { id: "features", label: "Features" },
  { id: "cta", label: "Get started" },
];

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
  { icon: Zap, title: "Truly parallel", desc: "A whole team works at once on disjoint files — minutes, not hours." },
  { icon: ShieldCheck, title: "Conflict-free by design", desc: "Files are partitioned up front, so agents never edit each other's code." },
  { icon: Cpu, title: "Project memory", desc: "Every run teaches the system — edits, errors and fixes feed the next run." },
  { icon: Workflow, title: "Self-healing builds", desc: "Failed builds trigger an auto-fix loop before anything is ever pushed." },
  { icon: Eye, title: "Live run view", desc: "Watch every agent's logs, the pipeline and the orchestrator brain in real time." },
  { icon: GitPullRequest, title: "One PR, every time", desc: "All the work lands as a single, reviewable, build-verified pull request." },
];

const TRUST = [
  { icon: Lock, text: "GitHub tokens encrypted at rest" },
  { icon: ShieldCheck, text: "Isolated workspaces, deleted after every run" },
  { icon: GitPullRequest, text: "Only PR access — never a direct push to main" },
];

const AGENTS = [
  { name: "Nova", lines: ["Writing checkout/page.tsx", "Building page layout", "Linking to cart"] },
  { name: "Atlas", lines: ["Creating PaymentForm.tsx", "Adding Stripe SDK", "Handling card input"] },
  { name: "Orion", lines: ["Writing api/webhook.ts", "Verifying signature", "Updating order status"] },
  { name: "Vega", lines: ["Building OrderSummary.tsx", "Calculating totals", "Adding tax logic"] },
  { name: "Lyra", lines: ["Writing checkout.test.ts", "Testing payment flow", "Mocking Stripe API"] },
  { name: "Iris", lines: ["Updating types.ts", "Adding CheckoutState", "Fixing type error"] },
  { name: "Echo", lines: ["Styling checkout form", "Adding loading state", "Polishing UI"] },
  { name: "Sol", lines: ["Wiring navigation", "Updating routes.ts", "Linking success page"] },
];

/** Live orchestration demo — a large metallic glass terminal that loops
 * continuously (no JS timers; one shared CSS cycle so every element stays in
 * sync). Sized to fill its wrapper (90vw × 90vh), so the internals scale up
 * with it — this is meant to read as a big showcase panel, not a small card. */
function OrchestrationTerminal() {
  return (
    <div className="glass-metal flex h-full w-full flex-col">
      <div className="metal-edge" />
      <div className="relative flex shrink-0 items-center gap-2.5 border-b border-border px-6 py-4 sm:px-8 sm:py-5">
        <span className="h-3 w-3 rounded-full border border-border" />
        <span className="h-3 w-3 rounded-full border border-border" />
        <span className="h-3 w-3 rounded-full border border-border" />
        <span className="ml-3 font-mono text-sm text-muted-foreground">nexus · orchestration run</span>
        <span className="ml-auto flex items-center gap-2 text-xs font-medium text-accent">
          <span className="h-2 w-2 rounded-full bg-accent" />
          LIVE
        </span>
      </div>

      <div className="demo-scene relative flex flex-1 flex-col justify-center gap-6 overflow-hidden p-6 sm:gap-8 sm:p-10 lg:p-14">
        {/* Task */}
        <div className="demo-task shrink-0 rounded-xl border border-border bg-surface-2 p-4 font-mono text-sm sm:p-5 sm:text-base">
          <span className="text-muted-foreground">task</span>
          <span className="console-caret ml-2 text-foreground">Build a checkout flow with Stripe</span>
        </div>

        {/* 8 agents working simultaneously */}
        <div className="shrink-0">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground sm:text-sm">
            8 agents deployed — working simultaneously
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {AGENTS.map((agent, i) => (
              <div
                key={agent.name}
                className="demo-chip rounded-xl border border-border bg-surface-2 p-4"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <Bot className="h-4 w-4 text-accent" />
                  <span className="text-sm font-semibold text-foreground">{agent.name}</span>
                </div>
                <div className="space-y-1.5 font-mono">
                  {agent.lines.map((line, li) => (
                    <span
                      key={li}
                      className="demo-typing block overflow-hidden whitespace-nowrap text-[11px] text-muted-foreground"
                      style={{ animationDelay: `${i * 0.18 + li * 0.35}s` }}
                    >
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Build + verify */}
        <div className="shrink-0 rounded-xl border border-border bg-surface-2 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between font-mono text-xs text-muted-foreground sm:text-sm">
            <span>integrate → build → verify</span>
          </div>
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-border">
            <div className="demo-progress h-full rounded-full bg-accent" />
          </div>
          <div className="demo-check flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-xs text-accent sm:text-sm">
            <span>✓ merged</span>
            <span>✓ build</span>
            <span>✓ tests</span>
            <span>✓ runtime</span>
          </div>
        </div>

        {/* Result PR */}
        <div className="demo-pr flex shrink-0 items-center justify-between rounded-xl border border-accent/30 bg-accent/10 p-4 sm:p-5">
          <span className="flex items-center gap-2.5 text-base text-foreground">
            <GitPullRequest className="h-4 w-4 text-accent" /> PR #16 · one build-verified pull request
          </span>
          <CheckCircle2 className="h-4 w-4 text-accent" />
        </div>
      </div>
    </div>
  );
}

/** Editorial section header: a mono index/label chip with a rule extending to
 * the right, then a large Bebas-condensed display title. */
function SectionHead({ index, label, children, className = "" }: {
  index: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-4">
        <p className="shrink-0 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
          [ {index} / {label} ]
        </p>
        <span className="h-px flex-1 bg-border" />
      </div>
      <h2 className="mt-5 font-(family-name:--font-bebas) text-4xl leading-none tracking-wide text-foreground sm:text-5xl lg:text-6xl">
        {children}
      </h2>
    </div>
  );
}

function Hero({ authed, router }: { authed: boolean; router: ReturnType<typeof useRouter> }) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !contentRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.to(contentRef.current, {
        y: -80,
        opacity: 0,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-[92vh] items-center pl-6 pr-6 md:pl-12 md:pr-12"
    >
      {/* Vertical edge label */}
      <div className="absolute left-4 top-1/2 hidden -translate-y-1/2 md:left-6 md:block">
        <span className="block origin-left -rotate-90 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Agents
        </span>
      </div>

      <div ref={contentRef} className="mx-auto w-full max-w-5xl">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
          [ Early access · In development ]
        </p>
        <SplitFlapAudioProvider>
          <div className="relative flex items-end justify-between gap-4">
            <SplitFlapText
              text="NEXUS AI"
              speed={70}
              className="text-6xl font-bold tracking-tight text-foreground sm:text-8xl lg:text-9xl"
            />
            <SplitFlapMuteToggle className="mb-2 shrink-0" />
          </div>
        </SplitFlapAudioProvider>

        <h2 className="mt-5 font-[var(--font-bebas)] text-[clamp(1.25rem,3.2vw,2.25rem)] tracking-wide text-muted-foreground">
          One task in. One verified pull request out.
        </h2>

        <p className="mt-8 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground sm:text-base">
          Nexus AI splits your task across a team of AI agents that code in parallel on separate
          files, integrates their work, and verifies the build — it even runs your app to prove
          it works.
        </p>

        {authed ? (
          <div className="mt-14 flex flex-wrap items-center gap-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="group inline-flex items-center gap-3 border border-foreground/20 bg-foreground px-6 py-3 font-mono text-xs uppercase tracking-widest text-background transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
            >
              <ScrambleTextOnHover text="Open Dashboard" duration={0.5} />
              <BitmapChevron className="transition-transform duration-400 ease-in-out group-hover:rotate-45" />
            </button>
          </div>
        ) : (
          <div className="mt-12">
            <p className="mb-4 max-w-md font-mono text-xs leading-relaxed text-muted-foreground">
              Founding members get early access and a lifetime discount when paid plans launch.
            </p>
            <WaitlistForm source="hero" />
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <button
                onClick={() => router.push("/signup")}
                className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-foreground transition-colors duration-200 hover:text-accent"
              >
                <ScrambleTextOnHover text="Try the live demo" duration={0.5} />
                <BitmapChevron className="transition-transform duration-400 ease-in-out group-hover:rotate-45" />
              </button>
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Early build — if the demo errors, tap Feedback (bottom-right)
              </span>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-accent" /> 5 free runs</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-accent" /> No card</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-accent" /> Any repo</span>
        </div>
      </div>

      {/* Floating build tag */}
      <div className="absolute bottom-8 right-6 md:bottom-12 md:right-12">
        <div className="border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          LIVE / Autonomous Build
        </div>
      </div>
    </section>
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
    <div className="min-h-screen bg-background md:pl-20">
      <SideNav items={NAV_SECTIONS} />

      {/* Nav */}
      <header className="border-b border-border">
        <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-8 py-5">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle className="mr-1" />
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

      <Hero authed={authed} router={router} />

      {/* Live orchestration demo — a large square-ish metallic showcase panel,
          sized to the viewport (not the page's max-width) so 90vw/90vh are true
          viewport fractions rather than being capped by a narrower parent. */}
      <section id="demo" className="flex justify-center pb-24">
        <div className="animate-fade-up delay-300 h-[90vh] w-[90vw] max-w-[1400px]">
          <OrchestrationTerminal />
        </div>
      </section>

      {/* What is Nexus AI */}
      <section id="about" className="border-t border-border">
        <div className="mx-auto max-w-[1600px] px-8 py-20">
          <Reveal>
            <SectionHead index="01" label="What is Nexus AI">
              Not one assistant. <HighlightText>A whole engineering team.</HighlightText>
            </SectionHead>
            <p className="mt-6 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground">
              Most AI tools give you a single chat that edits one file at a time. Nexus AI deploys
              many specialized agents that divide the work, run at the same time, and coordinate
              so the result is integrated, verified, and ready to merge.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Pipeline — metallic cards that flip into place on scroll */}
      <section id="how-it-works" className="border-t border-border">
        <div className="mx-auto max-w-[1600px] px-8 py-20">
          <Reveal className="mb-12">
            <SectionHead index="02" label="How it works">From one task to one pull request</SectionHead>
          </Reveal>

          <div className="flip-wrap grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {PIPELINE.map((step, i) => (
              <FlipReveal key={step.title} delay={i * 100} className="card-flat group h-full p-6">
                <div className="mb-5 flex items-start justify-between">
                  <span className="font-(family-name:--font-bebas) text-4xl leading-none text-muted-foreground/40">0{i + 1}</span>
                  <div className="icon-chip h-10 w-10">
                    <step.icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </FlipReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features — same flip-card treatment */}
      <section id="features" className="border-t border-border">
        <div className="mx-auto max-w-[1600px] px-8 py-20">
          <Reveal className="mb-12">
            <SectionHead index="03" label="Why teams choose it">Built for speed and trust</SectionHead>
          </Reveal>

          <div className="flip-wrap grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <FlipReveal key={f.title} delay={(i % 3) * 90} className="card-flat group h-full p-6">
                <div className="icon-chip h-10 w-10">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-mono text-xs uppercase tracking-widest text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </FlipReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1600px] px-8 py-10">
          <Reveal>
            <div className="grid divide-y divide-border overflow-hidden rounded-none border border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {TRUST.map((t, i) => (
                <div key={t.text} className="flex items-center gap-3 bg-surface px-6 py-5">
                  <span className="font-mono text-[10px] text-muted-foreground">0{i + 1}</span>
                  <t.icon className="h-4 w-4 shrink-0 text-accent" />
                  <span className="text-sm text-muted-foreground">{t.text}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA — metallic glass panel */}
      <section id="cta" className="border-t border-border">
        <div className="mx-auto max-w-[1600px] px-8 py-24">
          <Reveal>
            <div className="glass-metal relative overflow-hidden p-10 sm:p-16">
              <div className="metal-edge" />
              <div className="relative flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
                <div className="max-w-2xl">
                  <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">[ 04 / Early access ]</p>
                  <h2 className="mt-5 font-(family-name:--font-bebas) text-5xl leading-[0.95] tracking-wide text-foreground sm:text-6xl lg:text-7xl">
                    Get in early.<br />
                    <HighlightText>Deploy your team.</HighlightText>
                  </h2>
                  <p className="mt-6 max-w-md font-mono text-sm leading-relaxed text-muted-foreground">
                    Nexus AI is in active development. Join the waitlist for a founding-member spot,
                    or jump straight into the live demo now.
                  </p>
                </div>
                {authed ? (
                  <div className="flex shrink-0 flex-col gap-3">
                    <button
                      onClick={() => router.push("/dashboard")}
                      className="group inline-flex items-center justify-between gap-6 border border-foreground/20 bg-foreground px-6 py-3.5 font-mono text-xs uppercase tracking-widest text-background transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
                    >
                      <ScrambleTextOnHover text="Open Dashboard" duration={0.5} />
                      <BitmapChevron className="transition-transform duration-400 ease-in-out group-hover:rotate-45" />
                    </button>
                  </div>
                ) : (
                  <div className="flex w-full shrink-0 flex-col gap-4 lg:w-auto">
                    <WaitlistForm source="cta" />
                    <button
                      onClick={() => router.push("/signup")}
                      className="group inline-flex items-center gap-2 self-start font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <ScrambleTextOnHover text="Or try the live demo" duration={0.5} />
                      <BitmapChevron className="transition-transform duration-400 ease-in-out group-hover:rotate-45" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-4 px-8 py-8 text-sm text-muted-foreground sm:flex-row">
          <Logo size={22} wordClassName="text-base" />
          <p>© {new Date().getFullYear()} Nexus AI · Autonomous engineering teams</p>
          <div className="flex gap-5">
            <Link href="/login" className="hover:text-foreground"><ScrambleTextOnHover text="Sign in" duration={0.4} /></Link>
            <Link href="/signup" className="hover:text-foreground"><ScrambleTextOnHover text="Get started" duration={0.4} /></Link>
            <Link href="/contact" className="hover:text-foreground"><ScrambleTextOnHover text="Contact" duration={0.4} /></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
