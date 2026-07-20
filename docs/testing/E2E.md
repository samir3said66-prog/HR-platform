# End-to-End Test Plans
## HR Analytics Platform — Playwright

**Tool:** Playwright 1.x
**Runs on:** CI staging environment after every merge to `main`
**Base URL:** `https://staging.hrplatform.com`

> **Not covered here:** Frontend unit tests → `docs/frontend/TESTING.md`
> Backend API tests → `docs/testing/BACKEND_TESTING.md`

---

## Setup

```bash
# Install
npm install -D @playwright/test
npx playwright install chromium firefox webkit

# Run all E2E
npx playwright test

# Run specific suite
npx playwright test tests/e2e/auth.spec.ts

# UI mode (debug)
npx playwright test --ui

# Headed (watch browser)
npx playwright test --headed
```

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  retries: 2,
  workers: 4,
  use: {
    baseURL: process.env['E2E_BASE_URL'] ?? 'http://localhost:4200',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { channel: 'chrome' } },
    { name: 'firefox' },
    { name: 'webkit' },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
  ],
});
```

---

## Test Accounts (Seeded in Staging)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hr-test.com | Test@1234! |
| HR Manager | hr@hr-test.com | Test@1234! |
| Finance Manager | finance@hr-test.com | Test@1234! |
| Employee | emp@hr-test.com | Test@1234! |
| Recruiter | recruit@hr-test.com | Test@1234! |

---

## Journey 1 — Authentication

**File:** `tests/e2e/auth.spec.ts`

```typescript
test.describe('Authentication', () => {

  test('TC-AUTH-01: valid login redirects to dashboard', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('[data-testid="email"]', 'admin@hr-test.com');
    await page.fill('[data-testid="password"]', 'Test@1234!');
    await page.click('[data-testid="login-btn"]');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="kpi-headcount"]')).toBeVisible();
  });

  test('TC-AUTH-02: invalid credentials shows error', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('[data-testid="email"]', 'wrong@test.com');
    await page.fill('[data-testid="password"]', 'wrongpass');
    await page.click('[data-testid="login-btn"]');
    await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
    await expect(page).toHaveURL('/auth/login');
  });

  test('TC-AUTH-03: unauthenticated access redirects to login', async ({ page }) => {
    await page.goto('/employees');
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('TC-AUTH-04: employee role blocked from /admin', async ({ page }) => {
    await loginAs(page, 'emp@hr-test.com');
    await page.goto('/admin');
    await expect(page).toHaveURL('/unauthorized');
  });

  test('TC-AUTH-05: logout clears session', async ({ page }) => {
    await loginAs(page, 'admin@hr-test.com');
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-btn"]');
    await expect(page).toHaveURL('/auth/login');
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/auth\/login/);
  });
});
```

---

## Journey 2 — Employee Management

**File:** `tests/e2e/employees.spec.ts`

| ID | Scenario | Role | Expected |
|----|----------|------|---------|
| TC-EMP-01 | View employee list | HR Manager | Table renders with pagination |
| TC-EMP-02 | Search by name | HR Manager | Filtered results appear within 600ms |
| TC-EMP-03 | Create new employee | HR Manager | Form submits, row appears in list |
| TC-EMP-04 | View employee detail | HR Manager | Profile page loads with correct data |
| TC-EMP-05 | Edit employee role | Admin | Role updated, audit log entry created |
| TC-EMP-06 | Employee cannot view others | Employee | Access denied to other profiles |
| TC-EMP-07 | Export to CSV | HR Manager | File downloads with correct headers |

```typescript
test('TC-EMP-03: create employee end-to-end', async ({ page }) => {
  await loginAs(page, 'hr@hr-test.com');
  await page.goto('/employees');
  await page.click('[data-testid="add-employee-btn"]');
  await page.fill('[data-testid="field-name"]', 'Test Employee');
  await page.fill('[data-testid="field-email"]', 'test.e2e@company.com');
  await page.selectOption('[data-testid="field-dept"]', 'Engineering');
  await page.click('[data-testid="save-employee-btn"]');
  await expect(page.locator('text=Test Employee')).toBeVisible();
});
```

---

## Journey 3 — Attendance

**File:** `tests/e2e/attendance.spec.ts`

| ID | Scenario | Expected |
|----|----------|---------|
| TC-ATT-01 | View today's attendance summary | Dashboard card shows live count |
| TC-ATT-02 | HR manually records check-in | Record saved, visible in table |
| TC-ATT-03 | Filter attendance by date range | Table filtered correctly |
| TC-ATT-04 | Export attendance report | Excel file downloads |
| TC-ATT-05 | View employee's monthly attendance | Calendar view renders correctly |

---

## Journey 4 — Payroll

**File:** `tests/e2e/payroll.spec.ts`

| ID | Scenario | Role | Expected |
|----|----------|------|---------|
| TC-PAY-01 | View payroll summary | Finance Manager | Monthly total shown |
| TC-PAY-02 | Run payroll cycle | Admin | Calculation completes, status = processed |
| TC-PAY-03 | Download payslip PDF | Employee | PDF opens with correct salary |
| TC-PAY-04 | Employee cannot run payroll | Employee | Button not visible |
| TC-PAY-05 | Export bank transfer file | Finance Manager | CSV downloads with correct format |

```typescript
test('TC-PAY-03: employee downloads own payslip', async ({ page }) => {
  await loginAs(page, 'emp@hr-test.com');
  await page.goto('/payroll');
  const [ download ] = await Promise.all([
    page.waitForEvent('download'),
    page.click('[data-testid="download-payslip-btn"]'),
  ]);
  expect(download.suggestedFilename()).toMatch(/payslip.*\.pdf/);
});
```

---

## Journey 5 — Analytics & Reports

**File:** `tests/e2e/analytics.spec.ts`

| ID | Scenario | Expected |
|----|----------|---------|
| TC-ANA-01 | Headcount trend chart renders | ECharts canvas visible, no errors |
| TC-ANA-02 | Turnover report loads | Table with % data visible |
| TC-ANA-03 | Export report as PDF | PDF downloaded within 5s |
| TC-ANA-04 | Filter by department | Chart updates to show filtered data |

---

## Journey 6 — i18n & RTL

**File:** `tests/e2e/i18n.spec.ts`

| ID | Scenario | Expected |
|----|----------|---------|
| TC-I18N-01 | Switch to Arabic | `dir="rtl"` on `<html>`, sidebar flips |
| TC-I18N-02 | All labels translate | No untranslated keys visible |
| TC-I18N-03 | Switch back to English | `dir="ltr"` restored |

```typescript
test('TC-I18N-01: Arabic RTL layout', async ({ page }) => {
  await loginAs(page, 'admin@hr-test.com');
  await page.click('[data-testid="lang-toggle"]');
  await page.click('[data-testid="lang-ar"]');
  const dir = await page.evaluate(() => document.documentElement.dir);
  expect(dir).toBe('rtl');
});
```

---

## Visual Regression (Optional)

```typescript
test('dashboard matches snapshot', async ({ page }) => {
  await loginAs(page, 'admin@hr-test.com');
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png', { maxDiffPixels: 100 });
});
```

Run with: `npx playwright test --update-snapshots` to update baseline.

---

## Helper Utilities

```typescript
// tests/e2e/helpers/auth.helper.ts
export async function loginAs(page: Page, email: string, password = 'Test@1234!') {
  await page.goto('/auth/login');
  await page.fill('[data-testid="email"]', email);
  await page.fill('[data-testid="password"]', password);
  await page.click('[data-testid="login-btn"]');
  await page.waitForURL('/dashboard');
}
```

---

## CI Integration

```yaml
# .github/workflows/ci-cd.yml (E2E stage)
e2e:
  needs: [deploy-staging]
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npx playwright install --with-deps chromium
    - run: npx playwright test
      env:
        E2E_BASE_URL: https://staging.hrplatform.com
    - uses: actions/upload-artifact@v4
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/
```

---

## Pass/Fail Criteria

| Gate | Threshold |
|------|-----------|
| All critical journeys (Auth, Employee, Payroll) | 100% pass |
| Full suite | ≥ 95% pass |
| P0 failures | Block deployment |
| P1 failures | Require sign-off before deploy |
