"use client";

import { useEffect, useRef } from "react";

interface AnimatedNoiseProps {
  opacity?: number;
  className?: string;
  /** `fixed` pins it to the viewport (one global overlay); the default
   * `absolute` scopes it to a `relative`-positioned parent section. */
  fixed?: boolean;
}

/** Subtle animated film-grain texture overlay (canvas-based static). Purely
 * decorative — respects prefers-reduced-motion by rendering one static frame
 * instead of continuously regenerating. */
export function AnimatedNoise({ opacity = 0.05, className, fixed = false }: AnimatedNoiseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationId: number;
    let frame = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth / 2;
      canvas.height = canvas.offsetHeight / 2;
    };

    const generateNoise = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
    };

    const animate = () => {
      frame++;
      if (frame % 2 === 0) {
        generateNoise();
      }
      animationId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    generateNoise();
    if (!reduceMotion) {
      animate();
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: fixed ? "fixed" : "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity,
        mixBlendMode: "overlay",
        zIndex: fixed ? 1 : undefined,
      }}
      aria-hidden="true"
    />
  );
}
