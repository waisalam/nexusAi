"use client";

import { ByomCard } from "@/components/settings/byom-card";

/** Dedicated home for BYOM — connect your own provider and assign a specialist
 * model to each role of the AI team. (Also reachable from Settings.) */
export default function ModelsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Models</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Bring your own models: connect any OpenAI-compatible provider (DeepSeek, OpenAI,
          Groq, OpenRouter for Claude/Gemini) and assign a specialist model to each role of
          your AI team. Runs on your key are unlimited — they don&apos;t use free runs.
        </p>
      </div>
      <ByomCard />
    </div>
  );
}
