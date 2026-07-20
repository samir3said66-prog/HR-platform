# Incident Runbook
## HR Analytics Platform — On-Call Playbooks

> **Related:** Monitoring alerts → `docs/devops/MONITORING.md`
> Deployment & rollback → `docs/devops/DEPLOYMENT.md`

---

## On-Call Contacts

| Role | Name | Slack | PagerDuty |
|------|------|-------|-----------|
| Lead Engineer (primary) | — | @lead-eng | Rotation 1 |
| Backend Engineer (secondary) | — | @backend-eng | Rotation 2 |
| DevOps (escalation) | — | @devops | Escalation |
| Product Owner (business) | — | @product | P0 only |

**Escalation SLA:**
- P0: acknowledge within 15 min, mitigate within 1 hour
- P1: acknowledge within 1 hour, mitigate within 4 hours
- P2: acknowledge within 4 hours, resolve within 2 business days

---

## Incident Severity Definitions

| Severity | Definition | Examples |
|----------|-----------|---------|
| **P0 — Critical** | Production down or data loss risk | White screen, login broken for all users, payroll wrong |
| **P1 — Major** | Core feature broken, no workaround | Employee list 500s, payslip export fails, WebSocket down |
| **P2 — Minor** | Degraded but workaround exists | Chart not rendering, slow search, one browser broken |
| **P3 — Info** | Cosmetic or low impact | Label wrong, icon misaligned |

---

## Incident Response Process

```
1. DETECT    Alert fires (Sentry / Prometheus / UptimeRobot / user report)
     │
2. TRIAGE    On-call acknowledges, assesses severity (P0/P1/P2)
     │
3. COMMUNICATE  Post in #incidents: "Investigating [issue] since [time]"
     │
4. MITIGATE  Apply fix OR rollback (fastest path to restore service)
     │
5. RESOLVE   Confirm service restored, close alert
     │
6. POST-MORTEM  Document within 48 hours (blameless)
```

---

## Playbook 1 — Production is Down (White Screen / 502)

**Symptoms:** App returns 502 / blank page / `ERR_CONNECTION_REFUSED`

```bash
# Step 1: Check pod status
kubectl get pods -n hrplatform
# Look for: CrashLoopBackOff, OOMKilled, Pending

# Step 2: Check recent deployments
kubectl rollout history deployment/frontend -n hrplatform
kubectl rollout history deployment/backend  -n hrplatform

# Step 3: Check pod logs (last 100 lines)
kubectl logs -l app=backend  --tail=100 -n hrplatform
kubectl logs -l app=frontend --tail=100 -n hrplatform

# Step 4: If last deploy caused it — ROLLBACK IMMEDIATELY
kubectl rollout undo deployment/backend  -n hrplatform
kubectl rollout undo deployment/frontend -n hrplatform
kubectl rollout status deployment/backend -n hrplatform

# Step 5: Check nginx is running
kubectl exec -it deploy/nginx -n hrplatform -- nginx -t
kubectl exec -it deploy/nginx -n hrplatform -- nginx -s reload

# Step 6: Verify health endpoint
curl -f https://api.hrplatform.com/health
```

**Resolved when:** `curl https://hrplatform.com` returns 200, login works.

---

## Playbook 2 — High Error Rate (> 5% HTTP 5xx)

**Symptoms:** Sentry spike, Prometheus `http_error_rate > 0.05`

```bash
# Step 1: Find which endpoint is failing
kubectl logs -l app=backend --tail=200 -n hrplatform | grep '"level":"error"'

# Step 2: Check database connectivity
kubectl exec -it deploy/backend -n hrplatform -- \
  node -e "const {Pool}=require('pg'); new Pool({connectionString:process.env.DATABASE_URL}).query('SELECT 1').then(()=>console.log('DB OK')).catch(console.error)"

# Step 3: Check Redis connectivity
kubectl exec -it deploy/backend -n hrplatform -- \
  node -e "require('ioredis').createClient(process.env.REDIS_URL).ping().then(r=>console.log(r))"

# Step 4: Check if recent migration caused it
npm run db:migrate:status

# Step 5: If DB is the problem — increase connection pool timeout temporarily
# Edit k8s ConfigMap: DB_POOL_MAX=30, DB_POOL_IDLE_TIMEOUT=60000
kubectl edit configmap backend-config -n hrplatform
kubectl rollout restart deployment/backend -n hrplatform

# Step 6: If unsolvable within 30 min — rollback
kubectl rollout undo deployment/backend -n hrplatform
```

---

## Playbook 3 — High Latency (P95 > 2s)

**Symptoms:** Prometheus `http_request_duration_p95 > 2000`

```bash
# Step 1: Check slow queries in PostgreSQL
kubectl exec -it postgres-0 -n hrplatform -- psql -U hrplatform -c "
  SELECT pid, now()-pg_stat_activity.query_start AS duration, query
  FROM pg_stat_activity
  WHERE (now()-pg_stat_activity.query_start) > interval '5 seconds'
  AND state = 'active'
  ORDER BY duration DESC;"

# Step 2: Kill blocking long-running query
kubectl exec -it postgres-0 -n hrplatform -- psql -U hrplatform -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE query_start < NOW() - INTERVAL '2 minutes'
  AND state = 'active';"

# Step 3: Check if pods are CPU-throttled
kubectl top pods -n hrplatform

# Step 4: Scale up pods if CPU > 80%
kubectl scale deployment/backend --replicas=4 -n hrplatform

# Step 5: Check Redis cache hit rate
kubectl exec -it redis-0 -n hrplatform -- redis-cli INFO stats | grep keyspace

# Step 6: Verify after scaling
curl -w "@curl-format.txt" -o /dev/null -s https://api.hrplatform.com/api/employees
```

