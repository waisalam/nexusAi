"use client";

import { useRef, useEffect, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

interface HighlightTextProps {
  children: ReactNode;
  className?: string;
}

/** A highlighter-style accent bar sweeps in behind the text as it scrolls
 * into view, with the text inverting to --accent-foreground on top of it. */
export function HighlightText({ children, className = "" }: HighlightTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current || !highlightRef.current || !textRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // A single timeline drives BOTH the box reveal and the text color invert,
      // at the same start/duration, so they always finish together — no second,
      // independently-scrubbed tween touches the box's transform (that used to
      // cause the box to drift out of alignment with the text on scroll, and
      // could leave the color invert stuck mid-transition, hiding the text).
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          end: "top 40%",
          toggleActions: "play reverse play reverse",
        },
      });
      tl.fromTo(
        highlightRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, ease: "power3.out" },
        0
      );
      tl.fromTo(
        textRef.current,
        { color: "var(--foreground)" },
        { color: "var(--accent-foreground)", duration: 0.8, ease: "power3.out" },
        0
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <span ref={containerRef} className={`relative inline-block ${className}`}>
      <span
        ref={highlightRef}
        className="absolute inset-0 origin-left scale-x-0 bg-accent"
        style={{
          left: "-0.1em",
          right: "-0.1em",
          top: "0.15em",
          bottom: "0.1em",
        }}
      />
      <span ref={textRef} className="relative z-10">
        {children}
      </span>
    </span>
  );
}
