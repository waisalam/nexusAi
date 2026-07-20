"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  BrainCircuit, Code2, FlaskConical, KeyRound, Loader2, Palette, ShieldCheck, Wrench, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

/** The Studio team builder — six agent cards, each assignable to any connected
 * provider + model ("providerId::model"). Self-contained: fetches providers,
 * loads model lists, handles inline provider connect (key asked once, shared by
 * all cards). Used by the Studio wizard AND the project workspace (swap agents
 * anytime between builds). */

interface ProviderRow {
  id: string;
  name: string;
  base_url: string;
  api_key_hint: string;
}

const PRESETS = [
  { key: "openrouter", name: "OpenRouter", baseUrl: "https://openrouter.ai/api", keyUrl: "openrouter.ai/keys", recommended: true },
  { key: "deepseek", name: "DeepSeek", baseUrl: "https://api.deepseek.com", keyUrl: "platform.deepseek.com" },
  { key: "openai", name: "OpenAI", baseUrl: "https://api.openai.com", keyUrl: "platform.openai.com/api-keys" },
  { key: "groq", name: "Groq", baseUrl: "https://api.groq.com/openai", keyUrl: "console.groq.com/keys" },
  { key: "custom", name: "Custom", baseUrl: "", keyUrl: "" },
];

export const AGENT_ROLES: {
  key: string;
  name: string;
  duty: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "brain", name: "Brain", duty: "Reads your repo, splits the work, writes the plan every agent follows.", icon: BrainCircuit },
  { key: "coder", name: "Coder", duty: "Writes the logic and backend code.", icon: Code2 },
  { key: "designer", name: "Designer", duty: "Writes the UI — components, layouts, styles. Tip: a vision model here (Claude/GPT/Gemini via OpenRouter) unlocks Visual QA — it screenshots your app and fixes what looks off.", icon: Palette },
  { key: "fixer", name: "Fixer", duty: "Reads build errors and patches them until green.", icon: Wrench },
  { key: "reviewer", name: "Reviewer", duty: "Reviews the work before anything is built.", icon: ShieldCheck },
  { key: "test_writer", name: "Test writer", duty: "Writes the tests that prove it works.", icon: FlaskConical },
];

