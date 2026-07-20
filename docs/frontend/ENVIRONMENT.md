# Environment Configuration

Environment variables and build configuration for the HR Analytics Platform.

---

## Files

| File | Used When |
|------|-----------|
| `src/environments/environment.ts` | `npm start` (development) |
| `src/environments/environment.prod.ts` | `npm run build` (production) |

---

## Environment Object Shape

```typescript
// environment.ts
export const environment = {
  production: false,

  // API
  apiUrl: 'http://localhost:3000/api',
  wsUrl:  'ws://localhost:3000',

  // Auth
  jwtSecret: 'dev-secret',          // never commit real secret
  tokenExpiryMinutes: 60,
  refreshTokenExpiryDays: 7,

  // Features
  enableDevTools: true,             // NgRx DevTools
  enableMockData: true,             // use mock API responses
  enableAnalytics: false,           // GA4

  // i18n
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'ar'],

  // App
  appName: 'HR Analytics Platform',
  appVersion: '2.0.0',
  supportEmail: 'support@hrplatform.com'
};
```

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.hrplatform.com/api',
  wsUrl:  'wss://api.hrplatform.com',
  jwtSecret: '',                    // injected at build time via CI
  tokenExpiryMinutes: 30,
  refreshTokenExpiryDays: 7,
  enableDevTools: false,
  enableMockData: false,
  enableAnalytics: true,
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'ar'],
  appName: 'HR Analytics Platform',
  appVersion: '2.0.0',
  supportEmail: 'support@hrplatform.com'
};
```

---

## Using in Code

```typescript
import { environment } from '@environments/environment';

// In a service
constructor(private http: HttpClient) {}

getEmployees() {
  return this.http.get(`${environment.apiUrl}/employees`);
}
```

---

## Angular.json File Replacements

Angular automatically swaps `environment.ts` → `environment.prod.ts` on production build
because of the `fileReplacements` in `angular.json`:

```json
"configurations": {
  "production": {
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.prod.ts"
      }
    ]
  }
}
```

---

## CI/CD Environment Injection

For production deployments, sensitive values are injected at build time:

```bash
# Example GitHub Actions step
- name: Build
  env:
    API_URL: ${{ secrets.PROD_API_URL }}
    WS_URL:  ${{ secrets.PROD_WS_URL }}
  run: |
    sed -i "s|https://api.hrplatform.com/api|$API_URL|g" src/environments/environment.prod.ts
    sed -i "s|wss://api.hrplatform.com|$WS_URL|g" src/environments/environment.prod.ts
    npm run build
```

---

## Feature Flags

Control features per environment via `environment.ts`:

```typescript
// Only show dev tools in development
if (environment.enableDevTools) {
  // import devTools provider
}

// Only load mock data in development
if (environment.enableMockData) {
  // load mock interceptor
}
```

---

## Build Commands

| Command | Environment | Optimization |
|---------|------------|-------------|
| `npm start` | development | none |
| `npm run build` | production | tree-shaking, minification |
| `npm run watch` | development | incremental |

---

## Checklist Before Production Deploy

- [ ] `environment.prod.ts` has correct `apiUrl` and `wsUrl`
- [ ] `enableDevTools: false`
- [ ] `enableMockData: false`
- [ ] `enableAnalytics: true` (if GA4 ID is set in index.html)
- [ ] `production: true`
- [ ] No console.log in production code (`npm run lint` catches some)
- [ ] `npm run build` succeeds with no errors
