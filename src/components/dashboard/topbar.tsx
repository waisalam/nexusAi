"use client";

import { useRouter } from "next/navigation";
import { LogOut, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearStoredTokens } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function Topbar() {
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = () => {
    clearStoredTokens();
    router.push("/login");
  };

  const initial = (user?.full_name || user?.username || user?.email || "U").charAt(0).toUpperCase();

  return (
    <header className="glass fixed left-64 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border px-6">
      <div className="text-sm text-muted-foreground">
        {user?.full_name || user?.username ? (
          <span>
            Signed in as <span className="text-foreground">{user.full_name || user.username}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">Nexus AI workspace</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {typeof user?.demo_runs_remaining === "number" && (
          <button
            onClick={() => router.push("/contact")}
            title="Free runs remaining on your demo"
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              user.demo_runs_remaining > 0
                ? "border-border text-foreground hover:border-muted-foreground"
                : "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15"
            )}
          >
            {user.demo_runs_remaining > 0
              ? `${user.demo_runs_remaining} free run${user.demo_runs_remaining === 1 ? "" : "s"} left`
              : "Out of free runs — get a plan"}
          </button>
        )}
        <Button variant="primary" size="sm" onClick={() => router.push("/dashboard/projects?new=true")}>
          <Plus className="h-4 w-4" /> New Repo
        </Button>
        <Button variant="ghost" size="icon" title="Settings" onClick={() => router.push("/dashboard/settings")}>
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" title="Log out" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
        <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-sm font-semibold text-accent">
          {initial}
        </div>
      </div>
    </header>
  );
}
