# Testing Strategy
## HR Analytics Platform — Full-Stack

**Last Updated:** 2026-07-20

> **Scope:** This document covers the full-stack testing strategy.
> For frontend-specific unit tests → `docs/frontend/TESTING.md`
> For frontend QA interview prep → `docs/frontend/interview/TESTING_QA.md`
> For CI/CD pipeline test stages → `docs/backend/CI_CD_PIPELINE.md`

---

## Testing Pyramid

```
          ▲
         /E2E\           5%  — Playwright user journeys (docs/testing/E2E.md)
        /──────\
       / Integ  \       20%  — API + component + store integration
      /──────────\
     /    Unit    \     75%  — Reducers, services, guards, pipes, utils
    /______________\

Total target: 80%+ code coverage on critical paths
```

The pyramid drives our investment: most value at the bottom (fast, cheap, isolated), least at the top (slow, expensive, brittle).

---

## Test Types & Owners

| Type | Tool | Who writes it | Where it runs |
|------|------|--------------|--------------|
| Frontend unit | Vitest + TestBed | Frontend dev | Local + CI |
| Frontend a11y | vitest-axe + axe-core | Frontend dev | Local + CI |
| Backend unit | Jest (or Vitest) | Backend dev | Local + CI |
| API integration | Supertest / Postman | Backend dev | CI staging |
| E2E | Playwright | QA engineer | CI staging |
| Load / stress | k6 | DevOps / QA | CI pre-prod |
| Contract | Pact | Lead dev | CI |
| Security scan | OWASP ZAP | DevOps | CI weekly |
| Accessibility | Lighthouse CI | QA | CI every PR |

---

## Coverage Targets

### Frontend
| Layer | Target |
|-------|--------|
| NgRx reducers | 90% |
| Route guards | 90% |
| Custom pipes | 100% |
| Core services | 80% |
| Feature services | 70% |
| Shared UI components (a11y) | 100% |

### Backend
| Layer | Target |
|-------|--------|
| Business logic / services | 85% |
| API route handlers | 80% |
| Auth & RBAC middleware | 90% |
| Database queries | 70% |
| Utility functions | 95% |

### End-to-End
| Critical user journey | Must pass |
|----------------------|-----------|
| Login → Dashboard | ✅ |
| Create employee | ✅ |
| Run payroll cycle | ✅ |
| Mark attendance | ✅ |
| Generate report + export | ✅ |
| Admin RBAC change | ✅ |

---

## Test Environments

| Environment | Purpose | Data |
|-------------|---------|------|
| `local` | Developer runs tests on machine | Mock / seed data |
| `ci` | Every PR — automated pipeline | Seed data, reset per run |
| `staging` | Pre-production, mirrors prod | Anonymised copy of prod |
| `production` | Smoke tests only post-deploy | Real data (read-only) |

---

## Naming Conventions

```
// Unit test — same folder as source file
employees.reducer.spec.ts
auth.service.spec.ts
truncate.pipe.spec.ts

// E2E test — tests/e2e/
tests/e2e/auth.spec.ts
tests/e2e/employees.spec.ts
tests/e2e/payroll.spec.ts

// Load test — tests/load/
tests/load/dashboard.k6.js
tests/load/payroll.k6.js
```

---

## Test Data Strategy

| Approach | Used for |
|----------|---------|
| **In-memory mocks** (`vi.fn()`) | Unit tests — no I/O |
| **Seed scripts** (`scripts/seed-test-data.ts`) | Integration + E2E |
| **Factory functions** | Create test fixtures with realistic but fake data |
| **Snapshot of anonymised prod** | Staging environment only |

Never use real employee names, SSNs, or salaries in any test fixture.

---

## Flaky Test Policy

A test that fails intermittently is treated as a bug:
1. Quarantine immediately (move to `tests/quarantine/`)
2. File a P1 issue
3. Fix or delete within 1 sprint
4. A PR with >2 flaky tests is blocked from merging

---

## Test Review Checklist (per PR)

- [ ] New feature has unit tests for business logic
- [ ] New API endpoint has integration test
- [ ] New shared UI component has accessibility test
- [ ] No new `it.skip` without linked issue
- [ ] Coverage does not drop below current baseline
- [ ] No hardcoded real PII in test fixtures

---

## Related Documents

| Document | Location |
|----------|---------|
| Frontend unit testing | `docs/frontend/TESTING.md` |
| E2E test plans | `docs/testing/E2E.md` |
| Backend API tests | `docs/testing/BACKEND_TESTING.md` |
| Feature test plans | `docs/testing/TEST_PLANS.md` |
| Release QA checklist | `docs/testing/QA_CHECKLIST.md` |
| Load & stress testing | `docs/testing/PERFORMANCE_TESTING.md` |
| CI/CD pipeline | `docs/backend/CI_CD_PIPELINE.md` |
