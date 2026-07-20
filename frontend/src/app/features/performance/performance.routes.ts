/**
 * Performance Feature Routes
 * Lazy-loaded routes for performance management
 */

import { Routes } from '@angular/router';
import { authGuard, authorizationGuard } from '../../core';

export const PERFORMANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/performance/performance.component').then(
        (m) => m.PerformanceComponent
      ),
    canActivate: [authGuard, authorizationGuard],
    data: {
      title: 'Performance Management',
      roles: ['hr_user', 'manager', 'admin'],
    },
  },
];
