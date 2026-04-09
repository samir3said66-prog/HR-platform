import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { authorizationGuard } from './guards/authorization.guard';

/**
 * Application Routes
 *
 * Configured with:
 * - Lazy loading for feature modules
 * - Route guards for authentication and authorization
 * - Smart preloading strategy
 *
 * Requirements: 11.4, 30.2, 30.3
 */
export const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: DashboardComponent,
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'employees',
        loadComponent: () =>
          import('./pages/employees/employees.component').then((m) => m.EmployeesComponent),
        canActivate: [authGuard, authorizationGuard],
        data: { roles: ['hr_user', 'manager', 'admin'] },
      },
      {
        path: 'performance',
        loadComponent: () =>
          import('./pages/performance/performance.component').then((m) => m.PerformanceComponent),
        canActivate: [authGuard, authorizationGuard],
        data: { roles: ['hr_user', 'manager', 'admin'] },
      },
      {
        path: 'workforce',
        loadComponent: () =>
          import('./pages/workforce/workforce.component').then((m) => m.WorkforceComponent),
        canActivate: [authGuard, authorizationGuard],
        data: { roles: ['leadership', 'admin'] },
      },
      {
        path: 'turnover',
        loadComponent: () =>
          import('./pages/turnover/turnover.component').then((m) => m.TurnoverComponent),
        canActivate: [authGuard, authorizationGuard],
        data: { roles: ['hr_director', 'admin'] },
      },
      {
        path: 'hiring-forecast',
        loadComponent: () =>
          import('./pages/hiring-forecast/hiring-forecast.component').then(
            (m) => m.HiringForecastComponent,
          ),
        canActivate: [authGuard, authorizationGuard],
        data: { roles: ['talent_acquisition', 'admin'] },
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/reports/reports.component').then((m) => m.ReportsComponent),
        canActivate: [authGuard, authorizationGuard],
        data: { roles: ['hr_user', 'hr_director', 'leadership', 'admin'] },
      },
    ],
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./pages/unauthorized/unauthorized.component').then((m) => m.UnauthorizedComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
