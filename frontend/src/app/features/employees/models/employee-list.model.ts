/**
 * Employee List Model
 * Models for employee list view and filtering
 */

export interface EmployeeListFilter {
  search?: string;
  department?: string;
  status?: string;
  manager?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface EmployeeListState {
  items: any[];
  total: number;
  loading: boolean;
  error?: string;
  filters: EmployeeListFilter;
  selectedIds: string[];
}
