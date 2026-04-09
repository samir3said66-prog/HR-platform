# NgRx Effects Implementation Guide

## Overview

This guide documents the NgRx effects implementation for the HR Analytics Platform. Effects handle side effects such as API calls, local storage operations, and other asynchronous operations in the application.

**Requirements Addressed:** 12.5, 12.6

## Architecture

### Effect Structure

Each feature module (employees, performance, preferences, dashboard) has its own effects file that handles side effects for that domain:

```
src/app/store/
├── employees/
│   ├── employees.effects.ts
│   └── employees.effects.spec.ts
├── performance/
│   ├── performance.effects.ts
│   └── performance.effects.spec.ts
├── preferences/
│   ├── preferences.effects.ts
│   └── preferences.effects.spec.ts
└── dashboard/
    ├── dashboard.effects.ts
    └── dashboard.effects.spec.ts
```

## Error Handling Strategy

### Retry Logic with Exponential Backoff

All effects implement retry logic with exponential backoff to handle transient failures:

```typescript
retry({
  count: 3,  // Number of retry attempts
  delay: (error, retryCount) => {
    const delayMs = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
    console.warn(`Retry attempt ${retryCount + 1} after ${delayMs}ms`, error);
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  },
})
```

**Retry Strategy:**
- **Load operations:** 3 attempts (1s, 2s, 4s delays)
- **Create/Update/Delete operations:** 2 attempts (1s, 2s delays)

### Error Handling Pattern

All effects follow a consistent error handling pattern:

```typescript
catchError((error) => {
  console.error('[EffectName] Failed to perform operation:', error);
  return of(
    SomeActions.operationFailure({
      error: error.message || 'Failed to perform operation',
    }),
  );
})
```

**Error Handling Features:**
- Logs errors to console for debugging
- Dispatches failure actions with error messages
- Provides user-friendly error messages
- Prevents effect chains from breaking

## Effects Implementation

### 1. Employee Effects

**File:** `src/app/store/employees/employees.effects.ts`

#### Effects Implemented

| Effect | Trigger | Success Action | Failure Action | Retry |
|--------|---------|-----------------|-----------------|-------|
| `loadEmployees$` | `loadEmployees` | `loadEmployeesSuccess` | `loadEmployeesFailure` | 3x |
| `addEmployee$` | `addEmployee` | `loadEmployees` | `loadEmployeesFailure` | 2x |
| `updateEmployee$` | `updateEmployee` | `loadEmployees` | `loadEmployeesFailure` | 2x |
| `deleteEmployee$` | `deleteEmployee` | `loadEmployees` | `loadEmployeesFailure` | 2x |

#### Usage Example

```typescript
// Dispatch load employees action
store.dispatch(EmployeeActions.loadEmployees());

// Add new employee
store.dispatch(EmployeeActions.addEmployee({ employee: newEmployee }));

// Update employee
store.dispatch(EmployeeActions.updateEmployee({ employee: updatedEmployee }));

// Delete employee
store.dispatch(EmployeeActions.deleteEmployee({ id: employeeId }));
```

### 2. Performance Effects

**File:** `src/app/store/performance/performance.effects.ts`

#### Effects Implemented

| Effect | Trigger | Success Action | Failure Action | Retry |
|--------|---------|-----------------|-----------------|-------|
| `loadPerformanceMetrics$` | `loadPerformanceMetrics` | `loadPerformanceMetricsSuccess` | `loadPerformanceMetricsFailure` | 3x |
| `updatePerformanceMetric$` | `updatePerformanceMetric` | `loadPerformanceMetrics` | `loadPerformanceMetricsFailure` | 2x |
| `addPerformanceMetric$` | `addPerformanceMetric` | `loadPerformanceMetrics` | `loadPerformanceMetricsFailure` | 2x |
| `deletePerformanceMetric$` | `deletePerformanceMetric` | `loadPerformanceMetrics` | `loadPerformanceMetricsFailure` | 2x |

#### Usage Example

```typescript
// Load performance metrics
store.dispatch(PerformanceActions.loadPerformanceMetrics());

// Add performance metric
store.dispatch(PerformanceActions.addPerformanceMetric({ metric: newMetric }));

// Update performance metric
store.dispatch(PerformanceActions.updatePerformanceMetric({ metric: updatedMetric }));

// Delete performance metric
store.dispatch(PerformanceActions.deletePerformanceMetric({ id: metricId }));
```

### 3. Preferences Effects

**File:** `src/app/store/preferences/preferences.effects.ts`

#### Effects Implemented

