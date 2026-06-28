"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signupSchema, type SignupFormData } from "@/lib/validations";
import { apiClient, setStoredTokens } from "@/lib/api-client";
import type { TokenResponse } from "@/types/api";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setError(null);
    try {
      const tokens = await apiClient.post<TokenResponse>("/api/v1/auth/signup", {
        email: data.email,
        username: data.username,
        password: data.password,
        full_name: data.full_name || null,
      });
      setStoredTokens(tokens.access_token, tokens.refresh_token);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed";
      setError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Full Name</label>
        <Input placeholder="John Doe" {...register("full_name")} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Username</label>
        <Input placeholder="johndoe" {...register("username")} />
        {errors.username && <p className="text-xs text-red-400">{errors.username.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Email</label>
        <Input type="email" placeholder="you@example.com" {...register("email")} />
        {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Password</label>
        <Input type="password" placeholder="••••••••" {...register("password")} />
        {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Confirm Password</label>
        <Input type="password" placeholder="••••••••" {...register("confirmPassword")} />
        {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
      </div>

      {error && (
        <div className="animate-fade-in rounded-lg border border-red-900/60 bg-red-950/50 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
