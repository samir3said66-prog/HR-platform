# Documentation Index
## HR Analytics Platform — Complete Reference

**Last Updated:** 2026-07-20 | **Total Docs:** 62 files across 7 folders

---

## Folder Structure

```
docs/
├── DOCUMENTATION_INDEX.md     ← This file — master index
├── README.md                  ← Entry point for new readers
├── GLOSSARY.md                ← Platform-wide terms (HR + tech)
│
├── backend/   (12)  ASP.NET Core 9 architecture docs
├── client/    (10)  Client-facing and end-user docs
├── devops/    (6)   Infrastructure, deployment, CI/CD, monitoring
├── frontend/  (12)  Angular 21 frontend architecture docs
├── interview/ (9)   Interview preparation by topic
├── security/  (6)   Security audits, secrets, implementation
└── testing/   (7)   Testing strategy, QA, E2E, load testing
```

---

## backend/ — ASP.NET Core 9

| File | Purpose | Audience |
|------|---------|---------|
| [ARCHITECTURE.md](backend/ARCHITECTURE.md) | Clean Architecture + Vertical Slice layout, layers, solution structure | Backend devs |
| [CQRS.md](backend/CQRS.md) | MediatR commands/queries, pipeline behaviors, UoW, domain events | Backend devs |
| [REPOSITORY.md](backend/REPOSITORY.md) | Generic `Repository<T>`, `IUnitOfWork`, Specification pattern | Backend devs |
| [ENTITY_FRAMEWORK.md](backend/ENTITY_FRAMEWORK.md) | DbContext, Fluent API configs, migrations, seeding, conventions | Backend devs |
| [VALIDATION.md](backend/VALIDATION.md) | FluentValidation per feature, pipeline integration, error shape | Backend devs |
| [MAPPING.md](backend/MAPPING.md) | Mapster `TypeAdapterConfig`, `IRegister`, `ProjectTo`, DI setup | Backend devs |
| [DATABASE.md](backend/DATABASE.md) | PostgreSQL schema, naming conventions, indexes, backups | Backend / DBA |
| [MIDDLEWARE.md](backend/MIDDLEWARE.md) | Exception handler, correlation ID, request logging, rate limiting, RBAC | Backend devs |
| [LOCALIZATION.md](backend/LOCALIZATION.md) | EN/AR resource files, `RequestLocalization`, RTL, currency/date | Backend devs |
| [API.md](backend/API.md) | REST conventions, versioning, response envelope, Swagger, CORS, JWT | Backend / Frontend |
| [CONFIGURATION.md](backend/CONFIGURATION.md) | `appsettings.json`, Options pattern, environment overrides, DI order | Backend / DevOps |
| [TECHNICAL_DOCUMENTATION.md](backend/TECHNICAL_DOCUMENTATION.md) | High-level technical overview of the full platform | All technical |

---

## client/ — End-User & Client Docs

| File | Purpose | Audience |
|------|---------|---------|
| [PROPOSAL.md](client/PROPOSAL.md) | Project proposal — problem, solution, team, approach | Client / Management |
| [DELIVERABLES.md](client/DELIVERABLES.md) | All 16 deliverables with acceptance criteria | Client / PM |
| [TIMELINE.md](client/TIMELINE.md) | 18-week sprint plan, milestones, risk management | Client / PM |
| [COST.md](client/COST.md) | Fixed-price and T&M pricing, payment milestones, support packages | Client / Finance |
| [ROADMAP.md](client/ROADMAP.md) | Product roadmap Q3 2026 through 2027+ | Client / Product |
| [SLA.md](client/SLA.md) | Support SLAs, priority definitions, escalation paths | Client / Support |
| [HANDOVER.md](client/HANDOVER.md) | Handover checklist, repo access, credentials, training | Client / DevOps |
| [USER_GUIDE.md](client/USER_GUIDE.md) | Platform walkthrough for end users (HR staff, employees) | End users |
| [ADMIN_GUIDE.md](client/ADMIN_GUIDE.md) | System admin guide — users, RBAC, config, monitoring | IT admins |
| [FAQ.md](client/FAQ.md) | Frequently asked questions for all user types | All users |

---

## devops/ — Infrastructure & Operations

