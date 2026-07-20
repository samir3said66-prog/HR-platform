# HR Platform — Enterprise Architecture

## Overview

The HR Platform has been refactored into a **large-scale, enterprise-grade feature-based architecture** designed for scalability, maintainability, and team collaboration.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Shell                         │
│  app.component.ts · app.routes.ts · app.config.ts           │
└──────────────────────────┬──────────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          ▼                                 ▼
    ┌──────────┐                     ┌────────────┐
    │  Layouts │                     │   Routes   │
    │ Main     │                     │ Dashboard  │
    │ Auth     │                     │ Employees  │
    │ Print    │                     │ ...9 total │
    └────┬─────┘                     └─────┬──────┘
         └──────────────┬─────────────────┘
                        ▼
         ┌──────────────────────────────┐
         │      Feature Modules (9)     │
         │  Dashboard · Employees       │
         │  Performance · Recruitment   │
         │  Analytics · Attendance      │
         │  Payroll · Admin · Settings  │
         └──────────────────────────────┘
                        │
       ┌────────────────┼────────────────┐
       ▼                ▼                ▼
  ┌─────────┐     ┌──────────┐    ┌──────────┐
  │  Core   │     │  Shared  │    │  Store   │
  │ Auth    │     │ 22 UI    │    │ Actions  │
  │ Guards  │     │ 9 Common │    │ Reducers │
  │ Services│     │ Pipes    │    │ Effects  │
  │ Models  │     │ Directives│   │ Selectors│
  └─────────┘     └──────────┘    └──────────┘
```

## Directory Structure

```
src/app/
├── core/                        ← App-wide singletons
│   ├── auth/                    ← Authentication & JWT
│   ├── guards/                  ← authGuard, authorizationGuard
│   ├── interceptors/            ← CSP interceptor
│   ├── services/                ← API, WebSocket, i18n, Theme, Audit …
│   ├── models/                  ← User, Role, Employee interfaces
│   ├── utils/                   ← Logger, Storage, JWT, Validators
│   ├── constants/               ← API, Auth, Role constants
│   ├── core.config.ts           ← CORE_PROVIDERS array
│   └── index.ts                 ← Barrel export
│
├── shared/                      ← Reusable across features
│   ├── components/
│   │   ├── ui/                  ← 22 UI components
│   │   ├── common/              ← 9 Common components
│   │   └── index.ts
│   ├── pipes/                   ← 6 pipes
│   ├── directives/              ← 5 directives
│   ├── widgets/                 ← 5 widgets
│   ├── models/                  ← Table, Filter, UI models
│   ├── utils/                   ← Table, Form, Export utils
│   ├── shared.module.ts
│   └── index.ts
│
├── features/                    ← Business domains (9)
│   ├── dashboard/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── store/               ← NgRx: actions/reducer/effects/selectors
│   │   ├── models/
│   │   ├── dashboard.routes.ts
│   │   └── index.ts
│   ├── employees/ …
│   ├── performance/ …
│   ├── recruitment/ …
│   ├── analytics/ …
│   ├── attendance/ …
│   ├── payroll/ …
│   ├── admin/ …
│   ├── settings/ …
│   └── index.ts
│
├── layouts/                     ← Layout shells
│   ├── main-layout/
│   ├── auth-layout/
│   ├── print-layout/
│   └── index.ts
│
├── app.component.ts
├── app.config.ts                ← Uses CORE_PROVIDERS + getStoreConfig()
├── app.routes.ts                ← Feature-based lazy loading
└── store.config.ts              ← Central NgRx store registration
```

## Key Principles

| Principle | Implementation |
|-----------|---------------|
| Feature isolation | Each feature owns its pages, components, services, store |
| Singleton services | All provided once via `CORE_PROVIDERS` in `core.config.ts` |
| Lazy loading | Every feature route uses `loadComponent` |
| RBAC | `authorizationGuard` + route `data.roles` |
| i18n | `I18nService` + `translate` pipe, EN/AR |
| Real-time | `WebSocketService` in core |
| OnPush everywhere | `ChangeDetectionStrategy.OnPush` on all components |

## Data Flows

### Auth Flow
```
Login form → AuthService.login() → JWT stored
  → authGuard validates token
  → authorizationGuard checks roles
  → Route + Layout + Feature lazy-loaded
```

### Store Flow
```
Component → dispatch(Action)
  → Effect → HTTP call → API
  → Success action → Reducer → new State
  → Selector → Observable → Component update
```

### Routing
```
app.routes.ts
├── MainLayout (authenticated)
│   ├── /dashboard     → DashboardRoutes (lazy)
│   ├── /employees     → EmployeesRoutes (lazy)
│   ├── /performance   → PerformanceRoutes (lazy)
│   ├── /analytics     → AnalyticsRoutes (lazy)
│   ├── /attendance    → AttendanceRoutes (lazy)
│   ├── /payroll       → PayrollRoutes (lazy)
│   ├── /recruitment   → RecruitmentRoutes (lazy)
│   ├── /admin         → AdminRoutes (lazy)
│   └── /settings      → SettingsRoutes (lazy)
├── AuthLayout (unauthenticated)
│   ├── /auth/login
│   └── /auth/signup
└── Error pages
    ├── /unauthorized
    └── ** → 404
```

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Angular | 21.2.8 |
| Language | TypeScript | 5.9.2 |
| Reactive | RxJS | 7.8.0 |
| State | NgRx | 21.1.0 |
| Styling | Tailwind CSS | 4.1.12 |
| Build | Angular CLI | 21.2.7 |
| Testing | Vitest | 4.0.8 |
| Linting | ESLint + Prettier | 8.56 / 3.8 |
| Export | XLSX + jsPDF | latest |
| Charts | ECharts | 6.0 |

## Security

- JWT authentication with refresh
- Route guards (auth + RBAC)
- CSP HTTP interceptor
- XSS prevention via DomSanitizer
- Input validation on all forms
- Audit logging via `AuditService`

## Performance

- All features lazy-loaded (code splitting)
- `OnPush` change detection everywhere
- `@defer` blocks for heavy components
- SVG favicon + icon set (no PNG overhead)
- WOFF2 fonts with `font-display: swap`
- NgRx selectors with memoization

## Team Scalability

```
Core Team        → core/ (auth, services, guards)
UI Team          → shared/components/ (component library)
Dashboard Team   → features/dashboard/
HR Team          → features/employees/ + performance/ + recruitment/
Operations Team  → features/attendance/ + payroll/
Analytics Team   → features/analytics/
Admin Team       → features/admin/ + settings/
```

## Related Docs

| File | Purpose |
|------|---------|
| `docs/MIGRATION_GUIDE.md` | How to migrate old code |
| `docs/COMPONENTS.md` | Component library reference |
| `docs/LAYOUTS.md` | Layout components guide |
| `docs/ROUTES.md` | Routing guide |
| `docs/SHARED.md` | Shared module guide |
| `docs/IMPORT_VERIFICATION.md` | Import checklist |
| `docs/SEO.md` | SEO & meta tags guide |
| `docs/ASSETS_GUIDE.md` | Asset organization |
| `docs/ENVIRONMENT.md` | Environment configuration |
| `docs/TESTING.md` | Testing strategy |
| `docs/CHANGELOG.md` | Version history |
| `docs/CONTRIBUTING.md` | Contribution guide |
