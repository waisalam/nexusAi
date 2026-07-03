"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!email.trim() || !message.trim() || sending) return;
    setSending(true);
    try {
      await apiClient.post("/api/v1/contact", { name: name || undefined, email, message });
      setDone(true);
    } catch {
      toast.error("Couldn't send that — please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        {done ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent">
              <Check className="h-6 w-6" />
            </div>
            <h1 className="mb-2 text-xl font-semibold text-foreground">Thanks — we&apos;ll be in touch</h1>
            <p className="text-sm text-muted-foreground">We got your request and will email you at {email} soon.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-8">
            <h1 className="mb-1 text-2xl font-semibold text-foreground">Get a custom plan</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              Out of free runs, or need more for your team? Tell us what you&apos;re building and we&apos;ll set you up.
            </p>
            <div className="space-y-3">
              <Input placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <textarea
                placeholder="What do you need? (team size, how you'd use it, rough volume)"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full resize-none rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20"
              />
              <Button
                variant="primary"
                className="w-full"
                disabled={sending || !email.trim() || !message.trim()}
                onClick={submit}
              >
                {sending ? "Sending…" : "Send request"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
