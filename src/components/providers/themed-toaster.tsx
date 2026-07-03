"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/components/providers/theme-provider";

/** Keeps toast styling in sync with the light/dark toggle (not just system preference). */
export function ThemedToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme}
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
        },
      }}
    />
  );
}
