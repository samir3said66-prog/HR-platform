# Testing & QA Interview Questions
## HR Analytics Platform

---

## Test Strategy

**Q: What is the testing pyramid for this project?**

```
        /\
       /E2E\         ← Playwright / Cypress (not yet implemented)
      /------\
     /  Integ  \     ← TestBed component + store integration tests
    /------------\
   /  Unit Tests  \  ← Vitest: reducers, services, guards, pipes
  /________________\
```

Most coverage is at unit level (fast, isolated). Integration tests cover component + store interaction. E2E is planned for Phase 5.

---

## Vitest Setup

**Q: Why Vitest instead of Jest or Karma?**

| | Vitest | Jest | Karma |
|--|--------|------|-------|
| Speed | Fastest (native ESM) | Fast | Slow (browser-based) |
| Config | Minimal | Moderate | Heavy |
| Angular 21 support | ✅ | Needs extra config | ✅ (legacy) |
| Vite integration | Native | Via jest-environment-vite | No |

This project already uses Vite as a build tool. Vitest shares the same config — zero additional setup.

---

## Unit Testing: Reducers

**Q: How do you unit test an NgRx reducer?**

Reducers are pure functions — easiest to test:

```typescript
describe('employeesReducer', () => {
  const initialState: EmployeesState = {
    ids: [], entities: {}, loading: false, error: null, selectedId: null
  };

  it('sets loading=true on loadEmployees', () => {
    const state = employeesReducer(initialState, loadEmployees());
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('populates entities on loadEmployeesSuccess', () => {
    const employees = [{ id: '1', name: 'Alice' }];
    const state = employeesReducer(initialState, loadEmployeesSuccess({ employees }));
    expect(state.ids).toEqual(['1']);
    expect(state.entities['1']?.name).toBe('Alice');
    expect(state.loading).toBe(false);
  });

  it('sets error on loadEmployeesFailure', () => {
    const state = employeesReducer(initialState, loadEmployeesFailure({ error: 'Network error' }));
    expect(state.error).toBe('Network error');
    expect(state.loading).toBe(false);
  });
});
```

---

## Unit Testing: Guards

```typescript
describe('authGuard', () => {
  it('returns true when user is authenticated', () => {
    const mockAuth = { isAuthenticated: vi.fn().mockReturnValue(true) };
    const mockRouter = { createUrlTree: vi.fn() };
    // inject mocks, call guard
    expect(authGuard(mockRoute, mockState)).toBe(true);
  });

  it('redirects to /auth/login when unauthenticated', () => {
    const mockAuth = { isAuthenticated: vi.fn().mockReturnValue(false) };
    // ...
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
  });
});
```

---

## Unit Testing: Pipes

```typescript
describe('TruncatePipe', () => {
  const pipe = new TruncatePipe();

  it('returns string as-is when shorter than limit', () => {
    expect(pipe.transform('Hello', 10)).toBe('Hello');
  });

  it('truncates to limit and adds ellipsis', () => {
    expect(pipe.transform('Hello World', 5)).toBe('Hello...');
  });

  it('handles empty string', () => {
    expect(pipe.transform('', 10)).toBe('');
  });
});
```

---

## Accessibility Testing

```typescript
import { axe, toHaveNoViolations } from 'vitest-axe';
expect.extend(toHaveNoViolations);

it('ButtonComponent has no accessibility violations', async () => {
  const fixture = TestBed.createComponent(ButtonComponent);
  fixture.componentInstance.variant = 'primary';
  fixture.detectChanges();

  const results = await axe(fixture.nativeElement);
  expect(results).toHaveNoViolations();
});
```

Key accessibility checks:
- Button has accessible label (text content or aria-label)
- Focus indicator visible
- Color contrast ≥ 4.5:1
- Input has associated label
- Image has alt text

---

## Security Tests (security.spec.ts)

The project includes a dedicated security test file:

```typescript
// Authentication tests
it('should reject invalid credentials')
it('should store JWT token securely')
it('should clear session on logout')

// RBAC tests
it('should deny unauthorized access to protected resources')
it('should support multiple roles per user')

// XSS prevention tests
it('should sanitize user input to prevent XSS')
it('should escape HTML in user-generated content')

// Input validation tests
it('should validate email format')
it('should validate password strength')
it('should reject SQL injection attempts')
```

---

## Performance Tests (performance.spec.ts)

Placeholder tests with estimated values — become real measurements in CI:

```typescript
it('should filter 10,000 records within 600ms')
it('should load dashboard within 2 seconds')
it('should maintain 60 FPS while scrolling large dataset')
it('should generate PDF report within 5 seconds')
```

---

## Testing Checklist

| Area | Coverage Target |
|------|----------------|
| NgRx reducers | 90% |
| Route guards | 90% |
| Custom pipes | 100% |
| Services (core) | 80% |
| Feature services | 70% |
| UI components | 60% |
| Accessibility (axe) | 100% of shared components |
