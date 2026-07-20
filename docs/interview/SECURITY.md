# Security Interview Questions
## HR Analytics Platform

---

## Authentication

**Q: How is JWT authentication implemented?**

```typescript
// AuthService — login flow
login(credentials: LoginCredentials): Observable<AuthResponse> {
  return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(
    tap(response => {
      // Store access token in memory (NOT localStorage — XSS risk)
      this.accessToken = response.accessToken;
      // Refresh token is HttpOnly cookie — set by backend
      this.currentUser$.next(response.user);
    })
  );
}
```

**Why not localStorage?**
- localStorage is accessible by any JavaScript on the page
- An XSS vulnerability would expose the token to attackers
- In-memory tokens are cleared when the page closes (shorter exposure window)
- Refresh token in HttpOnly cookie can't be read by JavaScript at all

---

## RBAC (Role-Based Access Control)

**Q: How does the authorization guard work?**

```typescript
// authorization.guard.ts
export const authorizationGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const requiredRoles: string[] = route.data['roles'] ?? [];
  const user = auth.getCurrentUser();

  if (!user) return router.createUrlTree(['/auth/login']);

  const hasRole = requiredRoles.some(role => user.roles.includes(role));
  if (!hasRole) return router.createUrlTree(['/unauthorized']);

  return true;
};

// Route definition
{
  path: 'payroll',
  canActivate: [authGuard, authorizationGuard],
  data: { roles: ['admin', 'finance_manager'] },
  loadComponent: () => ...
}
```

---

## XSS Prevention

**Q: How does the platform prevent Cross-Site Scripting?**

```typescript
// 1. Angular escapes all template bindings by default
// {{ user.name }}  →  Angular escapes HTML entities automatically

// 2. SafeHtml pipe uses DomSanitizer for rich text
@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(html: string): SafeHtml {
    return this.sanitizer.sanitize(SecurityContext.HTML, html) ?? '';
  }
}

// 3. CSP header in index.html
// script-src 'self' — blocks inline scripts injected by attacker

// 4. Never use innerHTML directly
// ❌ element.innerHTML = userInput;
// ✅ element.textContent = userInput;
```

---

## CSRF Protection

**Q: How is CSRF protection implemented?**

```typescript
// csp.interceptor.ts
export const cspInterceptor: HttpInterceptorFn = (req, next) => {
  const cloned = req.clone({
    headers: req.headers
      .set('X-Requested-With', 'XMLHttpRequest')
      .set('X-CSRF-Token', getCsrfToken())
  });
  return next(cloned);
};

function getCsrfToken(): string {
  // Read from meta tag set by backend on page load
  return document.querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content') ?? '';
}
```

Backend validates `X-CSRF-Token` on all state-changing requests (POST, PUT, DELETE).

---

## Content Security Policy

**Q: Walk through the CSP header in index.html and what each part does.**

```
default-src 'self'                → only load resources from same origin
script-src 'self' 'unsafe-inline' → Angular needs unsafe-inline for bootstrap
style-src 'self' 'unsafe-inline'  → Tailwind utility classes need this
img-src 'self' data: https: blob: → allow data URIs for charts, remote images
font-src 'self' data:             → allow base64 fonts
connect-src 'self' https: wss:    → allow WebSocket (wss:) and HTTPS APIs
frame-ancestors 'self'            → prevent clickjacking (iframes from other origins)
base-uri 'self'                   → prevent base tag hijacking
form-action 'self'                → forms can only POST to same origin
```

---

## Input Validation

**Q: How is user input validated before API calls?**

Three layers:

```typescript
// Layer 1 — HTML5 attributes (first line of defense, not trusted)
<input type="email" required maxlength="254" pattern="..." />

// Layer 2 — Angular Reactive Form validators
this.form = fb.group({
  email: ['', [Validators.required, Validators.email]],
  salary: ['', [Validators.min(0), Validators.max(9999999)]],
  startDate: ['', customDateValidator()]
});

// Layer 3 — Service-level sanitization before API call
createEmployee(data: CreateEmployeeDto) {
  const sanitized = {
    ...data,
    name: data.name.trim().slice(0, 100),
    email: data.email.toLowerCase().trim(),
  };
  return this.http.post('/api/employees', sanitized);
}
```

---

## Audit Logging

**Q: What actions are audit-logged and where?**

```typescript
// AuditService logs to backend API
this.auditService.log({
  action: 'view_employee',
  userId: currentUser.id,
  resourceId: employee.id,
  timestamp: new Date().toISOString()
});
```

Logged actions:
- Login / logout
- Employee record views (compliance)
- Data modifications (create/update/delete)
- Report exports (who exported what and when)
- Permission escalations (role changes)
- Failed login attempts
- Access to payroll/salary data

Retention: 7 years (statutory compliance requirement).

---

## Security Headers Summary

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Prevent clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage |
| `Permissions-Policy` | `geolocation=(self), microphone=(), camera=()` | GPS allowed, mic/cam blocked |
