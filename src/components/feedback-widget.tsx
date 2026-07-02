"use client";

import { useState } from "react";
import { MessageSquarePlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";

// A small feedback launcher pinned to the bottom of every page. Posts to the public
// /feedback endpoint so any user (or a demo visitor) can tell us what broke.
export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      await apiClient.post("/api/v1/feedback", {
        message,
        email: email || undefined,
        page: typeof window !== "undefined" ? window.location.pathname : undefined,
      });
      toast.success("Thanks for the feedback! 🙏");
      setMessage("");
      setEmail("");
      setOpen(false);
    } catch {
      toast.error("Couldn't send feedback — please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open ? (
        <div className="w-80 rounded-xl border border-zinc-800 bg-[#121214] p-4 shadow-2xl shadow-black/50">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Send feedback</span>
            <button onClick={() => setOpen(false)} className="text-zinc-500 transition-colors hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What worked? What broke? What was confusing?"
            rows={4}
            className="mb-2 w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus-visible:border-red-500/70 focus-visible:outline-none"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional, if you'd like a reply)"
            className="mb-3 w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus-visible:border-red-500/70 focus-visible:outline-none"
          />
          <Button variant="primary" size="sm" className="w-full" disabled={sending || !message.trim()} onClick={submit}>
            {sending ? "Sending…" : "Send feedback"}
          </Button>
        </div>
      ) : (
        <Button variant="primary" size="sm" className="shadow-lg" onClick={() => setOpen(true)}>
          <MessageSquarePlus className="h-4 w-4" /> Feedback
        </Button>
      )}
    </div>
  );
}
