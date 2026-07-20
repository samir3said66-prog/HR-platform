/**
 * Payroll Feature Routes
 * Lazy-loaded routes for payroll management
 */

import { Routes } from '@angular/router';
import { authGuard, authorizationGuard } from '../../core';

export const PAYROLL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/payroll.component').then((m) => m.PayrollComponent),
    canActivate: [authGuard, authorizationGuard],
    data: {
      title: 'Payroll',
      roles: ['admin', 'hr_director'],
    },
  },
];
