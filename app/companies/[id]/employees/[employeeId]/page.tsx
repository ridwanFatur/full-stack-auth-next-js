"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Badge, { employmentStatusVariant } from "@/components/ui/Badge";
import Dialog from "@/components/ui/Dialog";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getUser } from "@/lib/auth/session";
import { AuthUser } from "@/lib/auth/types";
import { companiesApi } from "@/lib/api/companies";
import { employeesApi } from "@/lib/api/employees";
import { Company, Employee } from "@/lib/types/hr";

export default function EmployeeDetailPage() {
  const ready = useAuthGuard();
  const params = useParams<{ id: string; employeeId: string }>();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ready) return;
    setUser(getUser());

    Promise.all([
      companiesApi.get(params.id),
      employeesApi.get(params.id, params.employeeId),
    ])
      .then(([comp, emp]) => {
        setCompany(comp);
        setEmployee(emp);
      })
      .catch(() => router.replace(`/companies/${params.id}`))
      .finally(() => setLoading(false));
  }, [ready, params.id, params.employeeId, router]);

  const handleDeleteConfirm = async () => {
    if (!employee) return;
    setDeleting(true);
    try {
      await employeesApi.delete(params.id, employee.id);
      router.push(`/companies/${params.id}`);
    } catch {
      setDeleting(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !employee) return;
    setPhotoUploading(true);
    try {
      const updated = await employeesApi.uploadPhoto(params.id, employee.id, file);
      setEmployee(updated);
    } catch {
      // silently fail
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!ready || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!employee) return null;

  const initials = employee.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join("");

  const fmt = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString() : null;
  const fmtCurrency = (amount?: number | null, currency?: string) =>
    amount != null
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency ?? "USD",
        }).format(amount)
      : null;

  return (
    <MainLayout user={user}>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/companies" className="hover:text-gray-700">Companies</Link>
        <span>/</span>
        <Link href={`/companies/${params.id}`} className="hover:text-gray-700">
          {company?.name}
        </Link>
        <span>/</span>
        <Link href={`/companies/${params.id}/employees`} className="hover:text-gray-700">
          Employees
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-900">{employee.name}</span>
      </nav>

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Photo */}
            <div className="relative">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-100 overflow-hidden ring-1 ring-gray-200">
                {photoUploading ? (
                  <LoadingSpinner size="sm" />
                ) : employee.photo_url ? (
                  <img src={employee.photo_url} alt={employee.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-blue-600">{initials}</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={photoUploading}
                title="Upload photo"
                className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white shadow ring-1 ring-gray-200 transition hover:bg-gray-50 disabled:cursor-not-allowed"
              >
                <svg className="h-3 w-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900">{employee.name}</h1>
                <Badge
                  label={employee.employment_status.replace("_", " ")}
                  variant={employmentStatusVariant(employee.employment_status)}
                />
              </div>
              {employee.position && (
                <p className="mt-0.5 text-sm text-gray-600">{employee.position}</p>
              )}
              {employee.department && (
                <p className="mt-0.5 text-sm text-gray-400">{employee.department}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 gap-2">
              <Link
                href={`/companies/${params.id}/employees/${employee.id}/edit`}
                className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Edit
              </Link>
              <button
                onClick={() => setDeleteDialogOpen(true)}
                className="cursor-pointer rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2 lg:grid-cols-3">
            {employee.email && <DetailItem label="Email" value={employee.email} />}
            {employee.phone_number && <DetailItem label="Phone" value={employee.phone_number} />}
            {employee.identity_type && employee.identity_number && (
              <DetailItem label={employee.identity_type} value={employee.identity_number} />
            )}
            {employee.gender && <DetailItem label="Gender" value={employee.gender} />}
            {fmt(employee.birth_date) && <DetailItem label="Date of Birth" value={fmt(employee.birth_date)!} />}
            {fmt(employee.join_date) && <DetailItem label="Join Date" value={fmt(employee.join_date)!} />}
            {fmt(employee.end_date) && <DetailItem label="End Date" value={fmt(employee.end_date)!} />}
            {fmtCurrency(employee.salary, employee.salary_currency) && (
              <DetailItem label="Salary" value={fmtCurrency(employee.salary, employee.salary_currency)!} />
            )}
            {employee.address && <DetailItem label="Address" value={employee.address} />}
            {employee.emergency_contact && (
              <DetailItem
                label="Emergency Contact"
                value={
                  <>
                    {employee.emergency_contact}
                    {employee.emergency_contact_phone && (
                      <span className="ml-2 text-gray-400">
                        · {employee.emergency_contact_phone}
                      </span>
                    )}
                  </>
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Delete dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => { if (!deleting) setDeleteDialogOpen(false); }}
        title="Delete Employee"
        description={`Are you sure you want to remove "${employee.name}" from ${company?.name}? This action cannot be undone.`}
        closeOnBackdrop={!deleting}
        actions={
          <>
            <button
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </>
        }
      />
    </MainLayout>
  );
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  );
}
