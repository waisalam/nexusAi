"use client";

import { useEffect, useMemo, useState } from "react";
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
interface LeadRow {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
  phone: string | null;
  message: string;
  referral_code: string | null;
  status: string;
  created_at: string;
  converted_at: string | null;
}
interface Stats {
  users: number;
  feedback: number;
  contact_requests: number;
  leads: number;
  converted: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [tab, setTab] = useState<"leads" | "feedback" | "contact" | "users">("leads");
  const [refFilter, setRefFilter] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get<Stats>("/api/v1/admin/stats"),
      apiClient.get<FeedbackRow[]>("/api/v1/admin/feedback"),
      apiClient.get<UserRow[]>("/api/v1/admin/users"),
      apiClient.get<LeadRow[]>("/api/v1/admin/leads"),
    ])
      .then(([s, f, u, l]) => {
        setStats(s);
        setRows(f);
        setUsers(u);
        setLeads(l);
      })
      .catch((e) => setError(e?.status === 403 ? "You're not authorized to view this." : "Failed to load admin data."))
      .finally(() => setLoading(false));
  }, []);

  const markStatus = async (id: string, status: "new" | "converted") => {
    // Optimistic update — compute the new list once and derive the stat from it so
    // the "Converted" count and the rows never drift apart.
    const newLeads = leads.map((l) =>
      l.id === id
        ? { ...l, status, converted_at: status === "converted" ? new Date().toISOString() : null }
        : l
    );
    setLeads(newLeads);
    setStats((s) => (s ? { ...s, converted: newLeads.filter((l) => l.status === "converted").length } : s));
    try {
      await apiClient.patch<LeadRow>(`/api/v1/admin/leads/${id}`, { status });
    } catch {
      // reload on failure to resync
      apiClient.get<LeadRow[]>("/api/v1/admin/leads").then(setLeads).catch(() => {});
    }
  };

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const filteredLeads = useMemo(
    () =>
      refFilter.trim()
        ? leads.filter((l) => (l.referral_code || "").toLowerCase().includes(refFilter.trim().toLowerCase()))
        : leads,
    [leads, refFilter]
  );

  // Conversion breakdown per referral code (marketer credit at a glance).
  const byReferral = useMemo(() => {
    const m = new Map<string, { total: number; converted: number }>();
    for (const l of leads) {
      if (!l.referral_code) continue;
      const e = m.get(l.referral_code) || { total: 0, converted: 0 };
      e.total += 1;
      if (l.status === "converted") e.converted += 1;
      m.set(l.referral_code, e);
    }
    return [...m.entries()].sort((a, b) => b[1].total - a[1].total);
  }, [leads]);

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
  const genericList = tab === "feedback" ? feedback : tab === "contact" ? contact : [];

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Admin</h1>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Signups", value: stats?.users ?? 0 },
          { label: "Leads", value: stats?.leads ?? 0 },
          { label: "Converted", value: stats?.converted ?? 0 },
          { label: "Feedback", value: stats?.feedback ?? 0 },
          { label: "Contact", value: stats?.contact_requests ?? 0 },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-5">
            <div className="text-2xl font-semibold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex gap-2">
        {(["leads", "feedback", "contact", "users"] as const).map((t) => (
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

      {tab === "leads" ? (
        <div className="space-y-4">
          {byReferral.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">By referral code</p>
              <div className="flex flex-wrap gap-2">
                {byReferral.map(([code, c]) => (
                  <button
                    key={code}
                    onClick={() => setRefFilter(code)}
                    className="rounded-lg border border-border px-2.5 py-1 text-xs text-foreground hover:border-accent"
                    title="Filter to this code"
                  >
                    <span className="font-mono">{code}</span>{" "}
                    <span className="text-muted-foreground">{c.converted}/{c.total} converted</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              value={refFilter}
              onChange={(e) => setRefFilter(e.target.value)}
              placeholder="Filter by referral code…"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent/70 focus-visible:outline-none"
            />
            {refFilter && (
              <button onClick={() => setRefFilter("")} className="shrink-0 text-xs text-muted-foreground hover:text-foreground">
                Clear
              </button>
            )}
          </div>

          <div className="space-y-2">
            {filteredLeads.map((l) => {
              const isConverted = l.status === "converted";
              const isExpanded = expanded.has(l.id);
              return (
                <div key={l.id} className="rounded-lg border border-border bg-surface p-4 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">{l.name || "—"}</span>
                        <span className="text-muted-foreground">{l.email}</span>
                        {l.company && <span className="text-muted-foreground">· {l.company}</span>}
                        {l.phone && <span className="text-muted-foreground">· {l.phone}</span>}
                      </div>
                      <p
                        className={`mt-1.5 cursor-pointer text-foreground ${isExpanded ? "" : "line-clamp-2"}`}
                        onClick={() => toggleExpand(l.id)}
                        title="Click to expand/collapse"
                      >
                        {l.message}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {l.referral_code && (
                          <span className="rounded border border-border px-1.5 py-0.5 font-mono text-accent">{l.referral_code}</span>
                        )}
                        <span>{new Date(l.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          isConverted ? "bg-accent/15 text-accent" : "bg-surface-2 text-muted-foreground"
                        }`}
                      >
                        {l.status}
                      </span>
                      {isConverted ? (
                        <button
                          onClick={() => markStatus(l.id, "new")}
                          className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Undo
                        </button>
                      ) : (
                        <button
                          onClick={() => markStatus(l.id, "converted")}
                          className="rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent/20"
                        >
                          Mark converted
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredLeads.length === 0 && <p className="text-sm text-muted-foreground">No custom-plan leads yet.</p>}
          </div>
        </div>
      ) : (
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
            : genericList.map((r) => (
                <div key={r.id} className="rounded-lg border border-border bg-surface p-4 text-sm">
                  <p className="text-foreground">{r.message}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {r.name ? `${r.name} · ` : ""}{r.email || "anonymous"}
                    {r.page ? ` · ${r.page}` : ""} · {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
          {(tab === "users" ? users : genericList).length === 0 && (
            <p className="text-sm text-muted-foreground">Nothing here yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
