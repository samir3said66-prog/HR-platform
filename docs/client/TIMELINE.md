# Project Timeline
## HR Analytics Platform — Frontend

**Start Date:** 2026-06-01  
**End Date:** 2026-09-30  
**Total Duration:** 18 weeks (4.5 months)  
**Methodology:** Agile — 2-week sprints

---

## Phase Overview

| Phase | Duration | Focus | Status |
|-------|----------|-------|--------|
| Phase 1 — Foundation | Weeks 1–4 | Architecture, Core, Shared Library | ✅ Complete |
| Phase 2 — Core Features | Weeks 5–8 | Dashboard, Employees, Performance | ✅ Complete |
| Phase 3 — Operations | Weeks 9–12 | Attendance, Payroll, Recruitment | ✅ Complete |
| Phase 4 — Advanced | Weeks 13–16 | Analytics, Admin, Settings, SEO | ✅ Complete |
| Phase 5 — Delivery | Weeks 17–18 | Build, QA, Handover | 🔄 In Progress |

---

## Detailed Sprint Plan

### Phase 1 — Foundation

#### Sprint 1 (Weeks 1–2) — Architecture & Core
| Task | Owner | Days |
|------|-------|------|
| Project scaffold, Angular 21 setup | Lead | 1 |
| Tailwind, ESLint, Prettier, Husky setup | Lead | 1 |
| Feature-based folder structure | Lead | 1 |
| Core module: AuthService, JWT, guards | Lead | 3 |
| Core module: WebSocket, i18n, Theme | FE1 | 3 |
| Core module: Audit, API, constants | FE1 | 1 |

**Milestone:** Core module complete, app boots ✅

#### Sprint 2 (Weeks 3–4) — Shared Library & Layouts
| Task | Owner | Days |
|------|-------|------|
| 22 UI components (forms, display, data) | FE1+FE2 | 6 |
| 9 Common components | FE2 | 3 |
| 6 Pipes + 5 Directives + 5 Widgets | FE1 | 3 |
| Main, Auth, Print layout shells | Lead | 2 |
| SharedModule + barrel exports | Lead | 1 |
| App routes + store configuration | Lead | 1 |

**Milestone:** Component library + layouts complete ✅

---

### Phase 2 — Core Features

#### Sprint 3 (Weeks 5–6) — Dashboard + Employees
| Task | Owner | Days |
|------|-------|------|
| Dashboard: KPI cards, charts, activity feed | FE1 | 4 |
| Dashboard: NgRx store (actions/reducer/effects) | FE1 | 3 |
| Employees: list page + detail page | FE2 | 4 |
| Employees: NgRx store | FE2 | 3 |

**Milestone:** Dashboard + Employees functional ✅

#### Sprint 4 (Weeks 7–8) — Performance
| Task | Owner | Days |
|------|-------|------|
| Performance: review cycles UI | FE1 | 3 |
| Performance: OKR tracking UI | FE2 | 3 |
| Performance: NgRx store | FE1 | 2 |
| RBAC integration across features | Lead | 2 |

**Milestone:** Performance feature complete ✅

---

### Phase 3 — Operations Features

#### Sprint 5 (Weeks 9–10) — Attendance + Payroll
| Task | Owner | Days |
|------|-------|------|
| Attendance: calendar + shift view | FE1 | 4 |
| Attendance: GPS/face recognition UI | FE2 | 3 |
| Payroll: salary table + payslip view | FE1 | 3 |
| Payroll: NgRx store | FE2 | 2 |

**Milestone:** Attendance + Payroll functional ✅

#### Sprint 6 (Weeks 11–12) — Recruitment
| Task | Owner | Days |
|------|-------|------|
| Recruitment: job board + pipeline | FE1 | 4 |
| Recruitment: applicant detail | FE2 | 3 |
| Recruitment: NgRx store | FE1 | 3 |

**Milestone:** Recruitment feature complete ✅

---

### Phase 4 — Advanced Features

#### Sprint 7 (Weeks 13–14) — Analytics + Admin
| Task | Owner | Days |
|------|-------|------|
| Analytics: reports, charts, exports | FE1 | 5 |
| Analytics: workforce/turnover views | FE2 | 3 |
| Admin: user management + RBAC UI | Lead | 4 |

**Milestone:** Analytics + Admin complete ✅

#### Sprint 8 (Weeks 15–16) — Settings + SEO + PWA
| Task | Owner | Days |
|------|-------|------|
| Settings: i18n switch + theme toggle | FE1 | 2 |
| Settings: notification rules | FE2 | 2 |
| SEO: meta tags, JSON-LD, OG images | Lead | 2 |
| PWA: manifest, icons (7 sizes), apple-touch | Lead | 2 |
| robots.txt, browserconfig.xml | Lead | 1 |
| Full documentation suite (docs/) | All | 2 |

**Milestone:** All features + SEO + docs complete ✅

---

### Phase 5 — Delivery

#### Sprint 9 (Weeks 17–18) — QA + Build + Handover
| Task | Owner | Days |
|------|-------|------|
| Full Lighthouse audit (perf, a11y, SEO, PWA) | QA | 2 |
| Cross-browser testing (Chrome, Firefox, Safari) | QA | 2 |
| Mobile testing (iOS, Android) | QA | 1 |
| Bug fixes from QA findings | FE1+FE2 | 3 |
| Production build verification | Lead | 1 |
| Handover documentation + demo | Lead | 1 |

**Milestone:** Production ready, client handover 🔄

---

## Key Milestones

| Milestone | Target Date | Status |
|-----------|------------|--------|
| Core module complete | 2026-06-14 | ✅ |
| Component library complete | 2026-06-28 | ✅ |
| Dashboard + Employees | 2026-07-12 | ✅ |
| All features complete | 2026-08-16 | ✅ |
| SEO + PWA + Docs | 2026-08-31 | ✅ |
| QA sign-off | 2026-09-20 | 🔄 |
| Client handover | 2026-09-30 | 🔄 |

---

## Dependencies & Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Backend API delays | Medium | Use mock data layer during frontend dev |
| Client feedback cycles | Medium | Weekly demo meetings + async comments |
| Scope creep | High | Change request process (see SLA.md) |
| Browser-specific bugs | Low | Cross-browser testing in Phase 5 |
| Performance below targets | Medium | Profiling + optimization sprint buffer |

---

## Change Request Process

Any scope change requires:
1. Written request from client
2. Impact assessment (days + cost)
3. Timeline update signed by both parties
4. New deliverable added to DELIVERABLES.md

Changes to Phase 5 scope extend the timeline proportionally.

---

## Communication Schedule

| Meeting | Frequency | Participants |
|---------|-----------|-------------|
| Sprint demo | Every 2 weeks | Dev team + client |
| Status update | Weekly | Lead + client PM |
| Issue triage | As needed | Lead + QA |
| Final demo | Week 17 | All stakeholders |
