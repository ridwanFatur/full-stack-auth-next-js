"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CredentialResponse } from "@react-oauth/google";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { isAuthenticated } from "@/lib/auth/session";

// Inner component that reads search params — must be inside Suspense
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  // Redirect already-authenticated users
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/");
    }
  }, [router]);

  // Show error from OAuth callback (e.g. ?error=auth_failed)
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "auth_failed") {
      setError("Google authentication failed. Please try again.");
    }
  }, [searchParams]);

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError("No credential received from Google. Please try again.");
      return;
    }

    // Temporarily store the Google ID token; /redirect/login will pick it up
    sessionStorage.setItem("google_credential", credentialResponse.credential);
    router.push("/redirect/login");
  };

  const handleGoogleError = () => {
    setError("Google sign-in was cancelled or failed. Please try again.");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to continue to your account
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        {/* Google Login Button */}
        <div className="flex flex-col items-center gap-4">
          <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-gray-400">
          By signing in you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  );
}

// Suspense wrapper required by Next.js when using useSearchParams
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
