"use client";

import { useRouter } from "next/navigation";
import { AuthUser } from "@/lib/auth/types";
import { clearSession, getRefreshToken } from "@/lib/auth/session";
import api from "@/lib/api/axios";

interface NavbarProps {
  user: AuthUser | null;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await api.post("/api/v1/auth/logout", { refresh_token: refreshToken });
      }
    } catch {
      // Proceed with local logout even if the request fails
    } finally {
      clearSession();
      router.push("/login");
    }
  };

  return (
    <nav className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <span className="text-lg font-semibold text-gray-900">App</span>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user.profile_picture && (
                <img
                  src={user.profile_picture}
                  alt={user.full_name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              )}
              <span className="text-sm text-gray-700">{user.full_name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
