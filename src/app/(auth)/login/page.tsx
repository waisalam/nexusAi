import { Suspense } from "react";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { LoginErrorNotice } from "@/components/auth/login-error-notice";

export default function LoginPage() {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
        [ Access / Sign in ]
      </p>
      <h1 className="mt-4 font-(family-name:--font-bebas) text-5xl leading-none tracking-wide text-foreground sm:text-6xl">
        Welcome back
      </h1>
      <p className="mt-4 font-mono text-sm leading-relaxed text-muted-foreground">
        Sign in with GitHub to deploy your AI engineering team.
      </p>

      <div className="mt-10 space-y-4">
        <Suspense fallback={null}>
          <LoginErrorNotice />
        </Suspense>
        <OAuthButtons />
        <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
          Nexus AI works directly on your GitHub repositories, so a GitHub account
          is required. We only request the access needed to open pull requests.
        </p>
      </div>
    </div>
  );
}
