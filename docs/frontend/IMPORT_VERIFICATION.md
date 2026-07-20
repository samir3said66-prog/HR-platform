# Import Verification Checklist

Verify all imports after any refactoring or new feature addition.

---

## ✅ Core Module Imports

- [ ] `import { AuthService } from '@app/core'`
- [ ] `import { authGuard, authorizationGuard } from '@app/core'`
- [ ] `import { CORE_PROVIDERS } from '@app/core/core.config'`
- [ ] `import { I18nService } from '@app/core'`
- [ ] `import { ThemeService } from '@app/core'`
- [ ] `import { WebSocketService } from '@app/core'`
- [ ] `import { AuditService } from '@app/core'`
- [ ] Core guards location: `src/app/core/guards/` ✓
- [ ] Core services location: `src/app/core/services/` ✓

## ✅ Shared Module Imports

- [ ] `import { SharedModule } from '@app/shared'`
- [ ] `import { ButtonComponent } from '@app/shared/components/ui'`
- [ ] `import { ALL_UI_COMPONENTS } from '@app/shared/components'`
- [ ] `import { UI_FORM_COMPONENTS } from '@app/shared/components'`
- [ ] Pipes: `import { TranslatePipe } from '@app/shared/pipes'`
- [ ] Directives: `import { HasPermissionDirective } from '@app/shared/directives'`
- [ ] Widgets: `import { KpiWidgetComponent } from '@app/shared/widgets'`

## ✅ Feature Route Imports

- [ ] `import { DASHBOARD_ROUTES } from '@app/features/dashboard'`
- [ ] `import { EMPLOYEES_ROUTES } from '@app/features/employees'`
- [ ] `import { PERFORMANCE_ROUTES } from '@app/features/performance'`
- [ ] `import { RECRUITMENT_ROUTES } from '@app/features/recruitment'`
- [ ] `import { ANALYTICS_ROUTES } from '@app/features/analytics'`
- [ ] `import { ATTENDANCE_ROUTES } from '@app/features/attendance'`
- [ ] `import { PAYROLL_ROUTES } from '@app/features/payroll'`
- [ ] `import { ADMIN_ROUTES } from '@app/features/admin'`
- [ ] `import { SETTINGS_ROUTES } from '@app/features/settings'`

## ✅ Store Imports

- [ ] `import { getStoreConfig } from '@app/store.config'`
- [ ] `import { EMPLOYEES_STORE_CONFIG } from '@app/features/employees/store'`
- [ ] `import { DASHBOARD_STORE_CONFIG } from '@app/features/dashboard/store'`
- [ ] `import { PERFORMANCE_STORE_CONFIG } from '@app/features/performance/store'`
- [ ] `import { PREFERENCES_STORE_CONFIG } from '@app/features/settings/store'`

## ✅ Layout Imports

- [ ] `import { DashboardLayoutComponent } from '@app/layouts'`
- [ ] `import { AuthLayoutComponent } from '@app/layouts'`
- [ ] `import { PrintLayoutComponent } from '@app/layouts'`

---

## ❌ Deprecated Patterns

Never use these — they point to deleted folders:

```typescript
// ❌ Old component location (folder deleted)
import { X } from './components/...';

// ❌ Old services location (folder deleted)
import { X } from './services';

// ❌ Old guards location (folder deleted)
import { X } from './guards/...';

// ❌ Old store location (folder deleted)
import { X } from './store/...';

// ❌ Old pages location (folder deleted)
import { X } from './pages/...';
```

---

## Path Aliases (tsconfig.json)

```json
"paths": {
  "@app/*":          ["src/app/*"],
  "@components/*":   ["src/app/components/*"],
  "@services/*":     ["src/app/services/*"],
  "@models/*":       ["src/app/models/*"],
  "@store/*":        ["src/app/store/*"],
  "@utils/*":        ["src/app/utils/*"],
  "@environments/*": ["src/environments/*"]
}
```

---

## Build Verification Commands

```bash
npm run lint            # catches stale import patterns
npm run build           # catches missing modules
npm run format:check    # checks formatting
```

---

## Status

**Last verified:** 2026-07-20
**Status:** ✅ All imports updated — ready for build