| Effect | Trigger | Success Action | Failure Action | Retry |
|--------|---------|-----------------|-----------------|-------|
| `loadPreferences$` | `loadPreferences` | `loadPreferencesSuccess` | `loadPreferencesFailure` | 2x |
| `updatePreferences$` | `updatePreferences` | `updatePreferencesSuccess` | `updatePreferencesFailure` | 2x |
| `persistPreferences$` | `updatePreferencesSuccess`, `loadPreferencesSuccess` | (side-effect only) | N/A | N/A |
| `addSavedFilter$` | `addSavedFilter` | `updatePreferences` | `updatePreferencesFailure` | N/A |
| `removeSavedFilter$` | `removeSavedFilter` | `updatePreferences` | `updatePreferencesFailure` | N/A |
| `updateSavedFilter$` | `updateSavedFilter` | `updatePreferences` | `updatePreferencesFailure` | N/A |

#### Special Features

**Local Storage Fallback:**
- Attempts to load preferences from local storage first
- Falls back to API call if local storage is empty
- Returns default preferences on complete failure

**Persistence:**
- Automatically persists preferences to local storage after successful load/update
- Handles local storage errors gracefully

#### Usage Example

```typescript
// Load preferences
store.dispatch(PreferencesActions.loadPreferences());

// Update preferences
store.dispatch(PreferencesActions.updatePreferences({
  preferences: { language: 'ar', darkMode: true }
}));

// Add saved filter
store.dispatch(PreferencesActions.addSavedFilter({ filter: newFilter }));

// Remove saved filter
store.dispatch(PreferencesActions.removeSavedFilter({ filterId: 'filter-1' }));

// Update saved filter
store.dispatch(PreferencesActions.updateSavedFilter({ filter: updatedFilter }));
```

### 4. Dashboard Effects

**File:** `src/app/store/dashboard/dashboard.effects.ts`

#### Effects Implemented

| Effect | Trigger | Success Action | Failure Action | Retry |
|--------|---------|-----------------|-----------------|-------|
| `loadDashboardConfigs$` | `loadDashboardConfigs` | `loadDashboardConfigsSuccess` | `loadDashboardConfigsFailure` | 3x |
| `loadDashboardMetrics$` | `loadDashboardMetrics` | `loadDashboardMetricsSuccess` | `loadDashboardMetricsFailure` | 3x |
| `createDashboardConfig$` | `createDashboardConfig` | `loadDashboardConfigs` | `loadDashboardConfigsFailure` | 2x |
| `updateDashboardConfig$` | `updateDashboardConfig` | `loadDashboardConfigs` | `loadDashboardConfigsFailure` | 2x |
| `deleteDashboardConfig$` | `deleteDashboardConfig` | `loadDashboardConfigs` | `loadDashboardConfigsFailure` | 2x |

#### Usage Example

```typescript
// Load dashboard configurations
store.dispatch(DashboardActions.loadDashboardConfigs());

// Load dashboard metrics
store.dispatch(DashboardActions.loadDashboardMetrics());

// Create dashboard configuration
store.dispatch(DashboardActions.createDashboardConfig({ config: newConfig }));

// Update dashboard configuration
store.dispatch(DashboardActions.updateDashboardConfig({ config: updatedConfig }));

// Delete dashboard configuration
store.dispatch(DashboardActions.deleteDashboardConfig({ configId: 'config-1' }));
```

## Testing Patterns

### Unit Testing Effects

Each effects file has a corresponding `.spec.ts` file with comprehensive tests:

```typescript
describe('EmployeeEffects', () => {
  let effects: EmployeeEffects;
  let actions$: Observable<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EmployeeEffects, provideMockActions(() => actions$)],
    });
    effects = TestBed.inject(EmployeeEffects);
  });

  it('should return loadEmployeesSuccess action on success', (done) => {
    actions$ = of(EmployeeActions.loadEmployees());
    effects.loadEmployees$.subscribe((result) => {
      expect(result.type).toBe(EmployeeActions.loadEmployeesSuccess.type);
      done();
    });
  });
});
```

### Test Coverage

Each effects test file covers:
- ✅ Success scenarios
- ✅ Failure scenarios
- ✅ Error handling
- ✅ Retry logic
- ✅ Action payload handling
- ✅ Multiple action sequences
- ✅ Side effects (e.g., local storage persistence)

### Running Tests

```bash
# Run all tests
npm test

# Run specific effects tests
npm test -- --include='**/employees.effects.spec.ts'

# Run with coverage
npm test -- --code-coverage
```

## Best Practices

### 1. Error Logging

Always log errors with context:

