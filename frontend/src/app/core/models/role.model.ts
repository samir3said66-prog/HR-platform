/**
 * Role & Permission Model
 * Role-based access control (RBAC) structures
 */

export type UserRole = 
  | 'admin' 
  | 'hr_director' 
  | 'hr_user' 
  | 'manager' 
  | 'employee' 
  | 'talent_acquisition' 
  | 'leadership';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'view' | 'create' | 'edit' | 'delete' | 'approve';
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
}

/**
 * Feature Access Control
 * Determines which features/routes a user can access
 */
export const FEATURE_ACCESS_MAP: Record<UserRole, string[]> = {
  admin: ['all'],
  hr_director: ['dashboard', 'employees', 'performance', 'reports', 'turnover', 'analytics', 'admin'],
  hr_user: ['dashboard', 'employees', 'performance', 'reports', 'recruitment'],
  manager: ['dashboard', 'employees', 'performance'],
  employee: ['dashboard', 'performance'],
  talent_acquisition: ['dashboard', 'recruitment', 'hiring'],
  leadership: ['dashboard', 'workforce', 'analytics'],
};
