"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderGit2, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Projects", icon: FolderGit2 },
  { href: "/dashboard/how-it-works", label: "How it works", icon: Sparkles },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-zinc-900 bg-[#0a0a0c]">
      <div className="flex h-16 items-center border-b border-zinc-900 px-6">
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
                "animate-fade-up group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-red-950/40 text-white"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-red-500" />
              )}
              <item.icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-red-400" : "text-zinc-500 group-hover:text-zinc-300"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-900 p-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
          <p className="text-xs font-medium text-zinc-300">Tip</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            Open a project and hit <span className="text-red-400">Deploy Team</span> to split a task across parallel agents.
          </p>
        </div>
      </div>
    </aside>
  );
}
