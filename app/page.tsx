"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getUser } from "@/lib/auth/session";
import { AuthUser } from "@/lib/auth/types";
import { companiesApi } from "@/lib/api/companies";
import { CompanyListResponse } from "@/lib/types/hr";
import CompanyCard from "@/components/companies/CompanyCard";

export default function DashboardPage() {
  const ready = useAuthGuard();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [companies, setCompanies] = useState<CompanyListResponse | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!ready) return;

    const cached = getUser();
    if (cached) setUser(cached);

    const fetchData = async () => {
      try {
        const [companiesData] = await Promise.all([
          companiesApi.list(0, 6),
        ]);
        setCompanies(companiesData);
      } catch {
        // Data will just be empty
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [ready]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <MainLayout user={user}>
      <div className="flex flex-col gap-6">
        {/* Welcome */}
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back{user ? `, ${user.full_name.split(" ")[0]}` : ""}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your companies and employees from one place.
          </p>
        </div>

        {/* Stats */}
        {!loadingData && companies && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Companies"
              value={companies.total}
              href="/companies"
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
              color="blue"
            />
            <StatCard
              label="Active Companies"
              value={companies.items.filter((c) => c.status === "active").length}
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="green"
            />
            <StatCard
              label="Total Headcount"
              value={companies.items.reduce(
                (sum, c) => sum + (c.employee_count ?? 0),
                0
              )}
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              color="purple"
            />
          </div>
        )}

        {/* Recent Companies */}
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Your Companies</h2>
            <Link
              href="/companies/new"
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Company
            </Link>
          </div>

          {loadingData ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="md" />
            </div>
          ) : companies && companies.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {companies.items.slice(0, 6).map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
              {companies.total > 6 && (
                <div className="mt-6 text-center">
                  <Link
                    href="/companies"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View all {companies.total} companies →
                  </Link>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="No companies yet"
              description="Create your first company to start managing employees."
              action={
                <Link
                  href="/companies/new"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Company
                </Link>
              }
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}

// ------------------------------------------------------------------ #
//  Sub-components                                                      #
// ------------------------------------------------------------------ #

interface StatCardProps {
  label: string;
  value: number;
  href?: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple";
}

const colorMap = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  purple: "bg-purple-50 text-purple-600",
};

function StatCard({ label, value, href, icon, color }: StatCardProps) {
  const inner = (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="transition hover:scale-[1.01]">
        {inner}
      </Link>
    );
  }
  return inner;
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <svg
          className="h-7 w-7 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      </div>
      <p className="font-medium text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
