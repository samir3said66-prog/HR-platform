# Monitoring & Observability
## HR Analytics Platform

> **Related:** Incident response → `docs/devops/RUNBOOK.md`
> Security audit logging → `docs/backend/AUDIT_LOGGING_REVIEW.md`

---

## Observability Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Error tracking | Sentry | Frontend + backend exceptions |
| APM | Datadog / New Relic | Request tracing, latency, throughput |
| Logs | Loki + Grafana | Structured log aggregation |
| Metrics | Prometheus + Grafana | CPU, memory, request rates |
| Uptime | UptimeRobot / Pingdom | External availability checks |
| Alerts | PagerDuty / Slack | On-call notifications |
| Synthetic monitoring | Playwright (scheduled) | Simulated user journeys |

---

## Sentry — Error Tracking

### Frontend Setup

```typescript
// src/main.ts
import * as Sentry from '@sentry/angular';

Sentry.init({
  dsn: environment.sentryDsn,
  environment: environment.production ? 'production' : 'staging',
  release: environment.appVersion,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
  ],
  tracesSampleRate: environment.production ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,

  beforeSend(event) {
    // Strip PII before sending
    if (event.user) delete event.user.email;
    return event;
  },
});
```

### Backend Setup

```typescript
// src/main.ts (NestJS / Express)
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
  ],
});
```

### Sentry Alert Rules

| Condition | Action |
|-----------|--------|
| New issue first seen | Notify #alerts-sentry Slack |
| Error rate > 10 errors/min | Page on-call (P1) |
| Unhandled promise rejection | Notify dev lead |
| Auth failures spike | Page on-call immediately (P0) |

---

## Prometheus Metrics

### Key Metrics to Collect

```yaml
# prometheus.yml scrape config
scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: '/metrics'

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
```

### Critical Metrics

| Metric | Alert threshold | Severity |
|--------|----------------|---------|
| `http_request_duration_p95` | > 1000ms | P1 |
| `http_error_rate` | > 1% | P1 |
| `http_error_rate` | > 5% | P0 |
| `backend_pod_cpu_usage` | > 85% | P1 |
| `backend_pod_memory_usage` | > 90% | P1 |
| `postgres_connections_active` | > 80% of max | P1 |
| `redis_memory_used_ratio` | > 85% | P2 |
| `websocket_active_connections` | > 1000 | P2 |

---

## Grafana Dashboards

### Dashboard 1 — Platform Health

Panels:
- Request rate (req/s) — last 1 hour
- P50 / P95 / P99 response times
- HTTP error rate (4xx, 5xx separately)
- Active WebSocket connections
- Active Kubernetes pods per deployment

### Dashboard 2 — Business Metrics (read-only for client)

Panels:
- Daily active users (DAU)
- Payroll runs completed today
- Attendance records created today
- New employees added this week
- API calls per feature module

### Dashboard 3 — Infrastructure

Panels:
- CPU usage per pod
- Memory usage per pod
- PostgreSQL query rate + slow queries
- Redis hit/miss rate
- Disk usage on all nodes

---

## Uptime Monitoring

```
UptimeRobot checks every 60 seconds:

Check 1: GET https://hrplatform.com/          → expects 200
Check 2: GET https://hrplatform.com/manifest.json → expects 200
Check 3: GET https://api.hrplatform.com/health → expects { "status": "ok" }
Check 4: GET https://staging.hrplatform.com/  → expects 200
```

Alert on: 2 consecutive failures → Slack + email

SLA target: 99.5% uptime = max 3.65 hours downtime/month

---

## Structured Logging

### Log Format (JSON)

```json
{
  "timestamp": "2026-07-20T14:23:01.000Z",
  "level": "info",
  "service": "backend",
  "requestId": "req-abc-123",
  "userId": "user-456",
  "method": "POST",
  "path": "/api/payroll/run",
  "statusCode": 200,
  "durationMs": 1420,
  "branch": "Cairo-HQ"
}
```

### Log Levels

| Level | Use |
|-------|-----|
| `error` | Unhandled exceptions, API 5xx |
| `warn` | Validation failures, deprecated usage |
| `info` | Request completed, business events |
| `debug` | Dev only — never in production |

### Log Retention

| Environment | Retention |
|-------------|----------|
| Production | 90 days (Loki) |
| Staging | 14 days |
| Local | Console only |

---

## Health Endpoints

```typescript
// GET /health — public, no auth
{
  "status": "ok",
  "version": "2.0.0",
  "timestamp": "2026-07-20T14:23:01.000Z"
}

// GET /health/detailed — internal only
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "websocket": "connected",
  "uptime": 86400
}
```

---

## Alert Routing

```
P0 (Critical)     → PagerDuty (immediate call) + Slack #incidents
P1 (Major)        → PagerDuty (15min escalation) + Slack #alerts
P2 (Minor)        → Slack #alerts only
P3 (Info)         → Grafana annotation only
```

### Slack Alert Format

```
🔴 [P0] CRITICAL — HR Platform Production
Service: backend
Alert: HTTP error rate > 5% (current: 7.3%)
Started: 2026-07-20 14:23:01 UTC
Dashboard: https://grafana.hrplatform.com/d/overview
Runbook: docs/devops/RUNBOOK.md#high-error-rate
```

---

## Weekly Health Report

Automated report sent to client every Monday:

| Metric | This Week | Last Week | Trend |
|--------|-----------|-----------|-------|
| Uptime | 99.97% | 99.95% | ✅ |
| P95 response time | 420ms | 380ms | ⚠️ |
| Total errors | 12 | 8 | ⚠️ |
| Active users | 284 | 271 | ✅ |
| Payroll runs | 3 | 3 | ✅ |

Sent via: `scripts/weekly-report.sh` → email + Slack
