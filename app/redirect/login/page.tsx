"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { saveSession } from "@/lib/auth/session";
import { AuthTokens } from "@/lib/auth/types";
import api from "@/lib/api/axios";

export default function RedirectLoginPage() {
  const router = useRouter();
  const processed = useRef(false);

  useEffect(() => {
    // Guard against double invocation in React Strict Mode
    if (processed.current) return;
    processed.current = true;

    const handleCallback = async () => {
      // Read the Google credential stored by the login page
      const credential = sessionStorage.getItem("google_credential");
      sessionStorage.removeItem("google_credential");

      if (!credential) {
        // No credential — redirect back to login
        router.replace("/login");
        return;
      }

      try {
        const response = await api.post<AuthTokens>("/api/v1/auth/google/login", {
          id_token: credential,
        });

        // Persist tokens and user info
        saveSession(response.data);

        // Navigate to the home page
        router.replace("/");
      } catch {
        // Authentication failed — send back to login with error flag
        router.replace("/login?error=auth_failed");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-500">Signing you in…</p>
      </div>
    </div>
  );
}
