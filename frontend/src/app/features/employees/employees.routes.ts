/**
 * Employees Feature Routes
 * Lazy-loaded routes for employees feature
 */

import { Routes } from '@angular/router';
import { authGuard, authorizationGuard } from '../../core';

export const EMPLOYEES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/employees/employees.component').then(
        (m) => m.EmployeesComponent
      ),
    canActivate: [authGuard, authorizationGuard],
    data: {
      title: 'Employees',
      description: 'Manage employees',
      roles: ['hr_user', 'manager', 'admin'],
    },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/employee-detail/employee-detail.component').then(
        (m) => m.EmployeeDetailComponent
      ),
    canActivate: [authGuard, authorizationGuard],
    data: {
      title: 'Employee Detail',
      roles: ['hr_user', 'manager', 'admin'],
    },
  },
];
