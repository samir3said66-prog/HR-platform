# System Design Interview Questions
## HR Analytics Platform — Architecture Decisions

---

## Architecture Choice

**Q: Why feature-based architecture over a flat or module-based structure?**

| Structure | Problem at scale |
|-----------|----------------|
| Flat (`app/components/`, `app/services/`) | Files become unsearchable, teams step on each other, imports become a maze |
| NgModule-based | Modules still grow large, lazy loading harder to reason about |
| Feature-based (this project) | Each team owns a folder, lazy loading is natural, adding/removing features is safe |

With 9 features and a team of 5, feature-based means:
- Employees team never touches `payroll/`
- A PR for Analytics only changes `features/analytics/`
- A new `compensation/` feature can be added without touching anything else

---

## State Management Design

**Q: Why not use a single global NgRx store?**

A single global store for 9 features would mean:
- One massive `AppState` interface that everyone imports
- 40+ reducers registered at startup (slower init)
- Bundle includes ALL store code even for unauthenticated users

Feature stores solve this:
- `employees` store loads only when user navigates to `/employees`
- Admin team can change the admin store without a merge conflict with payroll team
- State is co-located with the feature that owns it

---

**Q: How would you handle cross-feature state sharing? (e.g., Dashboard needs data from Employees)**

Three options, in preference order:

1. **API call in Dashboard effect** — Dashboard fetches its own summary data from a dedicated API endpoint (`/api/dashboard/summary`), not the employees endpoint. Keeps features decoupled.

2. **Shared selector** — If Employees store is already loaded, create a selector in `features/employees/store` and import it in Dashboard. Dashboard depends on Employees being initialized.

3. **Shared state in Core** — If data is truly global (e.g., current user's employee record), put it in a `core/store/` slice registered at startup.

---

## Lazy Loading & Bundle Strategy

**Q: How does the bundle structure look with 9 lazy-loaded features?**

```
main.js         ~200KB  — app shell, core, shared components, layouts
employees.js    ~80KB   — employees feature + store
dashboard.js    ~90KB   — dashboard + ECharts
payroll.js      ~70KB   — payroll
analytics.js    ~120KB  — analytics + heavy charts
...
Total initial:  ~200KB  (only what user sees first)
Total all:      ~2.0MB  (loaded on demand)
```

A user who only ever uses Dashboard + Employees never downloads `admin.js` or `payroll.js`.

---

## Real-Time Architecture

**Q: How is real-time data handled in the platform?**

```
WebSocketService (singleton in Core)
  │
  ├─ connect() on app start
  ├─ onMessage() → RxJS Subject
  │
  └─ Features subscribe to relevant channels:
      DashboardEffects.listenToHeadcount$
      AttendanceEffects.listenToCheckIns$
      NotificationCenter.listenToAlerts$
```

WebSocket connection is managed once in `WebSocketService`. Features subscribe to it via Effects. On disconnect, `WebSocketService` auto-reconnects with exponential backoff.

---

## Security Architecture

**Q: Walk through the authentication and authorization flow.**

```
1. User submits login form
2. AuthService.login() → POST /api/auth/login → { accessToken, refreshToken }
3. Tokens stored: accessToken in memory, refreshToken in HttpOnly cookie
4. authGuard checks token validity (expiry) before each protected route
5. HTTP interceptor attaches Bearer token to all requests
6. authorizationGuard reads route data.roles, checks user.roles
7. On 401 response: interceptor triggers token refresh flow
8. On failed refresh: AuthService.logout() → redirect to /auth/login
```

Access token in memory (not localStorage) prevents XSS token theft.

---

## Scalability

**Q: How does this frontend support 800 concurrent users?**

Frontend scalability is mostly about the server serving static files:

- Build output is static files (JS/CSS/HTML) — served from CDN
- CDN handles thousands of concurrent users trivially
- No server-side rendering means no app server bottleneck
- WebSocket connections go to a separate backend service

For the Angular app itself:
- OnPush change detection limits client-side CPU usage
- Virtual scrolling in DataTable for 10,000+ rows
- Debounced search inputs (300ms) to limit store dispatches
- Selectors with memoization prevent redundant computation

---

## Design Patterns Used

| Pattern | Where in codebase |
|---------|------------------|
| Facade pattern | Feature services wrap store + API calls |
| Singleton | All core services via CORE_PROVIDERS |
| Observer | NgRx + RxJS throughout |
| Command | NgRx Actions |
| Strategy | Different export formats (CSV/Excel/PDF) in ExportUtil |
| Adapter | NgRx Entity normalizes data |
| Repository | ApiService abstracts HTTP |

---

## Q: If you had to add a new country's payroll rules, how would the architecture support it?

```
1. Add country config to environment.ts (tax tables, currency)
2. Create payroll/models/country-rules.model.ts interface
3. Add CountryRulesService in payroll/services/
4. Effects dispatch loadCountryRules() on feature init
5. Selectors provide rules to payroll components
6. No changes needed to other features
```

The feature boundary means payroll changes stay inside `features/payroll/`. Other features are unaffected.
