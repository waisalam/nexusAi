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
    <div className="flex min-h-screen bg-background">
      {/* Brand panel */}
      <div className="hidden w-1/2 flex-col justify-between border-r border-border bg-surface p-12 lg:flex">
        <Link href="/" className="w-fit">
          <Logo size={30} wordClassName="text-xl" />
        </Link>

        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-foreground">
            Deploy an <span className="text-accent">autonomous engineering team</span> on your repo.
          </h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map((p, i) => (
              <li
                key={p.text}
                className="animate-fade-up flex items-center gap-3 text-foreground"
                style={{ animationDelay: `${i * 100 + 150}ms`, opacity: 0 }}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-accent">
                  <p.icon className="h-4 w-4" />
                </span>
                <span className="text-sm">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">
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
