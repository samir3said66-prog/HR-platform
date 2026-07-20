# Deployment Guide
## HR Analytics Platform

> **Not covered here:** CI/CD pipeline YAML → `docs/backend/CI_CD_PIPELINE.md`
> Docker images → `docs/devops/DOCKER.md`
> Infrastructure setup → `docs/devops/INFRASTRUCTURE.md`
> Secrets management → `docs/devops/SECRETS.md`

---

## Environments

| Environment | URL | Branch | Deploy trigger |
|-------------|-----|--------|---------------|
| `local` | http://localhost:4200 | any | `npm start` |
| `staging` | https://staging.hrplatform.com | `main` | Auto on merge |
| `production` | https://hrplatform.com | `release/*` | Manual approval |

---

## Deployment Flow

```
Developer PR → CI tests pass → Merge to main
        │
        ▼
Staging deploy (automatic)
        │
        ▼
QA sign-off (docs/testing/QA_CHECKLIST.md)
        │
        ▼
Release branch cut: git checkout -b release/v2.1.0
        │
        ▼
Production deploy (manual approval in GitHub Actions)
        │
        ▼
Post-deploy smoke test (15 min window)
        │
   pass ▼          fail ▼
   Monitor        Rollback immediately
```

---

## Frontend Deployment

### Build

```bash
cd HR-platform/frontend
npm ci                      # clean install
npm run lint                # must pass
npm run build               # outputs to dist/hr-analytics-platform/browser/
```

Production build output:
```
dist/
└── hr-analytics-platform/
    └── browser/
        ├── index.html
        ├── main-HASH.js
        ├── chunk-HASH.js  (per lazy-loaded feature)
        ├── styles-HASH.css
        └── assets/
```

### Deploy to Static Hosting

**Option A — Nginx (VPS/bare metal)**
```bash
# Copy build output to nginx webroot
rsync -avz --delete \
  dist/hr-analytics-platform/browser/ \
  deploy@server:/var/www/hrplatform/

# Reload nginx (no downtime)
ssh deploy@server "sudo nginx -s reload"
```

**Option B — AWS S3 + CloudFront**
```bash
aws s3 sync dist/hr-analytics-platform/browser/ \
  s3://hrplatform-frontend/ \
  --delete \
  --cache-control "public,max-age=31536000,immutable"

# Invalidate CloudFront cache for index.html only
aws cloudfront create-invalidation \
  --distribution-id $CF_DISTRIBUTION_ID \
  --paths "/index.html" "/manifest.json" "/robots.txt"
```

**Option C — Kubernetes (see `docs/devops/INFRASTRUCTURE.md`)**
```bash
kubectl set image deployment/frontend \
  frontend=ghcr.io/hrplatform/frontend:$VERSION \
  -n hrplatform
kubectl rollout status deployment/frontend -n hrplatform
```

---

## Backend Deployment

```bash
# Build Docker image
docker build -t ghcr.io/hrplatform/backend:$VERSION \
  -f HR-platform/backend/Dockerfile .

# Push to registry
docker push ghcr.io/hrplatform/backend:$VERSION

# Apply to Kubernetes
kubectl set image deployment/backend \
  backend=ghcr.io/hrplatform/backend:$VERSION \
  -n hrplatform
kubectl rollout status deployment/backend -n hrplatform

# Run database migrations (always before deploying new backend)
kubectl exec -it deploy/backend -n hrplatform -- npm run db:migrate
```

---

## GitHub Actions — Production Deploy

```yaml
# .github/workflows/ci-cd.yml (production stage)
deploy-production:
  needs: [qa-sign-off]
  runs-on: ubuntu-latest
  environment:
    name: production
    url: https://hrplatform.com
  steps:
    - name: Deploy frontend to S3
      run: |
        aws s3 sync dist/ s3://hrplatform-frontend/ --delete
        aws cloudfront create-invalidation \
          --distribution-id ${{ secrets.CF_DIST_ID }} \
          --paths "/index.html"

    - name: Deploy backend to k8s
      run: |
        kubectl set image deployment/backend \
          backend=ghcr.io/hrplatform/backend:${{ github.sha }}
        kubectl rollout status deployment/backend -n hrplatform

    - name: Post-deploy smoke test
      run: npx playwright test tests/e2e/smoke.spec.ts
      env:
        E2E_BASE_URL: https://hrplatform.com
```

---

## Database Migrations

**Always run migrations BEFORE deploying new backend code.**

```bash
# Check pending migrations
npm run db:migrate:status

# Run migrations
npm run db:migrate

# Rollback last migration (emergency only)
npm run db:migrate:rollback
```

Migration rules:
- Migrations must be backwards-compatible (old code works with new schema)
- Never drop columns in the same deployment that removes code using them
- Use two-phase deploy for breaking schema changes

---

## Rollback Procedure

### Frontend rollback (< 2 min)

```bash
# S3/CloudFront — re-deploy previous version from CI artifact
aws s3 sync s3://hrplatform-releases/v$PREV_VERSION/ \
  s3://hrplatform-frontend/ --delete
aws cloudfront create-invalidation \
  --distribution-id $CF_DIST_ID --paths "/*"
```

### Backend rollback (< 3 min)

```bash
# Kubernetes — roll back to previous ReplicaSet
kubectl rollout undo deployment/backend -n hrplatform
kubectl rollout status deployment/backend -n hrplatform

# Verify rollback succeeded
kubectl get pods -n hrplatform
```

### Database rollback

```bash
# Only if migration was destructive
npm run db:migrate:rollback

# WARNING: data written by new code may be lost
# Consult DBA before running rollback
```

---

## Version Tagging

```bash
# Tag a release
git tag -a v2.1.0 -m "Release v2.1.0 — Payroll multi-currency"
git push origin v2.1.0

# Version is injected into environment.prod.ts at build time
APP_VERSION=$(git describe --tags) npm run build
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All CI checks green on release branch
- [ ] QA checklist signed off (`docs/testing/QA_CHECKLIST.md`)
- [ ] `environment.prod.ts` — `enableMockData: false`, `enableDevTools: false`
- [ ] Database migrations reviewed and tested on staging
- [ ] Rollback tested on staging (verified it actually works)
- [ ] On-call engineer notified (see `docs/devops/RUNBOOK.md`)
- [ ] Deployment window: Monday–Thursday, 10am–3pm (avoid Fri/weekend)
- [ ] Post-deploy smoke test script ready

---

## Deployment Windows

| Window | Day/Time | Notes |
|--------|---------|-------|
| Standard | Mon–Thu, 10am–3pm | Preferred |
| Hotfix | Any time | P0 bugs only, on-call approval |
| Blackout | Fri–Sun | No deploys unless P0 |
| Blackout | Payroll processing day (1st of month) | No deploys 24h before/after |
