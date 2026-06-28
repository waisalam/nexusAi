"use client";

import { useRouter } from "next/navigation";
import { LogOut, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearStoredTokens } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

export function Topbar() {
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = () => {
    clearStoredTokens();
    router.push("/login");
  };

  const initial = (user?.full_name || user?.username || user?.email || "U").charAt(0).toUpperCase();

  return (
    <header className="glass fixed left-64 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-900 px-6">
      <div className="text-sm text-zinc-500">
        {user?.full_name || user?.username ? (
          <span>
            Signed in as <span className="text-zinc-300">{user.full_name || user.username}</span>
          </span>
        ) : (
          <span className="text-zinc-600">Nexus AI workspace</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="primary" size="sm" onClick={() => router.push("/dashboard/projects?new=true")}>
          <Plus className="h-4 w-4" /> New Repo
        </Button>
        <Button variant="ghost" size="icon" title="Settings" onClick={() => router.push("/dashboard/settings")}>
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" title="Log out" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
        <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full border border-red-900/50 bg-red-950/50 text-sm font-semibold text-red-300">
          {initial}
        </div>
      </div>
    </header>
  );
}
