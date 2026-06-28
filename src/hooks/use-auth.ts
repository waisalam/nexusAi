"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, clearStoredTokens } from "@/lib/api-client";
import type { UserResponse } from "@/types/api";

export function useAuth() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    apiClient
      .get<UserResponse>("/api/v1/users/me")
      .then(setUser)
      .catch(() => {
        clearStoredTokens();
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    clearStoredTokens();
    setUser(null);
    router.push("/login");
  };

  return { user, loading, logout };
}
