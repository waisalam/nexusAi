"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { ScrambleTextOnHover } from "@/components/scramble-text";
import { BitmapChevron } from "@/components/bitmap-chevron";

/** Early-access email capture. The product is still in development, so the landing
 * page leads with this instead of a hard signup. Posts to the public /waitlist
 * endpoint (no auth). `source` tags where the signup came from. */
export function WaitlistForm({ source = "landing" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || state !== "idle") return;
    setState("sending");
    try {
      await apiClient.post("/api/v1/waitlist", { email: email.trim(), source });
      setState("done");
    } catch {
      // Non-blocking: treat as success so a visitor is never stuck on the form.
      setState("done");
    }
  };

  if (state === "done") {
    return (
      <div className="flex items-center gap-3 border border-accent/40 bg-accent/10 px-5 py-4 font-mono text-xs uppercase tracking-widest text-accent">
        <Check className="h-4 w-4 shrink-0" />
        You&apos;re on the list — we&apos;ll email you when your early-access spot opens.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="min-w-0 flex-1 border border-foreground/20 bg-transparent px-4 py-3.5 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-accent focus-visible:outline-none"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="group inline-flex shrink-0 items-center justify-between gap-3 border border-foreground/20 bg-foreground px-6 py-3.5 font-mono text-xs uppercase tracking-widest text-background transition-all duration-200 hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
      >
        <ScrambleTextOnHover text={state === "sending" ? "Joining…" : "Join the waitlist"} duration={0.4} />
        <BitmapChevron className="transition-transform duration-400 ease-in-out group-hover:rotate-45" />
      </button>
    </form>
  );
}
