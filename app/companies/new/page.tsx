"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import CompanyForm from "@/components/companies/CompanyForm";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getUser } from "@/lib/auth/session";
import { companiesApi } from "@/lib/api/companies";
import { CompanyCreate, CompanyUpdate } from "@/lib/types/hr";

export default function NewCompanyPage() {
  const ready = useAuthGuard();
  const router = useRouter();
  const user = getUser();

  const handleSubmit = async (data: CompanyCreate | CompanyUpdate) => {
    const created = await companiesApi.create(data as CompanyCreate);
    router.push(`/companies/${created.id}`);
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <MainLayout user={user}>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/companies" className="hover:text-gray-700">
          Companies
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-900">New Company</span>
      </nav>

      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">New Company</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new company to start managing its employees.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <CompanyForm
            onSubmit={handleSubmit}
            onCancel={() => router.push("/companies")}
            submitLabel="Create Company"
          />
        </div>
      </div>
    </MainLayout>
  );
}
