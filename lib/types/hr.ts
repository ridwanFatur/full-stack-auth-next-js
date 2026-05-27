// ============================================================
// Company
// ============================================================

export interface Company {
  id: string;
  user_id: string;
  name: string;
  legal_name?: string | null;
  company_code?: string | null;
  logo_url?: string | null;
  description?: string | null;
  business_type?: string | null;
  industry?: string | null;
  email?: string | null;
  phone_number?: string | null;
  website?: string | null;
  tax_number?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  employee_count?: number | null;
  founded_at?: string | null; // ISO date string
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyCreate {
  name: string;
  legal_name?: string;
  company_code?: string;
  logo_url?: string;
  description?: string;
  business_type?: string;
  industry?: string;
  email?: string;
  phone_number?: string;
  website?: string;
  tax_number?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  employee_count?: number;
  founded_at?: string;
  status?: string;
}

export type CompanyUpdate = Partial<CompanyCreate>;

export interface CompanyListResponse {
  items: Company[];
  total: number;
}

// ============================================================
// Employee
// ============================================================

export interface Employee {
  id: string;
  company_id: string;
  name: string;
  identity_number?: string | null;
  identity_type?: string | null;
  email?: string | null;
  phone_number?: string | null;
  gender?: string | null;
  birth_date?: string | null; // ISO date string
  address?: string | null;
  photo_url?: string | null;
  position?: string | null;
  department?: string | null;
  join_date?: string | null; // ISO date string
  end_date?: string | null;
  employment_status: string;
  salary?: number | null;
  salary_currency: string;
  emergency_contact?: string | null;
  emergency_contact_phone?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeCreate {
  name: string;
  identity_number?: string;
  identity_type?: string;
  email?: string;
  phone_number?: string;
  gender?: string;
  birth_date?: string;
  address?: string;
  photo_url?: string;
  position?: string;
  department?: string;
  join_date?: string;
  end_date?: string;
  employment_status?: string;
  salary?: number;
  salary_currency?: string;
  emergency_contact?: string;
  emergency_contact_phone?: string;
}

export type EmployeeUpdate = Partial<EmployeeCreate>;

export interface EmployeeListResponse {
  items: Employee[];
  total: number;
}
