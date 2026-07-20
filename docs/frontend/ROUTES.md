# Routing Guide

All routes are defined in `src/app/app.routes.ts` and delegated to feature route files.

---

## Route Structure

```
/                         → redirect to /dashboard
│
├── [MainLayout]          (authGuard required)
│   ├── /dashboard        → DashboardRoutes
│   ├── /employees        → EmployeesRoutes
│   │   └── /employees/:id
│   ├── /performance      → PerformanceRoutes
│   ├── /recruitment      → RecruitmentRoutes
│   ├── /analytics        → AnalyticsRoutes
│   │   ├── /analytics/reports
│   │   ├── /analytics/workforce
│   │   └── /analytics/turnover
│   ├── /attendance       → AttendanceRoutes
│   ├── /payroll          → PayrollRoutes
│   ├── /admin            → AdminRoutes
│   └── /settings         → SettingsRoutes
│
├── [AuthLayout]          (no guard)
│   ├── /auth/login
│   └── /auth/signup
│
├── /unauthorized         → 403 page
└── **                    → 404 page
```

---

## Feature Route Files

Each feature defines its own routes:

```typescript
// employees.routes.ts
export const EMPLOYEES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, authorizationGuard],
    data: { roles: ['admin', 'hr_manager', 'recruiter'] },
    title: 'Employees',
    loadComponent: () =>
      import('./pages/employees/employees.component')
        .then(m => m.EmployeesComponent)
  },
  {
    path: ':id',
    canActivate: [authGuard, authorizationGuard],
    data: { roles: ['admin', 'hr_manager'] },
    title: 'Employee Detail',
    loadComponent: () =>
      import('./pages/employee-detail/employee-detail.component')
        .then(m => m.EmployeeDetailComponent)
  }
];
```

---

## Role-Based Access

Routes carry a `data.roles` array checked by `authorizationGuard`:

| Route | Allowed Roles |
|-------|--------------|
| `/dashboard` | all authenticated |
| `/employees` | admin, hr_manager, recruiter |
| `/employees/:id` | admin, hr_manager |
| `/performance` | admin, hr_manager, employee |
| `/analytics` | admin, hr_manager, analyst |
| `/attendance` | admin, hr_manager, employee |
| `/payroll` | admin, finance_manager |
| `/recruitment` | admin, hr_manager, recruiter |
| `/admin` | admin |
| `/settings` | admin, hr_manager |

---

## Guards

| Guard | Purpose |
|-------|---------|
| `authGuard` | Redirects to `/auth/login` if not authenticated |
| `authorizationGuard` | Redirects to `/unauthorized` if role not in `data.roles` |

```typescript
import { authGuard, authorizationGuard } from '@app/core';

{
  path: 'payroll',
  canActivate: [authGuard, authorizationGuard],
  data: { roles: ['admin', 'finance_manager'], title: 'Payroll' },
  loadComponent: () => import('./features/payroll/pages/payroll.component')
    .then(m => m.PayrollComponent)
}
```

---

## Lazy Loading Pattern

All feature components use `loadComponent` (Angular standalone):

```typescript
loadComponent: () =>
  import('./features/my-feature/pages/my-feature.component')
    .then(m => m.MyFeatureComponent)
```

For child routes use `loadChildren`:

```typescript
loadChildren: () =>
  import('./features/my-feature/my-feature.routes')
    .then(m => m.MY_FEATURE_ROUTES)
```

---

## Route Titles

Set via the `title` property — Angular's `TitleStrategy` uses it:

```typescript
{ path: 'employees', title: 'Employees — HR Platform', loadComponent: ... }
```

---

## Adding a New Route

```
1. Create page component in features/my-feature/pages/
2. Add route to my-feature.routes.ts
3. Export ROUTES constant from features/my-feature/index.ts
4. Import in features/index.ts
5. Add path under correct layout in app.routes.ts
6. Set roles in data.roles
```

---

## Query Parameters

```typescript
// Navigation with query params
this.router.navigate(['/employees'], { queryParams: { dept: 'Engineering', page: 2 } });

// Reading in component
this.route.queryParams.subscribe(p => { this.dept = p['dept']; });
```

---

## Error Pages

| Path | Component | HTTP status |
|------|-----------|------------|
| `/unauthorized` | UnauthorizedComponent | 403 |
| `**` (wildcard) | NotFoundComponent | 404 |
