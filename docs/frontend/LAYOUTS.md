# Layouts Guide

Three layout shells live in `src/app/layouts/`.

---

## Import

```typescript
import {
  DashboardLayoutComponent,
  AuthLayoutComponent,
  PrintLayoutComponent
} from '@app/layouts';
```

---

## MainLayout (DashboardLayoutComponent)

Used for all authenticated app pages.

### Structure
```
┌─────────────────────────────────────┐
│  TopBar  (user menu, notifications, │
│           language toggle, theme)   │
├──────────┬──────────────────────────┤
│          │                          │
│ Sidebar  │   <router-outlet>        │
│ (nav     │   (feature pages)        │
│  links)  │                          │
│          │                          │
└──────────┴──────────────────────────┘
```

### Features
- Responsive sidebar (collapses to icon-only on tablet)
- Mobile drawer (hamburger menu on < 768px)
- Breadcrumb trail below topbar
- Active route highlighting in sidebar
- Role-based nav item visibility

### Usage in routes
```typescript
// app.routes.ts
{
  path: '',
  component: DashboardLayoutComponent,
  canActivate: [authGuard],
  children: [
    { path: 'dashboard', loadComponent: () => ... },
    { path: 'employees', loadComponent: () => ... },
    // ...
  ]
}
```

---

## AuthLayout (AuthLayoutComponent)

Used for login, signup, and password-reset pages.

### Structure
```
┌─────────────────────────────────────┐
│  Centered background (gradient)     │
│                                     │
│    ┌───────────────────────┐        │
│    │  Logo                 │        │
│    │  <router-outlet>      │        │
│    │  (login / signup)     │        │
│    └───────────────────────┘        │
│                                     │
└─────────────────────────────────────┘
```

### Features
- Full-viewport gradient background
- Glass-morphism card
- Centered vertically and horizontally
- Language toggle (EN/AR)

### Usage in routes
```typescript
{
  path: 'auth',
  component: AuthLayoutComponent,
  children: [
    { path: 'login', loadComponent: () => ... },
    { path: 'signup', loadComponent: () => ... }
  ]
}
```

---

## PrintLayout (PrintLayoutComponent)

Used for report printing and PDF export pages.

### Structure
```
┌─────────────────────────────────────┐
│  Print controls (browser only)      │
├─────────────────────────────────────┤
│  A4 / Letter page container         │
│  <router-outlet>                    │
│  (report content)                   │
└─────────────────────────────────────┘
```

### Features
- Hides sidebar and topbar in `@media print`
- A4 page sizing with correct margins
- Print button triggers `window.print()`
- Clean white background

### Usage in routes
```typescript
{
  path: 'print',
  component: PrintLayoutComponent,
  children: [
    { path: 'report/:id', loadComponent: () => ... }
  ]
}
```

---

## Switching Layouts

Routes determine which layout renders. To place a new page in a different layout, nest its route under the correct layout component:

```typescript
// Under MainLayout
{ path: '', component: DashboardLayoutComponent, children: [
  { path: 'my-page', loadComponent: ... }
]}

// Under AuthLayout
{ path: 'auth', component: AuthLayoutComponent, children: [
  { path: 'my-auth-page', loadComponent: ... }
]}

// Under PrintLayout
{ path: 'print', component: PrintLayoutComponent, children: [
  { path: 'my-report', loadComponent: ... }
]}
```

---

## Adding a New Layout

```
1. mkdir src/app/layouts/my-layout/
2. Create my-layout.component.ts (standalone, OnPush)
3. Include <router-outlet> in template
4. Export from layouts/index.ts
5. Add route wrapper in app.routes.ts
6. Document here
```
