/**
 * Role & Permission Constants
 * RBAC configuration constants
 */

export const ROLE_CONSTANTS = {
  // Available roles
  ROLES: {
    ADMIN: 'admin',
    HR_DIRECTOR: 'hr_director',
    HR_USER: 'hr_user',
    MANAGER: 'manager',
    EMPLOYEE: 'employee',
    TALENT_ACQUISITION: 'talent_acquisition',
    LEADERSHIP: 'leadership',
  },

  // Role descriptions
  ROLE_DESCRIPTIONS: {
    admin: 'System Administrator with full access',
    hr_director: 'HR Director with strategic access',
    hr_user: 'HR User with operational access',
    manager: 'Manager with team access',
    employee: 'Employee with limited personal access',
    talent_acquisition: 'Talent Acquisition with recruitment access',
    leadership: 'Leadership with strategic insights',
  },

  // Permissions
  PERMISSIONS: {
    VIEW: 'view',
    CREATE: 'create',
    EDIT: 'edit',
    DELETE: 'delete',
    APPROVE: 'approve',
    EXPORT: 'export',
  },

  // Resource access map
  RESOURCE_ACCESS: {
    EMPLOYEES: ['admin', 'hr_director', 'hr_user', 'manager'],
    PERFORMANCE: ['admin', 'hr_director', 'hr_user', 'manager'],
    PAYROLL: ['admin', 'hr_director'],
    RECRUITMENT: ['admin', 'hr_director', 'talent_acquisition'],
    REPORTS: ['admin', 'hr_director', 'hr_user', 'leadership'],
    ANALYTICS: ['admin', 'hr_director', 'leadership'],
    SETTINGS: ['admin'],
  },
};
