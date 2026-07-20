# NgRx Interview Questions
## HR Analytics Platform — Feature Store Architecture

---

## Core Concepts

**Q: Explain the NgRx data flow in this application.**

```
Component
  │
  ├─ dispatch(Action)
  │
  ▼
Store (immutable state)
  │
  ├─ Reducer handles action → returns new state
  │
  ├─ Effect intercepts action → HTTP call → dispatches result action
  │
  └─ Selector queries state → Observable → Component
```

Example flow: user opens Employees page
1. Component dispatches `loadEmployees()`
2. `EmployeesEffects` intercepts, calls `ApiService.get('/employees')`
3. On success: dispatches `loadEmployeesSuccess({ employees })`
4. `employeesReducer` updates state: `{ employees, loading: false }`
5. `selectAllEmployees` selector emits new array
6. Component re-renders via `async` pipe

---

## Feature Stores

**Q: Why is there a separate store per feature instead of one global store?**

Each of the 9 features has its own store slice. Benefits:

- **Code splitting** — store config lazy-loaded with feature route
- **Team isolation** — Employees team owns `employees.reducer.ts`, Analytics team owns their own
- **Smaller bundle** — store registered only when feature is loaded
- **Clear boundaries** — no cross-feature state mutation

```typescript
// employees.config.ts
export const EMPLOYEES_STORE_CONFIG = {
  state: 'employees',
  reducer: employeesReducer,
  effects: [EmployeesEffects]
};
```

---

## Store Registration

**Q: How are feature stores registered? Walk through store.config.ts.**

```typescript
// store.config.ts
export function getStoreConfig(): EnvironmentProviders[] {
  return [
    provideStore(),
    provideEffects(),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideState(EMPLOYEES_STORE_CONFIG.state, EMPLOYEES_STORE_CONFIG.reducer),
    provideEffects(EmployeesEffects),
    provideState('dashboard', dashboardReducer),
    provideEffects(DashboardEffects),
    // ... all features
  ];
}

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [...CORE_PROVIDERS, ...getStoreConfig()]
};
```

---

## Selectors

**Q: What is memoization in NgRx selectors and why does it matter?**

`createSelector` memoizes — it only recalculates when its input selectors return different references:

```typescript
export const selectEmployeesByDept = createSelector(
  selectAllEmployees,       // input 1
  selectSelectedDepartment, // input 2
  (employees, dept) =>      // projector — only runs if inputs changed
    employees.filter(e => e.department === dept)
);
```

Without memoization, `filter()` would run on every change detection cycle, even when employees or dept haven't changed — devastating performance with 10,000+ records.

---

## Effects

**Q: How do you handle errors in NgRx Effects?**

```typescript
loadEmployees$ = createEffect(() =>
  this.actions$.pipe(
    ofType(loadEmployees),
    switchMap(() =>
      this.employeeService.getAll().pipe(
        map(employees => loadEmployeesSuccess({ employees })),
        catchError(error => of(loadEmployeesFailure({ error: error.message })))
      )
    )
  )
);
```

Key points:
- `catchError` must be inside `switchMap` (not outside) — otherwise the effect terminates on first error
- `of(failureAction)` returns a new observable so the effect keeps listening
- `loadEmployeesFailure` updates `state.error` which can show an error toast

---

## Entity Adapter

**Q: Does this project use NgRx Entity? What does it provide?**

`@ngrx/entity` normalizes collections into a dictionary:

```typescript
// employees.state.ts
export interface EmployeesState extends EntityState<Employee> {
  loading: boolean;
  error: string | null;
  selectedId: string | null;
}

export const adapter = createEntityAdapter<Employee>();
```

Benefits:
- O(1) lookup by ID instead of O(n) array search
- Built-in `addMany`, `upsertOne`, `removeOne` operations
- `selectAll`, `selectEntities`, `selectIds` selectors for free

---

## Store DevTools

**Q: How is NgRx DevTools configured and what can you do with it?**

```typescript
provideStoreDevtools({
  maxAge: 25,          // keep last 25 actions
  logOnly: !isDevMode() // disable in production
})
```

In development: opens in Chrome Redux DevTools extension.
- **Time-travel debugging** — replay any action to reproduce a bug
- **Action log** — see every dispatched action with payload
- **State diff** — see exactly what changed in state per action
- **Import/export** — save and share state snapshots

---

## Common Mistakes to Avoid

| Mistake | Correct Pattern |
|---------|----------------|
| Mutating state in reducer | Return new object: `{ ...state, employees }` |
| Subscribing to store in effect | Use `withLatestFrom(this.store.select(selectX))` |
| Dispatching from reducer | Reducers are pure — dispatch only from components/effects |
| Using store in shared components | Shared components use `@Input()` — container components select from store |
| Forgetting `unsubscribe` | Use `async` pipe or `takeUntilDestroyed()` |
