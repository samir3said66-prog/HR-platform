# Angular Interview Questions
## HR Analytics Platform — Frontend Focus

---

## Change Detection

**Q: What is ChangeDetectionStrategy.OnPush and why is it used in every component here?**

OnPush tells Angular to skip checking a component during change detection unless:
- An `@Input()` reference changes
- An event originates from the component
- An async pipe resolves
- `markForCheck()` is called manually

In this platform every component uses OnPush. With 9 features each rendering large data tables and charts, the default `CheckAlways` strategy would check every component on every event (keystrokes, mouse moves). OnPush cuts that work down drastically.

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

---

**Q: What is the difference between `markForCheck()` and `detectChanges()`?**

- `markForCheck()` — marks the component and all ancestors as dirty; Angular checks them at the next change detection cycle (async, queues the check)
- `detectChanges()` — synchronously runs change detection right now on this component and its subtree

Use `markForCheck()` when updating state from outside Angular (WebSocket callbacks, setTimeout). Use `detectChanges()` rarely — only when you need immediate synchronous update.

---

## Standalone Components

**Q: Why are all components in this project standalone? What does that mean?**

Standalone components don't belong to an NgModule. They declare their own imports:

```typescript
@Component({
  standalone: true,
  imports: [ButtonComponent, NgIf, AsyncPipe],
  template: `...`
})
```

Benefits in this project:
- Better tree-shaking (unused components not bundled)
- Cleaner lazy loading — routes can directly load a standalone component
- No NgModule boilerplate
- Easier to test (just import the component)

---

## Lazy Loading

**Q: How does lazy loading work in this app? Difference between `loadComponent` and `loadChildren`?**

`loadComponent` — lazy loads a single standalone component:
```typescript
{ path: 'employees', loadComponent: () => import('./features/employees/pages/employees.component').then(m => m.EmployeesComponent) }
```

`loadChildren` — lazy loads a Routes array (multiple routes):
```typescript
{ path: 'employees', loadChildren: () => import('./features/employees/employees.routes').then(m => m.EMPLOYEES_ROUTES) }
```

This app uses `loadComponent` for simple feature pages and `loadChildren` for features with nested routes (analytics has 3 sub-routes).

---

## Signals vs Observables

**Q: This project uses NgRx Observables. When would you choose Angular Signals instead?**

Signals (Angular 16+) are synchronous reactive values — great for local component state:
```typescript
count = signal(0);
double = computed(() => this.count() * 2);
```

Observables (RxJS) are better for async streams, HTTP, WebSocket, NgRx:
```typescript
employees$ = this.store.select(selectEmployees);  // async stream
```

In this project: NgRx + Observables for shared app state; Signals would be appropriate for local UI state like `isMenuOpen`, `selectedTab`, `searchQuery`.

---

## Dependency Injection

**Q: How does the core module ensure services are singletons?**

```typescript
// core.config.ts
export const CORE_PROVIDERS: Provider[] = [
  AuthService,
  WebSocketService,
  I18nService,
  ...
];

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [...CORE_PROVIDERS, ...getStoreConfig()]
};
```

Services are provided at root application level once. Features never re-provide them in their own `providers[]`. If a service were accidentally re-provided in a feature component, Angular would create a second instance — breaking singleton guarantees.

---

## @defer

**Q: Where would you add `@defer` blocks in this application?**

`@defer` delays loading a component until a condition is met:

```html
@defer (on viewport) {
  <app-chart [data]="analyticsData" />
} @loading {
  <app-loading-skeleton />
} @placeholder {
  <div class="h-64 bg-gray-100 rounded"></div>
}
```

Good candidates in this app:
- Charts on dashboard (below the fold)
- Analytics report tables
- Activity feed widget
- Payroll history table

---

## Forms

**Q: Reactive Forms vs Template-Driven Forms — which does this project use and why?**

Reactive Forms. All form components (`InputComponent`, `SelectComponent`, etc.) accept a `FormControl` input:

```typescript
@Input() formControl!: FormControl;
```

Reasons:
- Testable without DOM
- Async validators for email uniqueness, username availability
- Dynamic form building (custom fields in settings)
- Complex cross-field validation (salary ranges, date ranges)
- NgRx integration — dispatch action on `valueChanges`

---

## HTTP Interceptors

**Q: What does the CSP interceptor do in this app?**

```typescript
// csp.interceptor.ts
export const cspInterceptor: HttpInterceptorFn = (req, next) => {
  const cloned = req.clone({
    headers: req.headers
      .set('X-Requested-With', 'XMLHttpRequest')
      .set('X-CSRF-Token', getCSRFToken())
  });
  return next(cloned);
};
```

It adds security headers to every outgoing HTTP request — CSRF token and XHR marker. This prevents cross-site request forgery attacks on state-changing API calls.

---

## Angular 21 Features Used

| Feature | Where used in this project |
|---------|--------------------------|
| Standalone components | All components |
| `loadComponent` routing | All 9 feature routes |
| `@defer` | Charts and heavy components |
| Functional guards | `authGuard`, `authorizationGuard` |
| `inject()` function | Services in guards |
| Signal-based forms | Planned for Q4 2026 |
| SSR (Angular Universal) | Not implemented yet |
