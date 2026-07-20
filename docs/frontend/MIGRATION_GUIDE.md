# Migration Guide

## From Flat Structure → Feature-Based Architecture

This guide helps developers migrate from the old flat structure to the new feature-based architecture.

---

## What Changed

| Old location | New location |
|-------------|-------------|
| `app/components/` | `app/shared/components/ui/` |
| `app/services/` | `app/core/services/` |
| `app/guards/` | `app/core/guards/` |
| `app/store/` | `app/features/*/store/` |
| `app/pages/` | `app/features/*/pages/` |
| `app/security/` | `app/core/` |
| `app/testing/` | `src/config/` |
| `app/assets/` | `src/assets/` |

---

## Import Changes

### Components

```typescript
// ❌ OLD
import { ButtonComponent } from './components/button/button.component';

// ✅ NEW
import { ButtonComponent } from '@app/shared/components/ui';
```

### Services

```typescript
// ❌ OLD
import { AuthService } from './services/auth.service';
import { I18nService, ThemeService } from './services';

// ✅ NEW
import { AuthService, I18nService, ThemeService } from '@app/core';
```

### Guards

```typescript
// ❌ OLD
import { authGuard } from './guards/auth.guard';

// ✅ NEW
import { authGuard, authorizationGuard } from '@app/core';
```

### Store

```typescript
// ❌ OLD
import { AppState } from './store/app.state';
import { employeeReducer } from './store/employees/employees.reducer';

// ✅ NEW — store registered centrally, access via selectors
import { getStoreConfig } from '@app/store.config';
import { selectAllEmployees } from '@app/features/employees/store';
```

### Pages / Routes

```typescript
// ❌ OLD — eager page imports
import { EmployeesComponent } from './pages/employees/employees.component';

// ✅ NEW — lazy via routes
// app.routes.ts: loadComponent(() => import('./features/employees/...'))
// Access routes via:
import { EMPLOYEES_ROUTES } from '@app/features/employees';
```

---

## Path Aliases

These are set in `tsconfig.json`:

```json
"paths": {
  "@app/*":      ["src/app/*"],
  "@components/*": ["src/app/components/*"],
  "@services/*": ["src/app/services/*"],
  "@models/*":   ["src/app/models/*"],
  "@store/*":    ["src/app/store/*"],
  "@utils/*":    ["src/app/utils/*"],
  "@environments/*": ["src/environments/*"]
}
```

For the new structure always use `@app/*`:

```typescript
import { X } from '@app/core';
import { Y } from '@app/shared/components/ui';
import { Z } from '@app/features/employees/store';
```

---

## Adding a New Feature

```
1. mkdir src/app/features/my-feature
2. Create subfolders: pages/ components/ services/ store/ models/
3. Create my-feature.routes.ts
4. Create index.ts  (barrel export)
5. Add to features/index.ts
6. Add route to app.routes.ts under MainLayout
7. Register store in store.config.ts  (if needed)
8. Add docs/MY_FEATURE.md
```

Minimal route entry:

```typescript
{
  path: 'my-feature',
  canActivate: [authGuard, authorizationGuard],
  data: { roles: ['admin', 'manager'] },
  loadComponent: () =>
    import('./features/my-feature/pages/my-feature/my-feature.component')
      .then(m => m.MyFeatureComponent)
}
```

---

## Adding a Shared Component

```
1. Create src/app/shared/components/ui/my-widget/
2. Implement my-widget.component.ts  (standalone, OnPush)
3. Export from shared/components/ui/index.ts
4. Add to shared/components/index.ts groups
5. Add to SharedModule imports[] + exports[]
6. Document in docs/COMPONENTS.md
```

---

## Deprecated Patterns (Do Not Use)

```typescript
// ❌ Relative imports for shared items
import { X } from '../../components/x/x.component';

// ❌ Providing singleton services per-feature
@Component({ providers: [AuthService] })

// ❌ Importing store reducers directly in app.config
import { employeeReducer } from './store/...';

// ❌ Accessing store internals without barrel
import { EmployeeEffects } from '@app/features/employees/store/employees.effects';
// Use: import { EmployeeEffects } from '@app/features/employees/store';
```

---

## Verification Steps

```bash
npm run lint          # catches deprecated import patterns
npm run build         # catches missing modules / path errors
npm run test          # verifies unit tests still pass
npm start             # smoke-test at http://localhost:4200
```

---

## Help

See related docs in `docs/`:

- `ARCHITECTURE.md` — full system diagram
- `COMPONENTS.md` — component API reference
- `IMPORT_VERIFICATION.md` — import checklist
- `ENVIRONMENT.md` — env var setup
