import { OAuthButtons } from "@/components/auth/oauth-buttons";

export default function SignupPage() {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">
        [ Access / Create account ]
      </p>
      <h1 className="mt-4 font-(family-name:--font-bebas) text-5xl leading-none tracking-wide text-foreground sm:text-6xl">
        Deploy your team
      </h1>
      <p className="mt-4 font-mono text-sm leading-relaxed text-muted-foreground">
        Continue with GitHub to spin up your first AI engineering team in minutes.
      </p>

      <div className="mt-10 space-y-4">
        <OAuthButtons />
        <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
          Nexus AI works directly on your GitHub repositories, so a GitHub account
          is required. We only request the access needed to open pull requests.
        </p>
      </div>
    </div>
  );
}
