# HR Domain Interview Questions
## HR Analytics Platform — Business Context

---

## Core HR Modules

**Q: What are the 9 modules in this platform and what business problem does each solve?**

| Module | Business Problem Solved |
|--------|------------------------|
| **Dashboard** | Executives lack real-time visibility into headcount, attendance, and payroll spend |
| **Employees** | Employee data scattered across spreadsheets, no single source of truth |
| **Attendance** | Manual punch-in is easily abused (buddy punching); GPS/face recognition prevents it |
| **Payroll** | Manual salary calculation has errors; automation ensures 100% accuracy every month |
| **Performance** | Annual reviews are too infrequent; continuous OKR tracking drives accountability |
| **Recruitment** | No pipeline visibility; hiring managers can't see where candidates are stuck |
| **Analytics** | Turnover is expensive but unpredictable; analytics identify flight risk early |
| **Admin** | Growing companies need granular control over who can see/edit sensitive data |
| **Settings** | Multi-branch companies need branch-specific rules without IT involvement |

---

## Attendance Module

**Q: What are the technical requirements for GPS and face recognition attendance?**

```
GPS attendance:
- Employee opens mobile app → browser requests geolocation (Permissions-Policy: geolocation=(self))
- Frontend sends: { lat, lng, timestamp, employeeId }
- Backend validates: is lat/lng within allowed radius of registered branch location?
- Check-in recorded or rejected with reason

Face recognition attendance:
- Works with ZKTeco / Hikvision biometric devices
- Sync agent on-premises pushes check-in events to backend via WebSocket
- Frontend displays real-time attendance status (connected via WebSocketService)
- No face data stored on frontend — biometrics processed on device or backend

Manual override:
- HR manager can manually approve/correct an attendance record
- Override is audit-logged with reason and approver ID
```

---

## Payroll Module

**Q: What complexity is involved in automated payroll?**

```
Inputs:
- Base salary (monthly / hourly)
- Attendance days (from attendance module)
- Overtime hours
- Deductions (absences, loans, penalties)
- Additions (bonuses, commissions, allowances)
- Tax rates (country-specific: Egypt ITAX, Saudi Zakat, UAE no income tax)
- Social insurance (Egypt NOSI, Saudi GOSI, UAE GPSSA)

Calculation:
GrossPay = BaseSalary + Overtime + Bonuses + Allowances
Deductions = Absences + Penalties + Loans + Insurance + Tax
NetPay = GrossPay - Deductions

Output:
- Individual payslip PDF (employee views in self-service)
- Payroll summary report (finance team)
- Bank transfer file (per bank format: XML, CSV)
- Audit trail of calculation inputs
```

---

## Performance Module

**Q: How does OKR tracking work in the platform?**

```
OKR = Objectives and Key Results

Objective: "Increase sales team headcount by Q3"
  Key Result 1: Hire 3 senior sales engineers by Aug 1    → 33% complete
  Key Result 2: Reduce time-to-hire from 45 to 30 days   → 60% complete
  Key Result 3: Achieve 90% offer acceptance rate        → 100% complete

Review cycles:
- Manager creates review period (e.g., Q3 2026: Jul 1 – Sep 30)
- Employees self-assess on key results
- Manager reviews and scores
- HR sees aggregate performance across departments

360 Feedback:
- Employee nominates peers for feedback
- Peers fill anonymous form
- Results aggregated, outliers filtered
- Visible to employee + manager
```

---

## Recruitment Module

**Q: What are the stages in a recruitment pipeline?**

```
Standard pipeline stages:
1. Applied       → CV received, not reviewed
2. Screening     → HR phone screen scheduled / completed
3. Interview     → Technical / cultural interview
4. Assessment    → Test / take-home assignment
5. Offer         → Offer letter sent
6. Accepted      → Candidate accepted
7. Onboarding    → Start date set, paperwork in progress

Each stage has:
- Responsible person (recruiter / hiring manager)
- Due date (SLA: move candidate within 5 business days)
- Notes / scorecard
- Documents (CV, cover letter, test results)

Offer management:
- Offer letter PDF generated from template
- Signed digitally (or scanned and uploaded)
- Offer → Accepted triggers onboarding checklist creation in Employees module
```

---

## Analytics Module

**Q: What insights does the analytics module provide?**

| Report | Business Use |
|--------|-------------|
| **Headcount trend** | Are we growing? Over-staffed in any dept? |
| **Turnover rate** | Which departments lose the most people? |
| **Time-to-hire** | How long does recruiting take per role type? |
| **Absenteeism rate** | Which teams have attendance problems? |
| **Payroll cost by dept** | Is Engineering over budget? |
| **Performance distribution** | What % of staff is high/mid/low performer? |
| **Overtime analysis** | Which roles are consistently overloaded? |
| **Workforce forecast** | Predicted headcount based on growth plans |

---

## RBAC Design

**Q: What roles exist in this HR platform and what can each do?**

| Role | Can Do |
|------|--------|
| **Admin** | Everything — user management, RBAC config, all data |
| **HR Manager** | All HR operations — employees, payroll, attendance, recruitment |
| **Finance Manager** | Payroll view + export only, no edit |
| **Recruiter** | Recruitment pipeline only |
| **Manager** | Their own team's attendance, performance, leave |
| **Employee** | Own profile, own payslips, own leave requests |
| **Analyst** | Read-only access to analytics and reports |

Route-level enforcement:
```typescript
{ path: 'payroll', data: { roles: ['admin', 'finance_manager', 'hr_manager'] } }
{ path: 'admin',   data: { roles: ['admin'] } }
```

Component-level enforcement:
```html
<button *appHasPermission="'employees.delete'">Delete Employee</button>
```

---

## Multi-Branch / Multi-Country

**Q: How does the platform support companies with branches in multiple countries?**

```typescript
// Each branch has:
interface Branch {
  id: string;
  name: string;
  country: 'EG' | 'SA' | 'AE' | 'IQ' | 'KW';
  currency: 'EGP' | 'SAR' | 'AED' | 'IQD' | 'KWD';
  timezone: string;
  payrollRules: CountryPayrollRules;
  attendanceRadius: number;  // GPS check-in radius in meters
  workingDays: DayOfWeek[];  // e.g., Sun–Thu for Gulf countries
}
```

An admin with multi-branch access sees all branches from one login.
Branch managers see only their branch.
Payroll is calculated per-branch with branch-specific tax/social insurance rules.
Reports can be filtered by branch or show aggregate across all branches.
