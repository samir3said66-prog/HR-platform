export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  region: string;
  role: string;
  employmentStatus: 'active' | 'on-leave' | 'departed';
  hireDate: string;
  performanceScore?: number;
}

export interface EmployeeState {
  entities: { [id: string]: Employee };
  ids: string[];
  loading: boolean;
  error: string | null;
  selectedEmployeeId: string | null;
}

export const initialEmployeeState: EmployeeState = {
  entities: {},
  ids: [],
  loading: false,
  error: null,
  selectedEmployeeId: null,
};
