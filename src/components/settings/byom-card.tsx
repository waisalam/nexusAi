"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, ChevronDown, KeyRound, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface ProviderRow {
  id: string;
  name: string;
  base_url: string;
  api_key_hint: string;
}
interface ProjectRow {
  id: string;
  name: string;
  model_routing_json: Record<string, string> | null;
}

/** Provider presets — pick a name, paste a key; no raw URLs to know. All are
 * OpenAI-compatible (our runtime speaks that format). Claude/Gemini go through
 * OpenRouter (Anthropic's own API is NOT OpenAI-compatible — don't list it). */
const PRESETS: { key: string; name: string; baseUrl: string; desc: string; keyUrl: string; recommended?: boolean }[] = [
  {
    key: "openrouter",
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api",
    desc: "One key for GPT, Claude, Gemini, DeepSeek, Llama — every major model.",
    keyUrl: "openrouter.ai/keys",
    recommended: true,
  },
  {
    key: "deepseek",
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com",
    desc: "Cheap and strong code models (what Nexus uses by default).",
    keyUrl: "platform.deepseek.com",
  },
  {
    key: "openai",
    name: "OpenAI",
    baseUrl: "https://api.openai.com",
    desc: "GPT models directly from OpenAI.",
    keyUrl: "platform.openai.com/api-keys",
  },
  {
    key: "groq",
    name: "Groq",
    baseUrl: "https://api.groq.com/openai",
    desc: "Very fast open models (Llama, Mixtral).",
    keyUrl: "console.groq.com/keys",
  },
  {
    key: "custom",
    name: "Custom",
    baseUrl: "",
    desc: "Any other OpenAI-compatible endpoint (self-hosted, vLLM, LiteLLM…).",
    keyUrl: "",
  },
];

const ROLES: { key: string; label: string; hint: string }[] = [
  { key: "brain", label: "Brain", hint: "planning & task breakdown — best reasoning model" },
  { key: "coder", label: "Coder", hint: "writes logic/backend code" },
  { key: "designer", label: "Designer", hint: "writes UI components & styles" },
  { key: "fixer", label: "Fixer", hint: "fixes build errors" },
  { key: "reviewer", label: "Reviewer", hint: "reviews code before building" },
  { key: "test_writer", label: "Test writer", hint: "writes tests — cheapest model is fine" },
];

/** Grouped model picker across ALL connected providers. Values are stored as
 * "providerId::model" so each role can use a different provider's key. */
function ModelSelect({
  value,
  onChange,
  groups,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  groups: { provider: ProviderRow; models: string[] }[];
  placeholder: string;
}) {
  const hasAny = groups.some((g) => g.models.length > 0);
  if (!hasAny) {
    return <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />;
  }
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:border-accent/70 focus-visible:outline-none"
    >
      <option value="">{placeholder}</option>
      {groups.map((g) =>
        g.models.length > 0 ? (
          <optgroup key={g.provider.id} label={g.provider.name}>
            {g.models.map((m) => (
              <option key={`${g.provider.id}::${m}`} value={`${g.provider.id}::${m}`}>
                {m}
              </option>
            ))}
          </optgroup>
        ) : null
      )}
    </select>
  );
}

