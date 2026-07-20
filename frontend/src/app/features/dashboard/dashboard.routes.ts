/**
 * Dashboard Feature Routes
 * Lazy-loaded routes for dashboard feature
 */

import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    data: { title: 'Dashboard', description: 'Main dashboard view' },
  },
];
