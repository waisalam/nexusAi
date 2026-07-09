"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";

const KEY = "nx_ref";
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/** URL-safe + bounded, so a hostile ?ref= can't inject anything downstream. */
function sanitize(code: string): string {
  return code.trim().slice(0, 64).replace(/[^a-zA-Z0-9_-]/g, "");
}

/** The stored referral code (or null), respecting the 30-day expiry. Read by the
 * custom-plan form so the marketer's code is auto-attached without the user typing it. */
export function getStoredReferral(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { code, exp } = JSON.parse(raw) as { code?: string; exp?: number };
    if (!code || !exp || Date.now() > exp) {
      localStorage.removeItem(KEY);
      return null;
    }
    return code;
  } catch {
    return null;
  }
}

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem("nx_sid");
    if (!id) {
      id = (crypto.randomUUID?.() || String(Math.random())).slice(0, 64);
      sessionStorage.setItem("nx_sid", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

/** Captures ?ref=<code> on ANY page, persists it for 30 days (so it survives the
 * visitor browsing around before contacting), and logs the visit once per session
 * for funnel visibility. Renders nothing. Mount once in the root layout. */
export function ReferralTracker() {
  const params = useSearchParams();

  useEffect(() => {
    const raw = params.get("ref");
    if (!raw) return;
    const code = sanitize(raw);
    if (!code) return;

    // Persist (localStorage for the form + a cookie in case of later server reads).
    localStorage.setItem(KEY, JSON.stringify({ code, exp: Date.now() + TTL_MS }));
    document.cookie = `nx_ref=${code}; max-age=${TTL_MS / 1000}; path=/; SameSite=Lax`;

    // Log the visit once per browser session per code (don't spam on navigation).
    const flag = `nx_ref_logged_${code}`;
    if (!sessionStorage.getItem(flag)) {
      sessionStorage.setItem(flag, "1");
      apiClient
        .post("/api/v1/referral/visit", {
          referral_code: code,
          page_url: window.location.pathname,
          session_id: getSessionId(),
        })
        .catch(() => {});
    }
  }, [params]);

  return null;
}
