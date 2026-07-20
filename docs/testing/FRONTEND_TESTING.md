# Testing Guide

Testing strategy and conventions for the HR Analytics Platform frontend.

---

## Test Runner

**Vitest** is used for all unit tests (configured in `vite.config.ts`).
Angular's `TestBed` is available for component tests.
**axe-core** is used for accessibility tests.

```bash
npm test              # run all tests once
npm run test          # alias
```

---

## Test File Locations

Co-locate spec files next to the file they test:

```
src/app/
├── app.spec.ts                          ← root component
├── core/
│   ├── auth/
│   │   └── auth.service.spec.ts
│   ├── guards/
│   │   └── auth.guard.spec.ts
│   └── services/
│       └── websocket.service.spec.ts
├── features/
│   └── employees/
│       ├── pages/employees/employees.component.spec.ts
│       └── store/employees.reducer.spec.ts
└── shared/
    └── components/ui/button/button.component.spec.ts
```

---

## Writing Unit Tests

### Service test

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(/* mock deps */);
  });

  it('should return false when no token stored', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should call login endpoint with credentials', async () => {
    const http = { post: vi.fn().mockResolvedValue({ token: 'abc' }) };
    const result = await service.login({ email: 'a@b.com', password: '123' });
    expect(http.post).toHaveBeenCalled();
  });
});
```

### NgRx reducer test

```typescript
import { employeeReducer } from './employees.reducer';
import { loadEmployeesSuccess } from './employees.actions';

describe('employeeReducer', () => {
  it('should set employees on loadEmployeesSuccess', () => {
    const employees = [{ id: '1', name: 'Alice' }];
    const state = employeeReducer(undefined, loadEmployeesSuccess({ employees }));
    expect(state.employees).toEqual(employees);
    expect(state.loading).toBe(false);
  });
});
```

### Angular component test (TestBed)

```typescript
import { TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should emit clicked event on click', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    const spy = vi.spyOn(fixture.componentInstance.clicked, 'emit');
    fixture.nativeElement.querySelector('button').click();
    expect(spy).toHaveBeenCalled();
  });
});
```

---

## Accessibility Tests

Using `vitest-axe` + `axe-core`:

```typescript
import { axe, toHaveNoViolations } from 'vitest-axe';
expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const fixture = TestBed.createComponent(ButtonComponent);
  fixture.detectChanges();
  const results = await axe(fixture.nativeElement);
  expect(results).toHaveNoViolations();
});
```

---

## Existing Test Files

| File | What it tests |
|------|--------------|
| `src/app/app.spec.ts` | App root component |
| `src/app/performance.spec.ts` | Performance benchmarks (placeholder) |
| `src/app/security.spec.ts` | Security & auth logic (CSRF, XSS, RBAC) |

---

## Security Tests Coverage (security.spec.ts)

- Authentication: valid/invalid credentials, JWT storage, session timeout, logout
- Authorization: RBAC role checks, route access, 403 responses, multi-role users
- CSRF: token inclusion in POST/PUT/DELETE, server validation
- XSS: input sanitization, HTML escaping, script injection prevention, CSP headers
- Input validation: email, password strength, numeric ranges, dates, SQL injection
- Encryption: HTTPS, at-rest encryption, TLS version
- Audit logging: login, data access, modification, export events
- Security headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, HSTS

---

## Performance Tests (performance.spec.ts)

Placeholder tests validating estimated values:

- Bundle size < 2.5MB
- Dashboard load < 2s
- Filter 10,000 records < 600ms
- Real-time update propagation < 500ms
- PDF report generation < 5s
- 800 concurrent users

These become real E2E / CI measurements when the app is deployed.

---

## What to Test

### Must test
- All NgRx reducers
- All guards (`canActivate` logic)
- All custom pipes
- All services with business logic

### Should test
- Complex components (with data interaction)
- Store effects (mock HTTP calls)
- Form validation logic

### Skip (not worth unit testing)
- Simple presentational components (visual only)
- Barrel index files
- Constant definitions

---

## Mocking

```typescript
// Mock Angular service
const mockAuthService = {
  isAuthenticated: vi.fn().mockReturnValue(true),
  getUser: vi.fn().mockReturnValue({ id: '1', roles: ['admin'] })
};

// Mock NgRx store
const mockStore = { select: vi.fn(), dispatch: vi.fn() };

// Mock HttpClient
const mockHttp = { get: vi.fn(), post: vi.fn() };
```

---

## Coverage

To see coverage report (when configured):

```bash
npx vitest run --coverage
```

Target coverage goals:
- Services: 80%+
- Reducers: 90%+
- Guards: 90%+
- Pipes: 100%
