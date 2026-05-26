"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { isAuthenticated, getUser } from "@/lib/auth/session";
import { AuthUser } from "@/lib/auth/types";
import api from "@/lib/api/axios";
import { withCache } from "@/lib/api/cache";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    const loadUser = async () => {
      try {
        // Populate immediately from localStorage while the API call is in-flight
        const cached = getUser();
        if (cached) {
          setUser(cached);
          setLoading(false);
        }

        // Fetch fresh data (cached for 30 s to avoid duplicate requests)
        const data = await withCache<AuthUser>("current_user", async () => {
          const res = await api.get<AuthUser>("/api/v1/users/me");
          return res.data;
        });

        setUser(data);
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="flex flex-col gap-6">
        {/* Welcome card */}
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome, {user?.full_name}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">{user?.email}</p>
        </div>

        {/* Account details card */}
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-4 text-lg font-medium text-gray-900">
            Account Details
          </h2>
          <dl className="space-y-3">
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-sm font-medium text-gray-500">
                Name
              </dt>
              <dd className="text-sm text-gray-900">{user?.full_name}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-sm font-medium text-gray-500">
                Email
              </dt>
              <dd className="text-sm text-gray-900">{user?.email}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-sm font-medium text-gray-500">
                User ID
              </dt>
              <dd className="font-mono text-sm text-gray-500">{user?.id}</dd>
            </div>
          </dl>
        </div>
      </div>
    </MainLayout>
  );
}
