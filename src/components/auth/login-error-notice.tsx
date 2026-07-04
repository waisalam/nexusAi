"use client";

import { useSearchParams } from "next/navigation";

/** Surfaces an OAuth failure reason passed back as `?error=` (the backend
 * redirects to /login?error=... when GitHub sign-in fails). Rendered inside a
 * <Suspense> boundary by the login page (useSearchParams requirement). */
export function LoginErrorNotice() {
  const error = useSearchParams().get("error");
  if (!error) return null;
  return (
    <div className="border border-destructive/40 bg-destructive/10 px-4 py-3 font-mono text-xs text-destructive">
      GitHub sign-in failed: {decodeURIComponent(error)}
    </div>
  );
}
