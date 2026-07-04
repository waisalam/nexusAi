import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const POINTS = [
  "A team of agents codes your task in parallel",
  "Conflict-free — every agent owns its own files",
  "Self-healing builds before anything is pushed",
  "Everything ships as one clean pull request",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-border bg-surface p-12 lg:flex">
        {/* Vertical edge label */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <span className="block origin-left -rotate-90 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Access
          </span>
        </div>

        <Link href="/" className="w-fit pl-6">
          <Logo size={30} wordClassName="text-xl" />
        </Link>

        <div className="max-w-md pl-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">[ Nexus / AI ]</p>
          <h2 className="mt-4 font-(family-name:--font-bebas) text-5xl leading-[0.95] tracking-wide text-foreground">
            Deploy an autonomous engineering team on your repo.
          </h2>
          <ul className="mt-10 divide-y divide-border border-y border-border">
            {POINTS.map((text, i) => (
              <li
                key={text}
                className="animate-fade-up flex items-center gap-4 py-3.5"
                style={{ animationDelay: `${i * 100 + 150}ms`, opacity: 0 }}
              >
                <span className="font-mono text-[11px] text-accent">0{i + 1}</span>
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="pl-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          © {new Date().getFullYear()} Nexus AI
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex justify-center lg:hidden">
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
