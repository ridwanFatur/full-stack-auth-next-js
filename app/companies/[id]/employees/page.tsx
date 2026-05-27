"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmployeeCard from "@/components/employees/EmployeeCard";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getUser } from "@/lib/auth/session";
import { AuthUser } from "@/lib/auth/types";
import { companiesApi } from "@/lib/api/companies";
import { employeesApi } from "@/lib/api/employees";
import { Company, Employee } from "@/lib/types/hr";

export default function EmployeesPage() {
  const ready = useAuthGuard();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    setUser(getUser());

    Promise.all([
      companiesApi.get(params.id),
      employeesApi.list(params.id, 0, 200),
    ])
      .then(([comp, emp]) => {
        setCompany(comp);
        setEmployees(emp.items);
        setTotal(emp.total);
      })
      .catch(() => router.replace("/companies"))
      .finally(() => setLoading(false));
  }, [ready, params.id, router]);

  if (!ready || loading) {
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
        <Link href={`/companies/${params.id}`} className="hover:text-gray-700">
          {company?.name}
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-900">Employees</span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
          <p className="mt-1 text-sm text-gray-500">
            {total} {total === 1 ? "employee" : "employees"} in {company?.name}
          </p>
        </div>
        <Link
          href={`/companies/${params.id}/employees/new`}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Employee
        </Link>
      </div>

      {employees.length > 0 ? (
        <div className="flex flex-col gap-2">
          {employees.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} companyId={params.id} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-24 text-center shadow-sm ring-1 ring-gray-200">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <svg className="h-7 w-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="font-medium text-gray-900">No employees yet</p>
          <p className="mt-1 text-sm text-gray-500">Add your first employee to this company.</p>
          <Link
            href={`/companies/${params.id}/employees/new`}
            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Add Employee
          </Link>
        </div>
      )}
    </MainLayout>
  );
}
