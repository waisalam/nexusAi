"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { getStoredReferral } from "@/components/referral-tracker";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!email.trim() || !message.trim() || sending) return;
    setSending(true);
    try {
      // Auto-attach the referral code stored from a ?ref= visit — the user never
      // types it; it silently credits the marketer who sent them.
      await apiClient.post("/api/v1/custom-plan", {
        name: name || undefined,
        email,
        company: company || undefined,
        phone: phone || undefined,
        message,
        referral_code: getStoredReferral() || undefined,
      });
      setDone(true);
    } catch {
      toast.error("Couldn't send that — please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        {done ? (
          <div className="border border-border bg-surface p-8 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center border border-accent/40 bg-accent/10 text-accent">
              <Check className="h-6 w-6" />
            </div>
            <h1 className="mb-2 font-(family-name:--font-bebas) text-4xl tracking-wide text-foreground">
              Request received
            </h1>
            <p className="font-mono text-xs text-muted-foreground">We&apos;ll email you at {email} soon.</p>
          </div>
        ) : (
          <div className="border border-border bg-surface p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">[ Plans / Custom ]</p>
            <h1 className="mt-4 font-(family-name:--font-bebas) text-5xl leading-none tracking-wide text-foreground">
              Get a custom plan
            </h1>
            <p className="mt-4 font-mono text-xs leading-relaxed text-muted-foreground">
              Want an autonomous engineer on your team? Tell us about your codebase and what you need,
              and we&apos;ll set you up — no card required.
            </p>
            <div className="mt-8 space-y-3">
              <Input placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
              <Input type="email" placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input placeholder="Company (optional)" value={company} onChange={(e) => setCompany(e.target.value)} />
              <Input type="tel" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <textarea
                placeholder="What do you need? (your stack, team size, the kind of tasks you'd hand off)"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full resize-none rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20"
              />
              <button
                disabled={sending || !email.trim() || !message.trim()}
                onClick={submit}
                className="w-full border border-foreground/20 bg-foreground px-6 py-3.5 font-mono text-xs uppercase tracking-widest text-background transition-all duration-200 hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                {sending ? "Sending…" : "Request custom plan"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
