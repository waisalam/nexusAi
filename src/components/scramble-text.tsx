"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

interface ScrambleTextOnHoverProps {
  text: string;
  as?: keyof React.JSX.IntrinsicElements;
  duration?: number;
  className?: string;
}

/** On hover, characters rapidly randomize then settle into the real text,
 * left to right ("hacker text" reveal). Re-triggers on every hover. */
export function ScrambleTextOnHover({ text, as = "span", duration = 0.6, className }: ScrambleTextOnHoverProps) {
  const [display, setDisplay] = useState(text);
  const frameRef = useRef<number | null>(null);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const scramble = useCallback(() => {
    if (reduceMotionRef.current) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    const start = performance.now();
    const durationMs = duration * 1000;
    const len = text.length;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      // Characters "lock in" left to right as progress advances.
      const settledCount = Math.floor(progress * len);

      let out = "";
      for (let i = 0; i < len; i++) {
        if (text[i] === " ") {
          out += " ";
        } else if (i < settledCount) {
          out += text[i];
        } else {
          out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }
      setDisplay(out);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
      }
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [text, duration]);

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const Tag = as as React.ElementType;
  return (
    <Tag className={className} onMouseEnter={scramble}>
      {display}
    </Tag>
  );
}
