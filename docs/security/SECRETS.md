# Secrets Management
## HR Analytics Platform

> **Related:** Environment variables → `docs/frontend/ENVIRONMENT.md`
> CI/CD pipeline → `docs/backend/CI_CD_PIPELINE.md`
> Security implementation → `docs/backend/SECURITY_IMPLEMENTATION.md`

---

## Principles

1. **No secrets in code** — never commit a real secret, token, or password to git
2. **No secrets in environment files** — `.env` files contain references, not values
3. **Least privilege** — each service only gets the secrets it needs
4. **Rotation** — all secrets have a rotation schedule
5. **Audit** — every secret access is logged

---

## Secret Inventory

| Secret Name | Used By | Rotation | Storage |
|-------------|---------|---------|---------|
| `JWT_SECRET` | Backend auth | 90 days | GitHub Secrets + k8s Secret |
| `JWT_REFRESH_SECRET` | Backend auth | 90 days | GitHub Secrets + k8s Secret |
| `DATABASE_URL` | Backend | On demand | GitHub Secrets + k8s Secret |
| `REDIS_URL` | Backend + WebSocket | On demand | GitHub Secrets + k8s Secret |
| `SENTRY_DSN` | Frontend + Backend | On demand | GitHub Secrets |
| `GA4_MEASUREMENT_ID` | Frontend (index.html) | On demand | GitHub Secrets |
| `SMTP_PASSWORD` | Backend (email) | 90 days | GitHub Secrets + k8s Secret |
| `AWS_ACCESS_KEY_ID` | CI/CD (S3 deploy) | 180 days | GitHub Secrets |
| `AWS_SECRET_ACCESS_KEY` | CI/CD (S3 deploy) | 180 days | GitHub Secrets |
| `CF_DISTRIBUTION_ID` | CI/CD (CloudFront) | On demand | GitHub Secrets |
| `K6_CLOUD_TOKEN` | CI/CD (load tests) | 180 days | GitHub Secrets |
| `POSTGRES_PASSWORD` | Database | 90 days | k8s Secret only |
| `REDIS_PASSWORD` | Redis | 90 days | k8s Secret only |

---

## Storage by Environment

### Local Development

Use `.env.local` — **never commit this file:**

```bash
# HR-platform/backend/.env.local  (git-ignored)
DATABASE_URL=postgresql://hrplatform:hrplatform@localhost:5432/hrplatform
REDIS_URL=redis://:hrplatform@localhost:6379
JWT_SECRET=dev-only-not-real-change-me
JWT_REFRESH_SECRET=dev-only-refresh-not-real
SMTP_PASSWORD=dev-mailhog-no-real-password
```

`docker-compose.yml` uses safe placeholder values — no real secrets.

### Staging / Production — Kubernetes Secrets

```bash
# Create secret from values (not from file — avoid writing to disk)
kubectl create secret generic backend-secrets \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --from-literal=JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --from-literal=REDIS_URL="$REDIS_URL" \
  --from-literal=SMTP_PASSWORD="$SMTP_PASSWORD" \
  -n hrplatform

# Verify secret exists (values are base64-encoded, not shown)
kubectl get secret backend-secrets -n hrplatform

# Reference in deployment.yaml
env:
  - name: JWT_SECRET
    valueFrom:
      secretKeyRef:
        name: backend-secrets
        key: JWT_SECRET
```

### CI/CD — GitHub Actions Secrets

Store in: `GitHub → Repository → Settings → Secrets and variables → Actions`

```yaml
# .github/workflows/ci-cd.yml
- name: Deploy frontend
  env:
    AWS_ACCESS_KEY_ID:     ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    CF_DISTRIBUTION_ID:    ${{ secrets.CF_DISTRIBUTION_ID }}
```

Never print secrets in logs:
```yaml
# ❌ NEVER do this
- run: echo "JWT secret is ${{ secrets.JWT_SECRET }}"

# ✅ GitHub Actions masks secrets automatically in logs
# But avoid echoing them at all
```

---

## Secret Injection at Build Time (Frontend)

The Angular frontend has no secrets at runtime — it talks to the backend API which holds all secrets. However, some non-sensitive IDs need to be injected at build time:

