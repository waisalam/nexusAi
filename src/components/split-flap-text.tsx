"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

const FLAP_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";

// --- Audio: a synthesized mechanical "tick" (filtered noise burst), so no
// audio asset needs to be bundled. Muted by default — browsers block audio
// before a user gesture anyway, and an unsolicited sound on page load is bad
// UX regardless. The AudioContext is created lazily on the first unmute
// interaction, which doubles as the required user-gesture unlock.
interface SplitFlapAudioCtx {
  muted: boolean;
  toggleMuted: () => void;
  playTick: () => void;
}

const AudioCtx = createContext<SplitFlapAudioCtx | null>(null);

export function SplitFlapAudioProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMuted] = useState(true);
  const ctxRef = useRef<AudioContext | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  const ensureContext = useCallback(() => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      ctxRef.current = ctx;
      // Pre-generate a short white-noise buffer to shape into a click.
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noiseBufferRef.current = buffer;
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((m) => {
      if (m) ensureContext(); // unmuting is the user gesture that unlocks audio
      return !m;
    });
  }, [ensureContext]);

  const playTick = useCallback(() => {
    if (muted || !ctxRef.current || !noiseBufferRef.current) return;
    const ctx = ctxRef.current;
    const source = ctx.createBufferSource();
    source.buffer = noiseBufferRef.current;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1400;
    filter.Q.value = 0.9;

    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
    source.stop(now + 0.05);
  }, [muted]);

  return <AudioCtx.Provider value={{ muted, toggleMuted, playTick }}>{children}</AudioCtx.Provider>;
}

function useSplitFlapAudio() {
  const ctx = useContext(AudioCtx);
  // Usable outside a provider too — just silent (no-op).
  return ctx || { muted: true, toggleMuted: () => {}, playTick: () => {} };
}

export function SplitFlapMuteToggle({ className }: { className?: string }) {
  const { muted, toggleMuted } = useSplitFlapAudio();
  return (
    <button
      type="button"
      onClick={toggleMuted}
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
      aria-pressed={!muted}
    >
      {muted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
      {muted ? "Sound off" : "Sound on"}
    </button>
  );
}

interface SplitFlapTextProps {
  text: string;
  speed?: number;
  className?: string;
}

/** Airport-departure-board letter reveal: each character cycles through random
 * glyphs before landing on the real one, staggered left to right. Plays once
 * on mount. Respects prefers-reduced-motion (renders the text immediately). */
export function SplitFlapText({ text, speed = 80, className }: SplitFlapTextProps) {
  const [display, setDisplay] = useState<string[]>(() => text.split(""));
  const { playTick } = useSplitFlapAudio();

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setDisplay(text.split(""));
      return;
    }

    const chars = text.split("");
    setDisplay(chars.map((c) => (c === " " ? " " : FLAP_CHARS[0])));

    const timers: ReturnType<typeof setTimeout>[] = [];
    const flapsPerChar = 6;

    chars.forEach((target, ci) => {
      if (target === " ") return;
      const startDelay = ci * (speed / 2);
      for (let f = 0; f < flapsPerChar; f++) {
        timers.push(
          setTimeout(() => {
            setDisplay((prev) => {
              const next = [...prev];
              const isLast = f === flapsPerChar - 1;
              next[ci] = isLast ? target : FLAP_CHARS[Math.floor(Math.random() * (FLAP_CHARS.length - 1))];
              return next;
            });
            if (f === flapsPerChar - 1) playTick();
          }, startDelay + f * speed)
        );
      }
    });

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed]);

  return (
    <span className={cn("inline-block font-mono", className)} aria-label={text}>
      {display.map((c, i) => (
        <span key={i} className="inline-block">
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );
}
