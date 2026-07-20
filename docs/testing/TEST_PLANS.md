# Feature Test Plans
## HR Analytics Platform — Per-Module QA Plans

**Format:** Each module has a test plan table covering happy path, edge cases, and negative cases.
**Severity:** P0 = blocker, P1 = major, P2 = minor

---

## Module 1 — Authentication & Authorization

| ID | Test Case | Type | Severity | Steps | Expected |
|----|-----------|------|---------|-------|---------|
| AUTH-01 | Login with valid credentials | Functional | P0 | Enter correct email + password, submit | Redirect to /dashboard, JWT issued |
| AUTH-02 | Login with wrong password | Negative | P0 | Enter wrong password | Error message shown, no redirect |
| AUTH-03 | Login with unregistered email | Negative | P0 | Enter unknown email | Generic error (no user enumeration) |
| AUTH-04 | Access protected route without token | Security | P0 | Navigate to /employees directly | Redirect to /auth/login |
| AUTH-05 | Access admin route as employee | RBAC | P0 | Login as employee, go to /admin | Redirect to /unauthorized |
| AUTH-06 | Token expiry forces re-login | Security | P1 | Wait for token to expire | Redirect to /auth/login |
| AUTH-07 | Logout clears session | Security | P1 | Click logout | Token cleared, redirect to login |
| AUTH-08 | Brute force lockout | Security | P1 | 10 failed logins | Account locked for 15 min |
| AUTH-09 | Password reset flow | Functional | P1 | Click "forgot password" | Email sent with reset link |
| AUTH-10 | RTL login page in Arabic | i18n | P2 | Switch to Arabic before login | Login form is RTL |

---

## Module 2 — Employees

| ID | Test Case | Type | Severity | Expected |
|----|-----------|------|---------|---------|
| EMP-01 | View employee list (HR manager) | Functional | P0 | Paginated table renders with employee data |
| EMP-02 | Search employee by name | Functional | P0 | Results filtered within 600ms |
| EMP-03 | Filter by department | Functional | P1 | Table shows only selected department |
| EMP-04 | Create employee — all fields valid | Functional | P0 | Employee created, appears in list |
| EMP-05 | Create employee — missing email | Validation | P0 | Form shows email required error |
| EMP-06 | Create employee — duplicate email | Validation | P0 | API returns 422 with conflict message |
| EMP-07 | Edit employee details | Functional | P1 | Changes saved, audit log created |
| EMP-08 | Deactivate employee | Functional | P1 | Employee marked inactive, hidden from active list |
| EMP-09 | Employee views own profile only | RBAC | P0 | Cannot access /employees/:otherId |
| EMP-10 | Export to CSV | Functional | P1 | CSV downloads with correct columns + data |
| EMP-11 | Export to Excel | Functional | P1 | XLSX downloads with formatted data |
| EMP-12 | 10,000 employee list performance | Performance | P1 | Page loads within 2s, virtual scroll active |

---

## Module 3 — Attendance

| ID | Test Case | Type | Severity | Expected |
|----|-----------|------|---------|---------|
| ATT-01 | HR records manual check-in | Functional | P0 | Record saved with timestamp |
| ATT-02 | HR records manual check-out | Functional | P0 | Duration calculated correctly |
| ATT-03 | View today's attendance summary | Functional | P0 | Present/absent/late counts shown |
| ATT-04 | Filter by date range | Functional | P1 | Table shows only matching records |
| ATT-05 | Filter by employee | Functional | P1 | Only that employee's records shown |
| ATT-06 | Attendance calendar view | Functional | P1 | Monthly calendar with colour codes |
| ATT-07 | Export attendance report | Functional | P1 | Excel file downloads |
| ATT-08 | GPS check-in within radius | Integration | P1 | Check-in accepted |
| ATT-09 | GPS check-in outside radius | Integration | P1 | Check-in rejected with reason |
| ATT-10 | Edit attendance (override) | Functional | P1 | Override saved with reason + audited |
| ATT-11 | Employee views own attendance | RBAC | P0 | Cannot view other employees |

---

## Module 4 — Payroll

