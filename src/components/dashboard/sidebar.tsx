"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderGit2, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { ScrambleTextOnHover } from "@/components/scramble-text";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Projects", icon: FolderGit2 },
  { href: "/dashboard/how-it-works", label: "How it works", icon: Sparkles },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-background">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/dashboard">
          <Logo size={26} />
        </Link>
      </div>

      <nav className="space-y-1 p-4">
        {navItems.map((item, i) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ animationDelay: `${i * 60}ms` }}
              className={cn(
                "animate-fade-up group relative flex items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-xs uppercase tracking-widest transition-all",
                isActive
                  ? "bg-accent/10 text-foreground"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-300",
                  isActive ? "scale-125 bg-accent" : "bg-muted-foreground/30 group-hover:bg-foreground/50"
                )}
              />
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <ScrambleTextOnHover text={item.label} duration={0.4} />
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">Tip</p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Open a project and hit <span className="text-accent">Deploy Team</span> to split a task across parallel agents.
          </p>
        </div>
      </div>
    </aside>
  );
}
