# HR Analytics Platform — Documentation

Welcome to the HR Analytics Platform documentation. This folder contains all technical, operational, and client-facing documentation for the project.

---

## What Is This Platform?

An enterprise-grade HR management system for companies in the MENA region, covering:

- **Attendance** — face recognition + GPS check-in
- **Payroll** — automated, 100% error-free salary calculation
- **Employees** — full lifecycle management
- **Performance** — OKRs, reviews, 360 feedback
- **Recruitment** — pipeline tracking and offer management
- **Analytics** — turnover, headcount, workforce insights
- **Admin** — RBAC, audit logs, user management
- **Settings** — i18n (EN/AR), themes, notifications

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 21, NgRx, Tailwind CSS |
| Backend | ASP.NET Core 9, EF Core 9, MediatR |
| Database | PostgreSQL 16 |
| Auth | JWT Bearer, RBAC |
| DevOps | Docker, Kubernetes, GitHub Actions |
| Testing | Vitest, Playwright, k6 |

---

## Start Here

| You are | Go to |
|---------|-------|
| New developer | `backend/ARCHITECTURE.md` + `frontend/ARCHITECTURE.md` |
| Backend dev | `backend/CQRS.md` → `backend/REPOSITORY.md` → `backend/ENTITY_FRAMEWORK.md` |
| Frontend dev | `frontend/ARCHITECTURE.md` → `frontend/ROUTES.md` → `frontend/COMPONENTS.md` |
| DevOps | `devops/INFRASTRUCTURE.md` → `devops/DOCKER.md` → `devops/DEPLOYMENT.md` |
| QA | `testing/STRATEGY.md` → `testing/TEST_PLANS.md` → `testing/E2E.md` |
| Security | `security/SECURITY_IMPLEMENTATION.md` → `security/SECRETS.md` |
| Client / PM | `client/PROPOSAL.md` → `client/DELIVERABLES.md` → `client/TIMELINE.md` |
| Interview prep | Browse `interview/` by topic |
| Full index | See `DOCUMENTATION_INDEX.md` |
| Platform terms | See `GLOSSARY.md` |

---

## Documentation Folders

```
docs/
├── README.md                  ← You are here
├── DOCUMENTATION_INDEX.md     ← Full index of all 65 files
├── GLOSSARY.md                ← HR domain + tech terms
├── backend/   (12 files)      ASP.NET Core 9 architecture
├── client/    (10 files)      Client-facing and end-user docs
├── devops/    (6 files)       Infrastructure, deployment, CI/CD
├── frontend/  (12 files)      Angular 21 frontend architecture
├── interview/ (9 files)       Interview prep by topic
├── security/  (6 files)       Security, encryption, secrets
└── testing/   (7 files)       QA strategy, E2E, load testing
```

---

## Contributing to Docs

- New feature? Add docs to the relevant subfolder
- Backend feature → `backend/`
- Frontend component → `frontend/`
- Deployment change → `devops/`
- Security change → `security/`
- New test suite → `testing/`
- Client deliverable → `client/`
- Update `DOCUMENTATION_INDEX.md` table for that folder
- Update `CHANGELOG.md` in `frontend/`
