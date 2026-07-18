"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";

interface ByomStatus {
  configured: boolean;
  base_url: string | null;
  api_key_hint: string | null;
}
interface ProjectRow {
  id: string;
  name: string;
  model_routing_json: Record<string, string> | null;
}

// Role slots — mirror backend model_routing.ROLES. One model per pipeline ROLE
// (never per agent): all coding agents share one model, so output stays consistent.
const ROLES: { key: string; label: string; hint: string }[] = [
  { key: "brain", label: "Brain", hint: "planning & contracts — strongest reasoning model (e.g. a reasoner/o-series)" },
  { key: "coder", label: "Coder", hint: "writes logic/backend files — strong code model" },
  { key: "designer", label: "Designer", hint: "writes UI components/styles — code model with strong frontend taste" },
  { key: "fixer", label: "Fixer", hint: "reads build errors, patches code — reasoning + code" },
  { key: "reviewer", label: "Reviewer", hint: "pre-build self-review — mid-tier is fine" },
  { key: "test_writer", label: "Test writer", hint: "companion tests — cheapest/fastest model" },
];

/** BYOM: connect your own OpenAI-compatible provider (DeepSeek, OpenAI, Groq,
 * OpenRouter → Claude/Gemini/…) and assign a model per pipeline role, per project.
 * Runs that use your key don't consume free runs. */
export function ByomCard() {
  const [status, setStatus] = useState<ByomStatus | null>(null);
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [models, setModels] = useState<string[]>([]);

  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [projectId, setProjectId] = useState("");
  const [routing, setRouting] = useState<Record<string, string>>({});
  const [savingRouting, setSavingRouting] = useState(false);

  useEffect(() => {
    apiClient.get<ByomStatus>("/api/v1/users/me/byom").then(setStatus).catch(() => {});
    apiClient
      .get<{ projects: ProjectRow[] }>("/api/v1/projects")
      .then((r) => {
        setProjects(r.projects);
        if (r.projects[0]) {
          setProjectId(r.projects[0].id);
          setRouting(r.projects[0].model_routing_json || {});
        }
      })
      .catch(() => {});
  }, []);

  const selectProject = (id: string) => {
    setProjectId(id);
    const p = projects.find((x) => x.id === id);
    setRouting(p?.model_routing_json || {});
  };

  const test = async () => {
    if (!baseUrl.trim() || !apiKey.trim()) return toast.error("Enter the base URL and API key first.");
    setTesting(true);
    try {
      const r = await apiClient.post<{ ok: boolean; models?: string[]; error?: string }>(
        "/api/v1/users/me/byom/test",
        { base_url: baseUrl, api_key: apiKey }
      );
      if (r.ok) {
        setModels(r.models || []);
        toast.success(`Connected — ${r.models?.length || 0} models available`);
      } else {
        toast.error(r.error || "Connection failed");
      }
    } catch {
      toast.error("Test failed — check the URL and key.");
    } finally {
      setTesting(false);
    }
  };

  const save = async () => {
    if (!baseUrl.trim() || !apiKey.trim()) return toast.error("Enter the base URL and API key first.");
    setSaving(true);
    try {
      const s = await apiClient.put<ByomStatus>("/api/v1/users/me/byom", {
        base_url: baseUrl,
        api_key: apiKey,
      });
      setStatus(s);
      setApiKey("");
      toast.success("Provider saved — key encrypted at rest");
    } catch {
      toast.error("Couldn't save the provider.");
    } finally {
      setSaving(false);
    }
  };

  const clear = async () => {
    try {
      const s = await apiClient.delete<ByomStatus>("/api/v1/users/me/byom");
      setStatus(s);
      toast.success("Provider removed");
    } catch {
      toast.error("Couldn't remove the provider.");
    }
  };

  const saveRouting = async () => {
    if (!projectId) return;
    setSavingRouting(true);
    try {
      await apiClient.patch(`/api/v1/projects/${projectId}`, { model_routing_json: routing });
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, model_routing_json: routing } : p))
      );
      toast.success("Model routing saved for this project");
    } catch {
      toast.error("Couldn't save routing.");
    } finally {
      setSavingRouting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-accent" /> Bring your own models
        </CardTitle>
        <CardDescription>
          Connect your own OpenAI-compatible provider (DeepSeek, OpenAI, Groq, OpenRouter for
          Claude/Gemini) and assign a model to each role of your AI team. Runs on your key
          don&apos;t use free runs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider */}
        <div className="space-y-3">
          {status?.configured && (
            <div className="flex items-center justify-between rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm">
              <span className="text-foreground">
                Connected: <span className="font-mono text-xs">{status.base_url}</span>{" "}
                <span className="text-muted-foreground">({status.api_key_hint})</span>
              </span>
              <Button variant="ghost" size="sm" onClick={clear} title="Remove provider">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Provider base URL</label>
            <Input
              placeholder="https://api.deepseek.com  ·  https://openrouter.ai/api  ·  https://api.openai.com"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">API key</label>
            <Input
              type="password"
              placeholder={status?.configured ? "Enter a new key to replace the saved one" : "sk-…"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Tip: create a <strong>fresh key just for Nexus</strong> with a small spend cap
              (e.g. $5) — you can revoke it anytime. Keys are AES-encrypted at rest, never
              logged, and only sent to your chosen provider.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={test} disabled={testing}>
              {testing ? "Testing…" : "Test connection"}
            </Button>
            <Button variant="primary" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save provider"}
            </Button>
          </div>
          {models.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Available: {models.slice(0, 8).join(", ")}
              {models.length > 8 ? ` +${models.length - 8} more` : ""}
            </p>
          )}
        </div>

        {/* Per-project role routing */}
        {projects.length > 0 && (
          <div className="space-y-3 border-t border-border pt-5">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-foreground">Role models for project</label>
              <select
                value={projectId}
                onChange={(e) => selectProject(e.target.value)}
                className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground focus-visible:border-accent/70 focus-visible:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2.5">
              {ROLES.map((r) => (
                <div key={r.key} className="grid grid-cols-[110px_1fr] items-center gap-3">
                  <span className="text-sm text-foreground">{r.label}</span>
                  <div>
                    <Input
                      placeholder="auto (platform default)"
                      value={routing[r.key] || ""}
                      onChange={(e) => setRouting((prev) => ({ ...prev, [r.key]: e.target.value }))}
                    />
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{r.hint}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="primary" onClick={saveRouting} disabled={savingRouting}>
              {savingRouting ? "Saving…" : "Save model routing"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Leave a role empty (or &quot;auto&quot;) to use the platform default. Routing only
              takes effect when a provider is connected above.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