| File | Purpose | Audience |
|------|---------|---------|
| [CI_CD_PIPELINE.md](devops/CI_CD_PIPELINE.md) | GitHub Actions pipeline stages, workflows | DevOps / Dev |
| [DEPLOYMENT.md](devops/DEPLOYMENT.md) | Deploy procedure, environments, rollback steps | DevOps |
| [DOCKER.md](devops/DOCKER.md) | Dockerfiles (multi-stage), docker-compose, CI image push | DevOps / Dev |
| [INFRASTRUCTURE.md](devops/INFRASTRUCTURE.md) | Kubernetes, Nginx, PostgreSQL, Redis setup | DevOps |
| [MONITORING.md](devops/MONITORING.md) | Sentry, Prometheus, Grafana, Loki, uptime, alerts | DevOps |
| [RUNBOOK.md](devops/RUNBOOK.md) | On-call incident playbooks, post-mortem template | DevOps / On-call |

---

## frontend/ — Angular 21

| File | Purpose | Audience |
|------|---------|---------|
| [ARCHITECTURE.md](frontend/ARCHITECTURE.md) | Feature-based architecture, modules, lazy loading, store | Frontend devs |
| [COMPONENTS.md](frontend/COMPONENTS.md) | Shared component library API (22 UI + 9 common) | Frontend devs |
| [LAYOUTS.md](frontend/LAYOUTS.md) | Main, Auth, Print layout shells | Frontend devs |
| [ROUTES.md](frontend/ROUTES.md) | Route structure, guards, RBAC, lazy loading | Frontend devs |
| [SHARED.md](frontend/SHARED.md) | SharedModule, pipes, directives, widgets | Frontend devs |
| [ASSETS_GUIDE.md](frontend/ASSETS_GUIDE.md) | Assets organization, icons, fonts, images | Frontend / Design |
| [SEO.md](frontend/SEO.md) | Meta tags, JSON-LD, OG images, favicon strategy | Frontend / Marketing |
| [ENVIRONMENT.md](frontend/ENVIRONMENT.md) | Environment config, feature flags, build commands | Frontend / DevOps |
| [MIGRATION_GUIDE.md](frontend/MIGRATION_GUIDE.md) | Migrate from old flat structure to feature-based | Frontend devs |
| [IMPORT_VERIFICATION.md](frontend/IMPORT_VERIFICATION.md) | Import path checklist and deprecated patterns | Frontend devs |
| [CONTRIBUTING.md](frontend/CONTRIBUTING.md) | Branch naming, commit format, PR checklist | All devs |
| [CHANGELOG.md](frontend/CHANGELOG.md) | Version history (v1.0 → v2.0) | All |

---

## interview/ — Interview Preparation

| File | Topic | Level |
|------|-------|-------|
| [ANGULAR.md](interview/ANGULAR.md) | Angular 21: OnPush, standalone, lazy loading, @defer, DI | Mid–Senior |
| [NGRX.md](interview/NGRX.md) | NgRx: feature stores, selectors, effects, entity, DevTools | Mid–Senior |
| [TYPESCRIPT.md](interview/TYPESCRIPT.md) | Strict mode, generics, utility types, discriminated unions | Mid–Senior |
| [PERFORMANCE.md](interview/PERFORMANCE.md) | Bundle size, Core Web Vitals, virtual scroll, @defer, memory | Senior |
| [SYSTEM_DESIGN.md](interview/SYSTEM_DESIGN.md) | Architecture decisions, state strategy, real-time, RBAC | Senior |
| [SECURITY.md](interview/SECURITY.md) | JWT, RBAC, XSS, CSRF, CSP, audit logging | Mid–Senior |
| [TESTING_QA.md](interview/TESTING_QA.md) | Vitest, TestBed, axe-core, NgRx reducer tests | Mid |
| [ACCESSIBILITY.md](interview/ACCESSIBILITY.md) | WCAG 2.1, ARIA, focus management, RTL, reduced motion | Mid–Senior |
| [HR_DOMAIN.md](interview/HR_DOMAIN.md) | HR business domain: attendance, payroll, RBAC roles | All |

---

## security/ — Security Documentation

| File | Purpose | Audience |
|------|---------|---------|
| [SECURITY_IMPLEMENTATION.md](security/SECURITY_IMPLEMENTATION.md) | CSP, XSS prevention, input sanitization | Backend / Security |
| [SECURITY_COMPLETE.md](security/SECURITY_COMPLETE.md) | JWT auth, RBAC, audit logging — completion status | Security / PM |
| [SECURITY_CHECKPOINT.md](security/SECURITY_CHECKPOINT.md) | Security checklist sign-off | Security / PM |
| [AUDIT_LOGGING_REVIEW.md](security/AUDIT_LOGGING_REVIEW.md) | Audit logging implementation review | Backend / Compliance |
| [DATA_ENCRYPTION_AUDIT.md](security/DATA_ENCRYPTION_AUDIT.md) | Encryption at rest/in transit audit | Backend / Security |
| [SECRETS.md](security/SECRETS.md) | Secret inventory, rotation procedures, CI injection | DevOps / Security |

