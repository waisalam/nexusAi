"use client";

import type React from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

// Marketing pages only. The dashboard/admin are working apps — inertial scroll there
// makes log panes and long lists feel laggy and fights native scrolling. Native
// scroll for app surfaces, Lenis for the editorial pages.
const APP_PREFIXES = ["/dashboard", "/admin"];

/** Inertial smooth-scroll (Lenis), synced to GSAP's ticker so ScrollTrigger-driven
 * animations (HighlightText, the hero fade) stay in step with the scroll position.
 * Skipped entirely under prefers-reduced-motion — native scroll is used instead. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isApp = APP_PREFIXES.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (isApp) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(raf);
    };
  }, [isApp]);

  return <>{children}</>;
}