```bash
# CI step — inject GA4 ID and Sentry DSN into environment.prod.ts
sed -i "s|GA4_MEASUREMENT_ID_PLACEHOLDER|${{ secrets.GA4_MEASUREMENT_ID }}|g" \
  src/environments/environment.prod.ts
sed -i "s|SENTRY_DSN_PLACEHOLDER|${{ secrets.SENTRY_DSN_FRONTEND }}|g" \
  src/environments/environment.prod.ts

npm run build
```

`environment.prod.ts` in the repo contains placeholders, not real values:
```typescript
export const environment = {
  sentryDsn: 'SENTRY_DSN_PLACEHOLDER',     // replaced by CI
  ga4Id:     'GA4_MEASUREMENT_ID_PLACEHOLDER', // replaced by CI
  production: true,
};
```

---

## .gitignore Rules

These must always be in `.gitignore`:

```gitignore
# Secrets
.env
.env.*
!.env.example
*.pem
*.key
*.p12
*.pfx
secrets/
.secrets/

# Google credentials
service-account.json
gcp-credentials.json

# AWS
.aws/credentials
```

---

## Rotation Procedures

### JWT_SECRET rotation (every 90 days)

```bash
# 1. Generate new secret (minimum 64 chars)
NEW_SECRET=$(openssl rand -base64 48)

# 2. Update Kubernetes secret
kubectl create secret generic backend-secrets \
  --from-literal=JWT_SECRET="$NEW_SECRET" \
  --dry-run=client -o yaml | kubectl apply -f -

# 3. Restart backend (picks up new secret)
kubectl rollout restart deployment/backend -n hrplatform

# 4. IMPACT: All existing JWT tokens are immediately invalidated
#    All users will be logged out and must re-login
# 5. Schedule rotation at low-traffic time (e.g., Sunday 3am)
# 6. Update GitHub Secret for next CI deploy
# 7. Update rotation log below
```

### DATABASE_URL rotation

```bash
# 1. Create new DB user with same permissions
psql -c "CREATE USER hrplatform_v2 WITH PASSWORD '$NEW_PASSWORD';"
psql -c "GRANT ALL ON DATABASE hrplatform TO hrplatform_v2;"

# 2. Update k8s secret with new connection string
kubectl create secret generic backend-secrets \
  --from-literal=DATABASE_URL="postgresql://hrplatform_v2:$NEW_PASSWORD@postgres:5432/hrplatform" \
  --dry-run=client -o yaml | kubectl apply -f -

# 3. Restart backend
kubectl rollout restart deployment/backend -n hrplatform

# 4. Verify connections work
curl https://api.hrplatform.com/health/detailed

# 5. Revoke old user
psql -c "REVOKE ALL ON DATABASE hrplatform FROM hrplatform;"
psql -c "DROP USER hrplatform;"
```

---

## Rotation Schedule

| Secret | Last rotated | Next rotation | Owner |
|--------|-------------|--------------|-------|
| `JWT_SECRET` | 2026-07-20 | 2026-10-20 | Lead Eng |
| `JWT_REFRESH_SECRET` | 2026-07-20 | 2026-10-20 | Lead Eng |
| `POSTGRES_PASSWORD` | 2026-07-20 | 2026-10-20 | DevOps |
| `REDIS_PASSWORD` | 2026-07-20 | 2026-10-20 | DevOps |
| `SMTP_PASSWORD` | 2026-07-20 | 2026-10-20 | DevOps |
| `AWS_ACCESS_KEY_ID` | 2026-07-20 | 2027-01-20 | DevOps |

---

## Secret Scanning

Pre-commit hook via `detect-secrets`:

```bash
# Install
pip install detect-secrets

# Scan repo for secrets before committing
detect-secrets scan > .secrets.baseline
detect-secrets audit .secrets.baseline
```

GitHub also runs secret scanning automatically on push. Any detected secret triggers an immediate alert to the security team.

---

## Emergency — Secret Compromised

```
1. IMMEDIATELY revoke the compromised secret (disable key / change password)
2. Generate new secret
3. Update k8s Secret + GitHub Secrets
4. Redeploy affected services
5. Check audit logs for unauthorized usage window
6. If database or auth credentials — notify affected users
7. File security incident report
8. Post-mortem within 24 hours
```

Contact: security@hrplatform.com
