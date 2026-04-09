# NgRx Store Architecture

This directory contains the global state management for the HR Analytics Platform using NgRx.

## Overview

The store is organized into four feature modules, each managing a specific domain:

1. **Employees** - Employee data and records
2. **Performance** - Performance metrics and ratings
3. **Preferences** - User preferences and settings
4. **Dashboard** - Dashboard configurations and metrics

## Directory Structure

```
store/
├── app.state.ts              # Root app state interface
├── index.ts                  # Barrel export file
├── employees/
│   ├── employees.state.ts    # State interface
│   ├── employees.actions.ts  # Action creators
│   ├── employees.reducer.ts  # Reducer function
│   ├── employees.selectors.ts # Selector functions
│   └── employees.effects.ts  # Side effects
├── performance/
│   ├── performance.state.ts
│   ├── performance.actions.ts
│   ├── performance.reducer.ts
│   ├── performance.selectors.ts
│   └── performance.effects.ts
├── preferences/
│   ├── preferences.state.ts
│   ├── preferences.actions.ts
│   ├── preferences.reducer.ts
│   ├── preferences.selectors.ts
│   └── preferences.effects.ts
└── dashboard/
    ├── dashboard.state.ts
    ├── dashboard.actions.ts
    ├── dashboard.reducer.ts
    ├── dashboard.selectors.ts
    └── dashboard.effects.ts
```

## Feature Modules

### Employees Feature

Manages employee data including:
- Employee records (name, department, role, etc.)
- Employment status (active, on-leave, departed)
- Selected employee tracking

**Key Selectors:**
- `selectAllEmployees` - All employees
- `selectEmployeesByDepartment(dept)` - Filter by department
- `selectEmployeesByRegion(region)` - Filter by region
- `selectEmployeesByStatus(status)` - Filter by employment status

### Performance Feature

Manages performance metrics including:
- Performance scores and ratings
- Review dates and trends
- Department-level metrics

**Key Selectors:**
- `selectAllPerformanceMetrics` - All metrics
- `selectAveragePerformanceScore` - Average score
- `selectPerformanceDistribution` - Score distribution
- `selectPerformanceMetricsByDepartment(dept)` - Department metrics

### Preferences Feature

Manages user preferences including:
- Language (English/Arabic)
- Dark mode settings
- Notification preferences
- Saved filters
- UI configuration

**Key Selectors:**
- `selectLanguage` - Current language
- `selectDarkMode` - Dark mode enabled
- `selectSavedFilters` - User's saved filters
- `selectNotificationsEnabled` - Notification status

### Dashboard Feature

Manages dashboard configuration including:
- Dashboard layouts and widgets
- Dashboard metrics (headcount, active employees, etc.)
- Current dashboard selection

**Key Selectors:**
- `selectCurrentDashboardConfig` - Active dashboard
- `selectDashboardMetrics` - Current metrics
- `selectTotalHeadcount` - Total employees
- `selectActiveEmployees` - Active employee count

## Usage Examples

### Dispatching Actions

```typescript
import { Store } from '@ngrx/store';
import { loadEmployees, selectEmployee } from './store';

export class EmployeeComponent {
  constructor(private store: Store) {}

  ngOnInit() {
    // Load all employees
    this.store.dispatch(loadEmployees());
  }

  selectEmployee(id: string) {
    this.store.dispatch(selectEmployee({ id }));
  }
}
```

### Using Selectors

```typescript
import { Store } from '@ngrx/store';
import { selectAllEmployees, selectEmployeesByDepartment } from './store';

export class EmployeeListComponent {
  employees$ = this.store.select(selectAllEmployees);
  engineeringEmployees$ = this.store.select(
    selectEmployeesByDepartment('Engineering')
  );

  constructor(private store: Store) {}
}
```

### Combining Selectors

```typescript
import { combineLatest } from 'rxjs';
import { selectAllEmployees, selectDarkMode } from './store';

export class DashboardComponent {
  data$ = combineLatest([
    this.store.select(selectAllEmployees),
    this.store.select(selectDarkMode),
  ]);

  constructor(private store: Store) {}
}
```

## Effects

Each feature module includes effects for handling side effects:

- **EmployeeEffects** - Handles employee data loading and updates
- **PerformanceEffects** - Handles performance metric operations
- **PreferencesEffects** - Handles preference updates and persistence
- **DashboardEffects** - Handles dashboard configuration and metrics

Effects are automatically registered in `app.config.ts`.

## NgRx DevTools

The store is configured with NgRx DevTools for development:

- **Time-travel debugging** - Step through state changes
- **Action history** - View all dispatched actions
- **State snapshots** - Inspect state at any point
- **Persistence** - Automatically persist state

To use DevTools:
1. Install [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools-extension)
2. Open DevTools in your browser
3. Select the "Redux" tab

## Configuration

Store configuration is in `app.config.ts`:

```typescript
provideStore<AppState>({
  employees: employeeReducer,
  performance: performanceReducer,
  preferences: preferencesReducer,
  dashboard: dashboardReducer,
}),
provideEffects([
  EmployeeEffects,
  PerformanceEffects,
  PreferencesEffects,
  DashboardEffects,
]),
provideStoreDevtools({
  maxAge: 25,
  logOnly: !isDevMode(),
  features: {
    pause: true,
    lock: true,
    persist: true,
  },
})
```

## Best Practices

1. **Use selectors** - Always use selectors to access state, never access state directly
2. **Keep state normalized** - Use entity pattern for collections
3. **Immutable updates** - Always create new objects when updating state
4. **Effects for side effects** - Handle API calls and async operations in effects
5. **Type safety** - Use TypeScript interfaces for all state shapes
6. **Lazy loading** - Consider lazy-loading feature stores for large applications

## Real-Time Updates

For real-time data synchronization:

1. WebSocket service emits updates
2. Effects listen for updates and dispatch actions
3. Reducers update state
4. Selectors notify subscribers
5. Components receive updates through observables

Example:
```typescript
// In effects
this.websocket.updates$.pipe(
  map(update => updatePerformanceMetricsRealtime({ metrics: update }))
).subscribe(action => this.store.dispatch(action));
```

## Testing

Each feature module includes:
- State interface for type safety
- Actions for testing action dispatch
- Reducers for testing state mutations
- Selectors for testing state queries
- Effects for testing side effects

See individual feature test files for examples.
