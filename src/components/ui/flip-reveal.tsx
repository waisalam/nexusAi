"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FlipRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in ms applied once the card scrolls into view. */
  delay?: number;
}

/** Metallic card that flips/rotates into place as it scrolls into view
 * (IntersectionObserver-driven, no animation library). Pair with the
 * `.flip-wrap` perspective container on the parent grid. */
export function FlipReveal({ children, className, delay = 0 }: FlipRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("flip-card", visible && "is-visible", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
