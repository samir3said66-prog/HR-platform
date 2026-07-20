# Project Handover Document
## HR Analytics Platform — Frontend

**Handover Date:** 2026-09-30  
**From:** Development Team  
**To:** Client Technical Team

---

## 1. Repository Access

| Item | Location |
|------|----------|
| Source code | GitHub: `github.com/client/hr-platform` |
| Branch | `main` (production-ready) |
| CI/CD | GitHub Actions — `.github/workflows/` |
| Package registry | npm (public packages only) |

**Access to grant:**
- [ ] Client team added as repo collaborators (write access)
- [ ] Branch protection rules explained (no direct push to main)
- [ ] GitHub Actions secrets transferred

---

## 2. Local Setup

```bash
# Prerequisites: Node.js 20+, npm 10+
git clone https://github.com/client/hr-platform
cd HR-platform/frontend
npm install
npm start         # → http://localhost:4200
```

Full setup instructions: see [docs/ENVIRONMENT.md](../ENVIRONMENT.md)

---

## 3. Build & Deploy

```bash
npm run build               # production bundle → dist/
npm run lint                # must pass before deploy
npm run format:check        # must pass before deploy
```

Deployment: copy `dist/` to hosting provider (Nginx / Apache / S3+CloudFront).  
For SPA routing: server must return `index.html` for all non-asset paths (see `docs/client/SLA.md` → `.htaccess` note).

---

## 4. Environment Variables

Update `src/environments/environment.prod.ts` before each production build:

| Variable | Value to update |
|----------|----------------|
| `apiUrl` | Production backend URL |
| `wsUrl` | Production WebSocket URL |
| `enableAnalytics` | `true` (add GA4 ID to index.html) |
| `enableDevTools` | `false` |
| `enableMockData` | `false` |

See [docs/ENVIRONMENT.md](../ENVIRONMENT.md) for full reference.

---

## 5. Credentials to Transfer

- [ ] Google Analytics property (GA4) — add to index.html
- [ ] Google Search Console verification file
- [ ] Domain registrar access
- [ ] Hosting control panel login
- [ ] SSL certificate (if manually managed)
- [ ] Error monitoring (Sentry DSN)

---

## 6. Documentation Map

| Document | Purpose | Audience |
|----------|---------|---------|
| `README.md` | Project entry point | All |
| `docs/ARCHITECTURE.md` | System design | Dev team |
| `docs/COMPONENTS.md` | Component API | Dev team |
| `docs/ROUTES.md` | Routing | Dev team |
| `docs/ENVIRONMENT.md` | Env config | DevOps |
| `docs/TESTING.md` | Test strategy | QA |
| `docs/CONTRIBUTING.md` | Contribution guide | Dev team |
| `docs/CHANGELOG.md` | Version history | All |
| `docs/client/DELIVERABLES.md` | What was built | Client |
| `docs/client/ROADMAP.md` | Future plans | Client |
| `docs/client/SLA.md` | Support agreement | Client |

---

## 7. Handover Checklist

### Code Quality
- [ ] `npm run lint` passes with 0 errors
- [ ] `npm run format:check` passes
- [ ] `npm run build` produces clean bundle (0 errors, 0 warnings)
- [ ] No `console.log` left in production code
- [ ] No `TODO` or `FIXME` comments in critical paths

### Assets
- [ ] All 7 icon sizes present in `src/assets/images/icons/`
- [ ] `public/favicon.svg`, `favicon.ico`, `apple-touch-icon.svg` present
- [ ] OG image + Twitter image in `src/assets/images/logos/`
- [ ] `public/manifest.json` correct (icons point to real files)
- [ ] `public/robots.txt` correct (disallows /admin, /api)

### Features
- [ ] All 9 feature routes load without errors
- [ ] Login → dashboard flow works end to end
- [ ] RBAC: admin/manager/employee roles tested
- [ ] EN ↔ AR language switch works
- [ ] Dark/light theme switch works
- [ ] Export (CSV/Excel/PDF) works on at least one feature
- [ ] Print layout renders correctly

### SEO
- [ ] Lighthouse SEO score ≥ 90
- [ ] Lighthouse Accessibility score ≥ 95
- [ ] Lighthouse Performance score ≥ 90
- [ ] No CSP violations in browser console
- [ ] Canonical URL correct in index.html

### Post-Go-Live
- [ ] GA4 tracking code added and verified
- [ ] Google Search Console verified
- [ ] Sitemap.xml submitted
- [ ] Error monitoring live (Sentry or equivalent)
- [ ] Uptime monitoring configured

---

## 8. Known Issues at Handover

| ID | Description | Priority | Notes |
|----|-------------|---------|-------|
| — | No known blockers | — | Final QA in progress |

---

## 9. Training

| Session | Duration | Attendees |
|---------|----------|---------|
| Architecture walkthrough | 2 hours | Client dev team |
| Component library demo | 1 hour | Client dev team |
| Deployment + CI/CD walkthrough | 1 hour | Client DevOps |
| Admin + RBAC demo | 1 hour | Client product owner |

---

## 10. Post-Handover Support

Support covered for 60 days post go-live per [SLA.md](SLA.md).  
Submit issues to: **dev@hrplatform.com**

For extended support, see packages in [COST.md](COST.md).

---

**Handover sign-off:**

| Party | Name | Date | Signature |
|-------|------|------|-----------|
| Development Team Lead | | | |
| Client Technical Lead | | | |
| Client Product Owner | | | |