---

## Playbook 4 — Login Broken / Auth Failures Spike

**Symptoms:** Sentry `AuthenticationError` spike, users can't log in

```bash
# Step 1: Test login endpoint directly
curl -X POST https://api.hrplatform.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"healthcheck@hrplatform.com","password":"HealthCheck@1"}' \
  -v 2>&1 | grep -E "HTTP|error|token"

# Step 2: Check JWT secret is set
kubectl get secret backend-secrets -n hrplatform -o jsonpath='{.data.JWT_SECRET}' | base64 -d | wc -c
# Should return non-zero

# Step 3: Check if Redis (sessions) is reachable
kubectl exec -it deploy/backend -n hrplatform -- \
  node -e "require('ioredis').createClient(process.env.REDIS_URL).ping().then(console.log)"

# Step 4: Check token expiry config hasn't changed
kubectl get configmap backend-config -n hrplatform -o yaml | grep TOKEN

# Step 5: If JWT_SECRET was rotated accidentally — restore from secrets manager
# See docs/devops/SECRETS.md → Rotation procedure

# Step 6: Restart backend if config was changed
kubectl rollout restart deployment/backend -n hrplatform
```

---

## Playbook 5 — WebSocket Down (Real-Time Broken)

**Symptoms:** `ConnectionStatusComponent` shows "Disconnected", attendance/notifications not updating

```bash
# Step 1: Test WebSocket endpoint
wscat -c wss://api.hrplatform.com/ws
# Should receive: {"type":"ping"}

# Step 2: Check websocket pod
kubectl get pods -l app=websocket -n hrplatform
kubectl logs -l app=websocket --tail=50 -n hrplatform

# Step 3: Check Nginx WebSocket proxy headers
kubectl exec -it deploy/nginx -n hrplatform -- \
  nginx -T 2>&1 | grep -A5 "location /ws"

# Step 4: Restart websocket pod (non-destructive — clients auto-reconnect)
kubectl rollout restart deployment/websocket -n hrplatform
kubectl rollout status deployment/websocket -n hrplatform
```

Note: `WebSocketService` has built-in exponential backoff reconnect. Clients reconnect automatically within 30 seconds of pod restart.

---

## Playbook 6 — Database Disk Full

**Symptoms:** PostgreSQL writes failing, `ENOSPC` in logs

```bash
# Step 1: Check disk usage
kubectl exec -it postgres-0 -n hrplatform -- df -h /var/lib/postgresql

# Step 2: Check table sizes
kubectl exec -it postgres-0 -n hrplatform -- psql -U hrplatform -c "
  SELECT schemaname, tablename,
         pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
  FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
  LIMIT 10;"

# Step 3: Vacuum and clean up dead tuples
kubectl exec -it postgres-0 -n hrplatform -- psql -U hrplatform -c "VACUUM ANALYZE;"

# Step 4: Emergency — archive old audit logs (> 90 days)
kubectl exec -it postgres-0 -n hrplatform -- psql -U hrplatform -c "
  DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';"

# Step 5: Expand PVC if on Kubernetes
kubectl patch pvc postgres-pvc -n hrplatform \
  -p '{"spec":{"resources":{"requests":{"storage":"100Gi"}}}}'
```

---

## Playbook 7 — Payroll Calculation Wrong

**Symptoms:** Users report incorrect net pay, wrong deductions

```bash
# NEVER auto-fix payroll data — always involve a human
# Step 1: IMMEDIATELY lock the affected payroll period
curl -X POST https://api.hrplatform.com/api/payroll/lock \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"period":"2026-07","reason":"Investigation in progress"}'

# Step 2: Preserve evidence — copy affected records
kubectl exec -it postgres-0 -n hrplatform -- pg_dump \
  --table=payroll_records -n hrplatform > payroll_backup_$(date +%s).sql

# Step 3: Identify the bad calculation
kubectl logs -l app=backend --tail=500 -n hrplatform | grep "payroll"

# Step 4: Notify Product Owner and HR manager immediately (even at night)

# Step 5: Fix root cause in code, test on staging with real data copy
# Step 6: After fix — recalculate affected records manually with HR sign-off
# Step 7: Notify affected employees ONLY after HR confirms corrected amounts
```

---

## Post-Mortem Template

File within 48 hours at `docs/incidents/YYYY-MM-DD-incident-title.md`:

```markdown
# Incident Post-Mortem
**Date:** YYYY-MM-DD
**Severity:** P0/P1
**Duration:** X hours Y minutes
**Author:** [on-call engineer]

## Timeline
- HH:MM — Alert fired
- HH:MM — On-call acknowledged
- HH:MM — Root cause identified
- HH:MM — Mitigation applied
- HH:MM — Service restored

## Root Cause
[What actually caused the incident]

## Impact
- Users affected: ~N
- Features impacted: [list]
- Data loss: Yes / No

## What Went Well
[Actions that helped resolve quickly]

## What Went Wrong
[Gaps in process or tooling]

## Action Items
| Action | Owner | Due date |
|--------|-------|---------|
| | | |
```
