"use client";

import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export default function LoginPage() {
  return (
    <div>
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-zinc-400">Sign in to your Nexus AI account</p>
      </div>

      <div className="mt-8 space-y-4">
        <LoginForm />
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#08080a] px-3 text-zinc-600">or continue with</span>
          </div>
        </div>
        <OAuthButtons />
        <p className="text-center text-sm text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-red-400 hover:text-red-300 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