export function TeamEditor({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (routing: Record<string, string>) => void;
}) {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [modelsByProvider, setModelsByProvider] = useState<Record<string, string[]>>({});
  const [roleProvider, setRoleProvider] = useState<Record<string, string>>(() => {
    // Seed provider selection from existing "pid::model" values so saved teams render.
    const seed: Record<string, string> = {};
    for (const [role, v] of Object.entries(value || {})) {
      if (v.includes("::")) seed[role] = v.split("::")[0];
    }
    return seed;
  });
  const [connectingRole, setConnectingRole] = useState<string | null>(null);
  const [presetKey, setPresetKey] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    apiClient.get<ProviderRow[]>("/api/v1/users/me/providers").then((rows) => {
      setProviders(rows);
      for (const p of rows) loadModels(p.id);
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadModels = (pid: string) => {
    apiClient
      .get<{ ok: boolean; models: string[] }>(`/api/v1/users/me/providers/${pid}/models`)
      .then((r) => r.ok && setModelsByProvider((prev) => ({ ...prev, [pid]: r.models })))
      .catch(() => {});
  };

  const setRole = (role: string, v: string) => onChange({ ...value, [role]: v });

  const connectProvider = async () => {
    const preset = PRESETS.find((p) => p.key === presetKey);
    const baseUrl = preset?.key === "custom" ? customUrl : preset?.baseUrl || "";
    if (!baseUrl.trim() || !apiKey.trim()) return toast.error("Pick a provider and paste your API key.");
    setConnecting(true);
    try {
      const r = await apiClient.post<{ ok: boolean; provider?: ProviderRow; models?: string[]; error?: string }>(
        "/api/v1/users/me/providers",
        { name: preset?.key === "custom" ? "Custom" : preset?.name || "Provider", base_url: baseUrl, api_key: apiKey }
      );
      if (!r.ok || !r.provider) return toast.error(r.error || "That key didn't work.");
      setProviders((prev) => [...prev, r.provider!]);
      setModelsByProvider((prev) => ({ ...prev, [r.provider!.id]: r.models || [] }));
      if (connectingRole) setRoleProvider((prev) => ({ ...prev, [connectingRole]: r.provider!.id }));
      setConnectingRole(null);
      setPresetKey("");
      setApiKey("");
      setCustomUrl("");
      toast.success(`${r.provider.name} connected — ${r.models?.length || 0} models`);
    } catch {
      toast.error("Couldn't connect — check the key.");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {AGENT_ROLES.map((role, idx) => {
        const v = value[role.key] || "";
        const selectedPid = roleProvider[role.key] || (v.includes("::") ? v.split("::")[0] : "");
        const models = selectedPid ? modelsByProvider[selectedPid] || [] : [];
        const configured = v.length > 0;
        return (
          <div
            key={role.key}
            style={{ animationDelay: `${idx * 60}ms` }}
            className={cn(
              "animate-fade-up relative overflow-hidden rounded-2xl border p-5 transition-all",
              configured ? "border-accent/50 bg-accent/5" : "border-border bg-surface",
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className={cn("icon-chip", configured && "border-accent/50 text-accent")}>
                  <role.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-(family-name:--font-bebas) text-xl tracking-wide text-foreground">{role.name}</p>
                  <p className="text-[11px] leading-tight text-muted-foreground">{role.duty}</p>
                </div>
              </div>
              <span className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest",
                configured ? "bg-accent/15 text-accent" : "border border-border text-muted-foreground",
              )}>
                {configured ? "Ready" : "Auto"}
              </span>
            </div>

            {/* Provider chips */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {providers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setRoleProvider((prev) => ({ ...prev, [role.key]: p.id }));
                    setRole(role.key, "");
                    if (!modelsByProvider[p.id]) loadModels(p.id);
                  }}
                  className={cn(
                    "rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-all",
                    selectedPid === p.id
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground",
                  )}
                >
                  {p.name}
                </button>
              ))}
              <button
                onClick={() => { setConnectingRole(connectingRole === role.key ? null : role.key); setPresetKey(""); }}
                className="rounded-full border border-dashed border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              >
                + Provider
              </button>
              {configured && (
                <button
                  onClick={() => {
                    setRole(role.key, "");
                    setRoleProvider((prev) => ({ ...prev, [role.key]: "" }));
                  }}
                  title="Reset to Auto"
                  className="rounded-full border border-border px-2 py-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Inline provider connect */}
            {connectingRole === role.key && (
              <div className="mt-3 rounded-xl border border-border bg-background p-3.5">
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setPresetKey(p.key)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider",
                        presetKey === p.key ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {p.name}{p.recommended ? " ★" : ""}
                    </button>
                  ))}
                </div>
                {presetKey && (
                  <div className="mt-3 space-y-2">
                    {presetKey === "custom" && (
                      <Input placeholder="Base URL (serves /v1/chat/completions)" value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} />
                    )}
                    <div className="flex gap-2">
                      <Input type="password" placeholder="sk-… (fresh key, small spend cap)" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="flex-1" />
                      <Button variant="primary" size="sm" onClick={connectProvider} disabled={connecting}>
                        <KeyRound className="h-3.5 w-3.5" /> {connecting ? "…" : "Connect"}
                      </Button>
                    </div>
                    {PRESETS.find((p) => p.key === presetKey)?.keyUrl && (
                      <p className="text-[10px] text-muted-foreground">
                        Key from <span className="font-mono text-foreground">{PRESETS.find((p) => p.key === presetKey)!.keyUrl}</span> · encrypted at rest · revoke anytime
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Model dropdown */}
            {selectedPid && (
              <div className="mt-3">
                {models.length > 0 ? (
                  <select
                    value={v}
                    onChange={(e) => setRole(role.key, e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:border-accent/70 focus-visible:outline-none"
                  >
                    <option value="">Choose a model…</option>
                    {models.map((m) => (
                      <option key={m} value={`${selectedPid}::${m}`}>{m}</option>
                    ))}
                  </select>
                ) : (
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> Loading models…
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
