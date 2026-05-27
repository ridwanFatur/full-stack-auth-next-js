"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { isAuthenticated } from "@/lib/auth/session";

// Inner component uses useSearchParams — must live inside a Suspense boundary
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Start in "initializing" state — show spinner until we know auth status.
  // This prevents the login form from flashing for authenticated users.
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      // User is already logged in — redirect without ever showing the form
      router.replace("/");
      return;
    }

    // Not authenticated: check for error query param then reveal the form
    const errorParam = searchParams.get("error");
    if (errorParam === "auth_failed") {
      setError("Google authentication failed. Please try again.");
    }
    setInitializing(false);
  }, [router, searchParams]);

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">HR Manager</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage your companies and employees
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        {/* Google Login — full-page redirect, no popup */}
        <GoogleLoginButton />

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-400">
          By signing in you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  );
}

// Suspense is required by Next.js whenever useSearchParams is used in a page
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