---

## testing/ — Testing Suite

| File | Purpose | Audience |
|------|---------|---------|
| [STRATEGY.md](testing/STRATEGY.md) | Full-stack testing pyramid, types, tools, coverage targets | All devs / QA |
| [FRONTEND_TESTING.md](testing/FRONTEND_TESTING.md) | Vitest, TestBed, axe-core, NgRx unit tests | Frontend / QA |
| [BACKEND_TESTING.md](testing/BACKEND_TESTING.md) | Supertest, testcontainers, Pact, Newman | Backend / QA |
| [E2E.md](testing/E2E.md) | Playwright setup, 6 user journeys, CI integration | QA / Automation |
| [TEST_PLANS.md](testing/TEST_PLANS.md) | Formal test plans for all 9 HR modules (80+ cases) | QA |
| [PERFORMANCE_TESTING.md](testing/PERFORMANCE_TESTING.md) | k6 load/stress tests, 5 scenarios, CI schedule | DevOps / QA |
| [QA_CHECKLIST.md](testing/QA_CHECKLIST.md) | Release readiness checklist, sign-off criteria | QA / PM |

---

## Quick Navigation

### I am a...

**New developer joining the team**
→ Start: `frontend/ARCHITECTURE.md` + `backend/ARCHITECTURE.md`
→ Then: `frontend/MIGRATION_GUIDE.md` + `backend/CONFIGURATION.md`
→ Setup: `frontend/ENVIRONMENT.md` + `devops/DOCKER.md`

**Backend developer**
→ Core: `backend/ARCHITECTURE.md` → `backend/CQRS.md` → `backend/REPOSITORY.md`
→ Data: `backend/ENTITY_FRAMEWORK.md` → `backend/DATABASE.md`
→ Cross-cutting: `backend/MIDDLEWARE.md` → `backend/VALIDATION.md` → `backend/MAPPING.md`

**Frontend developer**
→ Core: `frontend/ARCHITECTURE.md` → `frontend/ROUTES.md` → `frontend/COMPONENTS.md`
→ Shared: `frontend/SHARED.md` → `frontend/LAYOUTS.md`
→ Imports: `frontend/IMPORT_VERIFICATION.md`

**DevOps / Infrastructure**
→ Start: `devops/INFRASTRUCTURE.md` → `devops/DOCKER.md` → `devops/DEPLOYMENT.md`
→ Ops: `devops/CI_CD_PIPELINE.md` → `devops/MONITORING.md` → `devops/RUNBOOK.md`
→ Secrets: `security/SECRETS.md`

**QA engineer**
→ Start: `testing/STRATEGY.md` → `testing/TEST_PLANS.md`
→ Automate: `testing/E2E.md` → `testing/BACKEND_TESTING.md`
→ Release: `testing/QA_CHECKLIST.md`

**Security reviewer**
→ `security/SECURITY_IMPLEMENTATION.md` → `security/SECURITY_COMPLETE.md`
→ `security/AUDIT_LOGGING_REVIEW.md` → `security/DATA_ENCRYPTION_AUDIT.md`
→ `security/SECRETS.md`

**Client / Project manager**
→ `client/PROPOSAL.md` → `client/DELIVERABLES.md` → `client/TIMELINE.md`
→ `client/COST.md` → `client/ROADMAP.md` → `client/SLA.md`

**Preparing for interview**
→ Pick your topic from `interview/` — 9 files by technology and domain area

---

## Document Count Summary

| Folder | Files | Category |
|--------|-------|---------|
| `backend/` | 12 | Technical — ASP.NET Core 9 |
| `client/` | 10 | Business — Client & End-User |
| `devops/` | 6 | Operations — Infrastructure |
| `frontend/` | 12 | Technical — Angular 21 |
| `interview/` | 9 | Reference — Interview Prep |
| `security/` | 6 | Compliance — Security |
| `testing/` | 7 | Quality — QA & Testing |
| `docs/` root | 3 | Navigation — Index, README, Glossary |
| **Total** | **65** | |
