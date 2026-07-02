import Link from "next/link";
import { GitBranch, Network, GitPullRequest, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const POINTS = [
  { icon: Network, text: "A team of agents codes your task in parallel" },
  { icon: GitBranch, text: "Conflict-free — every agent owns its own files" },
  { icon: ShieldCheck, text: "Self-healing builds before anything is pushed" },
  { icon: GitPullRequest, text: "Everything ships as one clean pull request" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0a0a10]">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-zinc-900 p-12 lg:flex">
        <div className="glow-blob animate-glow-pulse" style={{ width: 500, height: 500, top: -120, left: -120 }} />
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-30" />

        <Link href="/" className="relative z-10 w-fit">
          <Logo size={30} wordClassName="text-xl" />
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            Deploy an <span className="text-gradient-red">autonomous engineering team</span> on your repo.
          </h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map((p, i) => (
              <li
                key={p.text}
                className="animate-fade-up flex items-center gap-3 text-zinc-300"
                style={{ animationDelay: `${i * 100 + 150}ms`, opacity: 0 }}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-950/40 text-indigo-300">
                  <p.icon className="h-4 w-4" />
                </span>
                <span className="text-sm">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-zinc-600">
          © {new Date().getFullYear()} Nexus AI
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <Link href="/">
              <Logo size={30} wordClassName="text-xl" />
            </Link>
          </div>
          <div className="animate-scale-in">{children}</div>
        </div>
      </div>
    </div>
  );
}