| ID | Test Case | Type | Severity | Expected |
|----|-----------|------|---------|---------|
| PAY-01 | View payroll summary | Functional | P0 | Monthly totals displayed correctly |
| PAY-02 | Run payroll — zero absences | Functional | P0 | Net pay = base + OT - tax - insurance |
| PAY-03 | Run payroll — 3 absence days | Functional | P0 | Deduction calculated proportionally |
| PAY-04 | Run payroll — UAE employee | Functional | P1 | Zero income tax applied |
| PAY-05 | Download payslip PDF | Functional | P0 | PDF contains correct salary breakdown |
| PAY-06 | Export bank transfer file | Functional | P1 | CSV matches bank format |
| PAY-07 | Employee views own payslip | RBAC | P0 | Cannot access other payslips |
| PAY-08 | Finance manager cannot run payroll | RBAC | P0 | Run button not visible |
| PAY-09 | Payroll locked after processing | Functional | P1 | Cannot re-run for same period |
| PAY-10 | Multi-currency display | Functional | P1 | Correct currency symbol per branch |

---

## Module 5 — Performance

| ID | Test Case | Type | Severity | Expected |
|----|-----------|------|---------|---------|
| PERF-01 | Create review cycle | Functional | P0 | Cycle created with start/end dates |
| PERF-02 | Employee submits self-assessment | Functional | P0 | Form saves, status = submitted |
| PERF-03 | Manager approves review | Functional | P0 | Status = approved, score saved |
| PERF-04 | View team performance overview | Functional | P1 | Manager sees team scores |
| PERF-05 | OKR progress update | Functional | P1 | % completion updates on save |
| PERF-06 | Employee cannot edit closed cycle | Validation | P1 | Edit button disabled |
| PERF-07 | 360 feedback — anonymous | Security | P1 | Reviewer name not visible to employee |

---

## Module 6 — Recruitment

| ID | Test Case | Type | Severity | Expected |
|----|-----------|------|---------|---------|
| REC-01 | Create job posting | Functional | P0 | Job appears in pipeline board |
| REC-02 | Move applicant to next stage | Functional | P0 | Stage updates, history logged |
| REC-03 | Schedule interview | Functional | P1 | Calendar entry created |
| REC-04 | Reject applicant | Functional | P1 | Status = rejected, email sent |
| REC-05 | Make offer | Functional | P0 | Offer letter generated as PDF |
| REC-06 | Offer accepted → create employee | Integration | P0 | Employee record auto-created |
| REC-07 | Recruiter cannot view payroll | RBAC | P0 | /payroll returns 403 |

---

## Module 7 — Analytics

| ID | Test Case | Type | Severity | Expected |
|----|-----------|------|---------|---------|
| ANA-01 | Headcount trend chart renders | Functional | P0 | ECharts canvas visible, no JS errors |
| ANA-02 | Turnover report — correct % | Functional | P0 | % matches: (left/avg headcount)*100 |
| ANA-03 | Filter by date range | Functional | P1 | Chart updates to selected period |
| ANA-04 | Filter by department | Functional | P1 | Chart shows department data only |
| ANA-05 | Export report as PDF | Functional | P1 | PDF downloads within 5s |
| ANA-06 | Export report as Excel | Functional | P1 | XLSX downloads with data |
| ANA-07 | Analyst role has read-only access | RBAC | P0 | No edit controls visible |

---

## Module 8 — Admin

| ID | Test Case | Type | Severity | Expected |
|----|-----------|------|---------|---------|
| ADM-01 | Create new user | Functional | P0 | User created, welcome email sent |
| ADM-02 | Assign role to user | Functional | P0 | Role saved, access changes immediately |
| ADM-03 | Deactivate user | Functional | P0 | User cannot login after deactivation |
| ADM-04 | View audit log | Functional | P1 | All actions listed with user + timestamp |
| ADM-05 | Filter audit log by user | Functional | P1 | Filtered to selected user actions |
| ADM-06 | Non-admin cannot access /admin | RBAC | P0 | Redirect to /unauthorized |

---

## Module 9 — Settings

| ID | Test Case | Type | Severity | Expected |
|----|-----------|------|---------|---------|
| SET-01 | Switch language EN → AR | i18n | P1 | All labels change to Arabic, dir=rtl |
| SET-02 | Switch language AR → EN | i18n | P1 | All labels change to English, dir=ltr |
| SET-03 | Switch to dark mode | Functional | P2 | App theme changes to dark |
| SET-04 | Notification preferences saved | Functional | P2 | Preferences persist after refresh |
| SET-05 | Non-admin cannot access settings | RBAC | P1 | Redirect to /unauthorized |

---

## Regression Suite

Run before every release. Covers all P0 tests across all modules above.

```bash
# Tag critical tests with @regression
# Run: npx playwright test --grep @regression
```

Total P0 tests: 28 — must all pass before any production deploy.
