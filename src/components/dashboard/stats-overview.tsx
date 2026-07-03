"use client";

import { FolderGit2, Bot, GitPullRequest } from "lucide-react";

interface StatsOverviewProps {
  totalProjects: number;
  activeAgents?: number;
  pullRequests?: number;
}

export function StatsOverview({ totalProjects, activeAgents = 0, pullRequests = 0 }: StatsOverviewProps) {
  const stats = [
    { label: "Projects", value: totalProjects, icon: FolderGit2 },
    { label: "Active Agents", value: activeAgents, icon: Bot },
    { label: "Pull Requests", value: pullRequests, icon: GitPullRequest },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          style={{ animationDelay: `${i * 80}ms` }}
          className="hover-lift animate-fade-up flex items-center gap-4 rounded-xl border border-border bg-surface p-5"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
            <stat.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
