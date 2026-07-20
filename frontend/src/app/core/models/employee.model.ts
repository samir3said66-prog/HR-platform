/**
 * Employee Model
 * Core employee-related interfaces
 */

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  manager?: string;
  hireDate: Date;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  salary?: number;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeListResponse {
  data: Employee[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EmployeeFilters {
  search?: string;
  department?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