export function ByomCard() {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [modelsByProvider, setModelsByProvider] = useState<Record<string, string[]>>({});

  // Add-provider flow state
  const [adding, setAdding] = useState(false);
  const [presetKey, setPresetKey] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [customName, setCustomName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [connecting, setConnecting] = useState(false);

  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [projectId, setProjectId] = useState("");
  const [defaultModel, setDefaultModel] = useState("");
  const [routing, setRouting] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savingRouting, setSavingRouting] = useState(false);

  const preset = PRESETS.find((p) => p.key === presetKey);

  const loadModelsFor = (rows: ProviderRow[]) => {
    for (const p of rows) {
      apiClient
        .get<{ ok: boolean; models: string[] }>(`/api/v1/users/me/providers/${p.id}/models`)
        .then((r) => {
          if (r.ok) setModelsByProvider((prev) => ({ ...prev, [p.id]: r.models }));
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    apiClient
      .get<ProviderRow[]>("/api/v1/users/me/providers")
      .then((rows) => {
        setProviders(rows);
        loadModelsFor(rows);
      })
      .catch(() => {});
    apiClient
      .get<{ projects: ProjectRow[] }>("/api/v1/projects")
      .then((r) => {
        setProjects(r.projects);
        if (r.projects[0]) selectProjectRow(r.projects[0]);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectProjectRow = (p: ProjectRow) => {
    setProjectId(p.id);
    const r = p.model_routing_json || {};
    setRouting(r);
    const vals = Object.values(r).filter((v) => v && v.toLowerCase() !== "auto");
    setDefaultModel(vals.length > 0 && vals.every((v) => v === vals[0]) ? vals[0] : "");
    setShowAdvanced(vals.length > 0 && !vals.every((v) => v === vals[0]));
  };

  const connect = async () => {
    const baseUrl = preset?.key === "custom" ? customUrl : preset?.baseUrl || "";
    const name = preset?.key === "custom" ? customName || "Custom" : preset?.name || "Provider";
    if (!baseUrl.trim() || !apiKey.trim()) {
      return toast.error(preset?.key === "custom" ? "Enter the base URL and your API key." : "Paste your API key first.");
    }
    setConnecting(true);
    try {
      const r = await apiClient.post<{
        ok: boolean;
        provider?: ProviderRow;
        models?: string[];
        error?: string;
      }>("/api/v1/users/me/providers", { name, base_url: baseUrl, api_key: apiKey });
      if (!r.ok || !r.provider) {
        toast.error(r.error || "That key didn't work — check it and try again.");
        return;
      }
      setProviders((prev) => [...prev, r.provider!]);
      setModelsByProvider((prev) => ({ ...prev, [r.provider!.id]: r.models || [] }));
      setAdding(false);
      setPresetKey("");
      setApiKey("");
      setCustomUrl("");
      setCustomName("");
      toast.success(`${name} connected — ${r.models?.length || 0} models available`);
    } catch {
      toast.error("Couldn't connect — check the key and try again.");
    } finally {
      setConnecting(false);
    }
  };

  const removeProvider = async (id: string) => {
    try {
      await apiClient.delete(`/api/v1/users/me/providers/${id}`);
      setProviders((prev) => prev.filter((p) => p.id !== id));
      toast.success("Provider removed");
    } catch {
      toast.error("Couldn't remove the provider.");
    }
  };

  const saveModels = async () => {
    if (!projectId) return;
    setSavingRouting(true);
    try {
      // Simple mode: ONE choice → every role. Advanced overrides win per role.
      const finalRouting: Record<string, string> = {};
      for (const r of ROLES) {
        const override = showAdvanced ? (routing[r.key] || "").trim() : "";
        finalRouting[r.key] = override || defaultModel.trim();
      }
      await apiClient.patch(`/api/v1/projects/${projectId}`, { model_routing_json: finalRouting });
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, model_routing_json: finalRouting } : p))
      );
      toast.success("Models saved for this project");
    } catch {
      toast.error("Couldn't save.");
    } finally {
      setSavingRouting(false);
    }
  };

  const groups = providers.map((p) => ({ provider: p, models: modelsByProvider[p.id] || [] }));

  return (
    <Card>
      <CardContent className="space-y-8 p-6 sm:p-8">
        {/* ── 01 · Providers ────────────────────────────────────────── */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">[ 01 · Providers ]</p>
          <h3 className="mt-2 text-base font-semibold text-foreground">Your model providers</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect one or more providers — e.g. OpenRouter for Claude on design work and
            DeepSeek for coding. Each role below can use any connected provider&apos;s models.
          </p>

          {providers.length > 0 && (
            <div className="mt-4 space-y-2">
              {providers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5"
                >
                  <div className="flex items-center gap-2.5 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-accent" />
                    <span className="text-foreground">
                      <span className="font-medium">{p.name}</span>{" "}
                      <span className="font-mono text-xs text-muted-foreground">({p.api_key_hint})</span>
                      {(modelsByProvider[p.id]?.length ?? 0) > 0 && (
                        <span className="text-muted-foreground"> · {modelsByProvider[p.id].length} models</span>
                      )}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeProvider(p.id)} title="Remove provider">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {!adding ? (
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setAdding(true)}>
              <Plus className="h-3.5 w-3.5" /> {providers.length ? "Add another provider" : "Connect a provider"}
            </Button>
          ) : (
            <div className="mt-4 rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Pick a provider</p>
                <button onClick={() => { setAdding(false); setPresetKey(""); }} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPresetKey(p.key)}
                    className={cn(
                      "relative flex flex-col items-start rounded-xl border p-3.5 text-left transition-all",
                      presetKey === p.key
                        ? "border-accent bg-accent/10"
                        : "border-border bg-background hover:border-muted-foreground"
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{p.name}</span>
                      {p.recommended && (
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-accent">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.desc}</p>
                  </button>
                ))}
              </div>
              <p className="mt-2.5 text-xs text-muted-foreground">
                Want Claude or Gemini? Pick <strong className="text-foreground">OpenRouter</strong> —
                Anthropic/Google keys aren&apos;t OpenAI-compatible directly; OpenRouter gives you all
                of them with one key.
              </p>

              {preset && (
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  {preset.keyUrl && (
                    <p className="text-sm text-muted-foreground">
                      Get a key at <span className="font-mono text-xs text-foreground">{preset.keyUrl}</span> —
                      create a <strong className="text-foreground">fresh key with a small spend cap</strong> (e.g.
                      $5); revoke it anytime.
                    </p>
                  )}
                  {preset.key === "custom" && (
                    <>
                      <Input placeholder="Name (e.g. My vLLM server)" value={customName} onChange={(e) => setCustomName(e.target.value)} />
                      <Input
                        placeholder="Base URL, e.g. https://my-host.com (must serve /v1/chat/completions)"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                      />
                    </>
                  )}
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="sk-…"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="primary" onClick={connect} disabled={connecting}>
                      <KeyRound className="h-3.5 w-3.5" /> {connecting ? "Connecting…" : "Connect"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We verify the key with the provider, then store it AES-encrypted. It&apos;s never
                    logged and only ever sent to that provider. Runs on your keys don&apos;t use free runs.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── 02 · Models ───────────────────────────────────────────── */}
        {providers.length > 0 && (
          <div className="animate-fade-up border-t border-border pt-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">[ 02 · Models ]</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-foreground">Which models should your team use?</h3>
              {projects.length > 1 && (
                <select
                  value={projectId}
                  onChange={(e) => {
                    const p = projects.find((x) => x.id === e.target.value);
                    if (p) selectProjectRow(p);
                  }}
                  className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground focus-visible:border-accent/70 focus-visible:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>

            {projects.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Connect a repository first — then choose models for it here.
              </p>
            ) : (
              <>
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium text-foreground">Default model (whole team)</label>
                  <ModelSelect
                    value={defaultModel}
                    onChange={setDefaultModel}
                    groups={groups}
                    placeholder="Auto — Nexus platform default"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave on Auto to use our default models, or pick one of yours — every role uses it.
                  </p>
                </div>

                <button
                  onClick={() => setShowAdvanced((s) => !s)}
                  className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showAdvanced && "rotate-180")} />
                  Advanced: different model per role
                </button>

                {showAdvanced && (
                  <div className="mt-3 space-y-3 rounded-xl border border-border bg-surface p-4">
                    <p className="text-xs text-muted-foreground">
                      Optional — mix providers freely: e.g. Claude (OpenRouter) for the Designer,
                      DeepSeek for the Coder, the cheapest model for tests. Empty = default model above.
                    </p>
                    {ROLES.map((r) => (
                      <div key={r.key} className="grid grid-cols-[110px_1fr] items-center gap-3">
                        <div>
                          <span className="text-sm text-foreground">{r.label}</span>
                          <p className="text-[10px] leading-tight text-muted-foreground">{r.hint}</p>
                        </div>
                        <ModelSelect
                          value={routing[r.key] || ""}
                          onChange={(v) => setRouting((prev) => ({ ...prev, [r.key]: v }))}
                          groups={groups}
                          placeholder="Use default model"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <Button variant="primary" className="mt-4" onClick={saveModels} disabled={savingRouting}>
                  {savingRouting ? "Saving…" : "Save models"}
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
