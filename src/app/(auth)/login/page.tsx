"use client";

import { OAuthButtons } from "@/components/auth/oauth-buttons";

export default function LoginPage() {
  return (
    <div>
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome to Nexus AI</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Sign in with GitHub to deploy your AI engineering team
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <OAuthButtons />
        <p className="text-center text-xs text-zinc-500">
          Nexus AI works directly on your GitHub repositories, so a GitHub account
          is required. We only request the access needed to open pull requests.
        </p>
      </div>
    </div>
  );
}
