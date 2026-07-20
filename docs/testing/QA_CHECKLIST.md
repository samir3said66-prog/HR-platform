# QA Release Checklist
## HR Analytics Platform

**Use this checklist before every production deployment.**
Sign-off required from: QA Lead + Frontend Lead + Backend Lead

---

## Pre-Release Gates (must all pass)

### 1. Automated Tests

- [ ] `npm run lint` — 0 errors (frontend)
- [ ] `npm run build` — 0 build errors (frontend)
- [ ] Frontend unit tests — 0 failures, coverage ≥ baseline
- [ ] Backend unit tests — 0 failures, coverage ≥ baseline
- [ ] API integration tests (Newman) — 0 failures
- [ ] E2E regression suite — all 28 P0 tests pass
- [ ] Accessibility audit (Lighthouse) — score ≥ 95
- [ ] No new `console.error` in browser during E2E run

### 2. Performance

- [ ] Lighthouse Performance score ≥ 90 on `/dashboard`
- [ ] Lighthouse Performance score ≥ 90 on `/employees`
- [ ] Initial page load < 2s (Lighthouse lab, fast 3G)
- [ ] Bundle size has not increased by more than 10% vs last release
- [ ] No memory leaks detected in 10-minute session recording

### 3. Security

- [ ] No new HIGH/CRITICAL findings in OWASP ZAP scan
- [ ] No secrets committed in this release's diff (`git log` checked)
- [ ] CSP headers present and correct (check DevTools → Network → Response Headers)
- [ ] Auth tokens not in localStorage (check DevTools → Application)
- [ ] All new API endpoints have auth + RBAC tests passing

### 4. Cross-Browser

- [ ] Chrome (latest) — full smoke test (login → dashboard → employees → payroll)
- [ ] Firefox (latest) — login + dashboard
- [ ] Safari (latest) — login + dashboard
- [ ] Mobile Safari (iPhone) — login + navigation
- [ ] Mobile Chrome (Android) — login + navigation

### 5. i18n / RTL

- [ ] English layout — no overflow, no clipped text
- [ ] Arabic layout — RTL direction correct, no broken UI elements
- [ ] Language switch persists after page reload
- [ ] Currency and date formats correct per locale

### 6. Accessibility

- [ ] axe-core: 0 violations on login page
- [ ] axe-core: 0 violations on dashboard
- [ ] axe-core: 0 violations on employee list
- [ ] Keyboard navigation: can complete login without mouse
- [ ] Screen reader: page announces route changes (tested with NVDA)

### 7. Assets & SEO

- [ ] Favicon visible in browser tab (Chrome, Firefox, Safari)
- [ ] PWA installable — "Add to Home Screen" prompt appears
- [ ] OG image shows correctly (test via Facebook Debugger)
- [ ] `robots.txt` accessible at `/robots.txt`
- [ ] `manifest.json` valid (check DevTools → Application → Manifest)
- [ ] No 404s for any icon, font, or CSS file (check DevTools → Network)

---

## Feature-Specific Checks (for this release)

_Fill in for each feature changed in this release:_

| Feature | Changes made | Tested by | Date |
|---------|-------------|----------|------|
| | | | |
| | | | |

---

## Staging Smoke Test

Run this manually on staging before promoting to production:

```
1. Login as admin@hr-test.com
2. Dashboard loads with KPI cards
3. Navigate to /employees — list renders
4. Navigate to /payroll — summary visible
5. Navigate to /analytics — chart renders (no JS errors)
6. Switch language to Arabic — RTL layout correct
7. Switch back to English
8. Toggle dark mode — theme changes
9. Logout — redirects to /auth/login
10. Attempt /dashboard without login — redirected to /auth/login
```

All 10 steps must pass. ✅

---

## Known Issues (approved to ship)

| ID | Description | Severity | Workaround |
|----|-------------|---------|-----------|
| — | None approved at this time | — | — |

---

## Sign-Off

| Role | Name | Date | Signed |
|------|------|------|--------|
| QA Lead | | | ☐ |
| Frontend Lead | | | ☐ |
| Backend Lead | | | ☐ |
| Product Owner | | | ☐ |

**Deployment approved:** ☐ Yes  ☐ No — blocked by: _______________

---

## Post-Deploy Verification (run within 15 min of deploy)

- [ ] Production URL loads without error
- [ ] Login works with production credentials
- [ ] Dashboard KPIs show real data (not test data)
- [ ] Sentry: no new error spike in first 5 minutes
- [ ] Monitoring dashboard: CPU/memory/latency normal
- [ ] Rollback standing by (see `docs/devops/DEPLOYMENT.md`)
