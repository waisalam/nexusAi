"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

interface FeedbackRow {
  id: string;
  kind: string;
  message: string;
  email: string | null;
  name: string | null;
  page: string | null;
  created_at: string;
}
interface UserRow {
  id: string;
  email: string;
  username: string;
  created_at: string;
  demo_runs_remaining: number;
}
interface Stats {
  users: number;
  feedback: number;
  contact_requests: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [tab, setTab] = useState<"feedback" | "contact" | "users">("feedback");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get<Stats>("/api/v1/admin/stats"),
      apiClient.get<FeedbackRow[]>("/api/v1/admin/feedback"),
      apiClient.get<UserRow[]>("/api/v1/admin/users"),
    ])
      .then(([s, f, u]) => {
        setStats(s);
        setRows(f);
        setUsers(u);
      })
      .catch((e) => setError(e?.status === 403 ? "You're not authorized to view this." : "Failed to load admin data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-muted-foreground">Loading…</div>;
  if (error)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-muted-foreground">
        <p>{error}</p>
        <Link href="/dashboard" className="text-accent hover:underline">Back to dashboard</Link>
      </div>
    );

  const feedback = rows.filter((r) => r.kind === "feedback");
  const contact = rows.filter((r) => r.kind === "contact");
  const list = tab === "feedback" ? feedback : tab === "contact" ? contact : [];

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Admin</h1>

      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "Signups", value: stats?.users ?? 0 },
          { label: "Feedback", value: stats?.feedback ?? 0 },
          { label: "Contact requests", value: stats?.contact_requests ?? 0 },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-5">
            <div className="text-2xl font-semibold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex gap-2">
        {(["feedback", "contact", "users"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-sm capitalize transition-colors ${
              tab === t ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {tab === "users"
          ? users.map((u) => (
              <div key={u.id} className="rounded-lg border border-border bg-surface p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">{u.username} <span className="text-muted-foreground">· {u.email}</span></span>
                  <span className="text-xs text-muted-foreground">{u.demo_runs_remaining} runs left · {new Date(u.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          : list.map((r) => (
              <div key={r.id} className="rounded-lg border border-border bg-surface p-4 text-sm">
                <p className="text-foreground">{r.message}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  {r.name ? `${r.name} · ` : ""}{r.email || "anonymous"}
                  {r.page ? ` · ${r.page}` : ""} · {new Date(r.created_at).toLocaleString()}
                </div>
              </div>
            ))}
        {(tab === "users" ? users : list).length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
        )}
      </div>
    </div>
  );
}
