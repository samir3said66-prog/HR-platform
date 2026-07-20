# Service Level Agreement (SLA)
## HR Analytics Platform — Frontend

**Version:** 2.0 | **Date:** 2026-07-20

---

## 1. Scope

This SLA covers the frontend application delivered under the HR Analytics Platform project, including bug fixes, performance issues, and change requests during the support period.

---

## 2. Support Hours

| Tier | Hours | Response |
|------|-------|----------|
| Critical (P0) | 24/7 | 4 hours |
| High (P1) | Mon–Fri 9am–6pm | 1 business day |
| Medium (P2) | Mon–Fri 9am–6pm | 3 business days |
| Low (P3) | Mon–Fri 9am–6pm | 5 business days |

---

## 3. Issue Priority Definitions

| Priority | Definition | Examples |
|----------|-----------|---------|
| **P0 — Critical** | App completely unusable or data loss risk | White screen, login broken, payroll calculation wrong |
| **P1 — High** | Core feature broken, no workaround | Employee list won't load, payslip export fails |
| **P2 — Medium** | Feature degraded, workaround exists | Chart not rendering, filter slow |
| **P3 — Low** | Cosmetic, minor UX, documentation | Label typo, icon misaligned |

---

## 4. Resolution Targets

| Priority | Fix Delivered | Deployed to Staging |
|----------|-------------|-------------------|
| P0 | 24 hours | 48 hours |
| P1 | 3 business days | 5 business days |
| P2 | 5 business days | 7 business days |
| P3 | Next sprint (up to 2 weeks) | Next sprint |

---

## 5. Change Request Process

Changes outside the original scope:

```
1. Client submits written change request (email or ticket)
2. Dev team responds with:
   - Effort estimate (hours/days)
   - Cost estimate (see COST.md rates)
   - Timeline impact
3. Client approves in writing
4. Work scheduled in next available sprint
5. Delivered and signed off before invoicing
```

---

## 6. Performance SLA

| Metric | Target | Measurement |
|--------|--------|------------|
| Initial page load | < 2 seconds | Lighthouse lab test |
| Lighthouse overall | ≥ 94 | Lighthouse CI |
| API response (frontend) | < 500ms (P95) | Browser DevTools |
| Uptime (hosting) | 99.5% | Client's hosting provider |

> Uptime SLA applies to the hosting environment, not this frontend contract.

---

## 7. What Is NOT Covered

- Backend API bugs (separate contract)
- Third-party service outages (ECharts, CDN, etc.)
- Issues caused by client-side modifications to delivered code
- Performance degradation caused by insufficient server resources
- Browser versions older than 2 years

---

## 8. Escalation Path

```
1. Submit issue → dev@hrplatform.com
2. No response within SLA → escalate to lead@hrplatform.com
3. No resolution within 2x SLA → executive escalation
```

---

## 9. Support Period

| Package | Duration | Starts |
|---------|----------|--------|
| Standard (included) | 60 days | Production go-live date |
| Extended (paid) | 3 / 6 / 12 months | Post standard period |

---

## 10. Exclusions & Limitations

- Maximum 10 P2/P3 issues per month included in standard support
- Issues beyond 10/month billed at hourly rate (see COST.md)
- Feature requests are change requests, not bugs
