"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthUser } from "@/lib/auth/types";
import { clearSession, getRefreshToken } from "@/lib/auth/session";
import api from "@/lib/api/axios";
import Dialog from "@/components/ui/Dialog";

interface NavbarProps {
  user: AuthUser | null;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const openLogoutDialog = () => setDialogOpen(true);

  const closeLogoutDialog = () => {
    if (!loggingOut) setDialogOpen(false);
  };

  const handleLogoutConfirm = async () => {
    setLoggingOut(true);
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await api.post("/api/v1/auth/logout", { refresh_token: refreshToken });
      }
    } catch {
      // Proceed with local logout even if the API call fails
    } finally {
      clearSession();
      router.push("/login");
    }
  };

  return (
    <>
      <nav className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">App</span>

          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">{user.full_name}</span>
              <button
                onClick={openLogoutDialog}
                className="rounded-md px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Logout confirmation dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeLogoutDialog}
        title="Sign out"
        description="Are you sure you want to sign out of your account?"
        closeOnBackdrop={!loggingOut}
        actions={
          <>
            <button
              onClick={closeLogoutDialog}
              disabled={loggingOut}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleLogoutConfirm}
              disabled={loggingOut}
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 disabled:opacity-60"
            >
              {loggingOut && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {loggingOut ? "Signing out…" : "Sign out"}
            </button>
          </>
        }
      />
    </>
  );
}