```typescript
console.error('[EffectName] Failed to perform operation:', error);
```

### 2. Retry Strategy

- Use 3 retries for read operations (load)
- Use 2 retries for write operations (create, update, delete)
- Implement exponential backoff to avoid overwhelming the server

### 3. Side Effects

For side effects that don't dispatch actions, use `{ dispatch: false }`:

```typescript
persistPreferences$ = createEffect(
  () => this.actions$.pipe(
    ofType(PreferencesActions.updatePreferencesSuccess),
    tap(({ preferences }) => {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
    }),
  ),
  { dispatch: false },
);
```

### 4. Error Messages

Provide user-friendly error messages:

```typescript
catchError((error) => {
  return of(
    SomeActions.operationFailure({
      error: error.message || 'Failed to perform operation',
    }),
  );
})
```

### 5. Action Chaining

Chain actions to refresh data after mutations:

```typescript
switchMap(() => of(EmployeeActions.loadEmployees())),
```

## Integration with Components

### Subscribing to Effects

Components should subscribe to selectors, not effects directly:

```typescript
export class EmployeeListComponent {
  employees$ = this.store.select(selectAllEmployees);
  loading$ = this.store.select(selectEmployeesLoading);
  error$ = this.store.select(selectEmployeesError);

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(EmployeeActions.loadEmployees());
  }
}
```

### Handling Errors in Components

```typescript
export class EmployeeListComponent {
  error$ = this.store.select(selectEmployeesError);

  constructor(private store: Store) {}

  ngOnInit() {
    this.error$.subscribe((error) => {
      if (error) {
        this.showErrorNotification(error);
      }
    });
  }
}
```

## API Integration

### Replacing TODO Comments

To integrate with actual APIs, replace the TODO comments in effects:

**Before:**
```typescript
switchMap(() =>
  // TODO: Replace with actual API call
  of([]).pipe(
```

**After:**
```typescript
switchMap(() =>
  this.employeeService.getEmployees().pipe(
```

### Service Example

```typescript
@Injectable({ providedIn: 'root' })
export class EmployeeService {
  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>('/api/employees');
  }

  addEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>('/api/employees', employee);
  }

  updateEmployee(employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`/api/employees/${employee.id}`, employee);
  }

  deleteEmployee(id: string): Observable<void> {
    return this.http.delete<void>(`/api/employees/${id}`);
  }
}
```

## Monitoring and Debugging

### NgRx DevTools

Effects can be monitored using NgRx DevTools:

1. Install Redux DevTools browser extension
2. Actions and state changes are automatically logged
3. Time-travel debugging is available

### Console Logging

Effects log important events to the console:

```
[EmployeeEffects] Retry attempt 1 after 1000ms
[EmployeeEffects] Employee added successfully
[EmployeeEffects] Failed to load employees after retries: Error message
```

### Performance Monitoring

Monitor effect performance:

```typescript
tap(() => console.time('loadEmployees')),
tap(() => console.timeEnd('loadEmployees')),
```

## Troubleshooting

### Effects Not Triggering

1. Verify action is dispatched: `store.dispatch(EmployeeActions.loadEmployees())`
2. Check effect is registered in module
3. Verify action type matches in `ofType()`

### Infinite Loops

Avoid dispatching the same action in an effect:

```typescript
// ❌ Bad - infinite loop
switchMap(() => of(EmployeeActions.loadEmployees())),

// ✅ Good - dispatch different action
switchMap(() => of(EmployeeActions.loadEmployeesSuccess({ employees: [] }))),
```

### Memory Leaks

Always unsubscribe from observables in components:

```typescript
export class EmployeeListComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.employees$
      .pipe(takeUntil(this.destroy$))
      .subscribe((employees) => {
        // Handle employees
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## References

- [NgRx Effects Documentation](https://ngrx.io/guide/effects)
- [RxJS Operators](https://rxjs.dev/api)
- [Angular HTTP Client](https://angular.io/guide/http)

## Summary

The NgRx effects implementation provides:

✅ **Robust Error Handling** - Retry logic with exponential backoff
✅ **Consistent Patterns** - Standardized effect structure across all domains
✅ **Comprehensive Testing** - Unit tests for all effects
✅ **Local Storage Integration** - Preferences persistence
✅ **Logging and Debugging** - Console logging for monitoring
✅ **Type Safety** - Full TypeScript support
✅ **Scalability** - Easy to add new effects and operations

**Requirements Met:**
- ✅ Requirement 12.5: Effects for handling side effects (API calls, local storage, etc.)
- ✅ Requirement 12.6: Load initial state from local storage and backend API
