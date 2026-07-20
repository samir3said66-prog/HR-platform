# Performance & Load Testing
## HR Analytics Platform — k6

> **Not covered here:** Frontend Lighthouse scores → `docs/frontend/TESTING.md`
> CI/CD pipeline stages → `docs/backend/CI_CD_PIPELINE.md`

---

## Tool: k6

[k6](https://k6.io/) is a developer-centric load testing tool. Tests are written in JavaScript.

```bash
# Install k6
winget install k6          # Windows
brew install k6            # macOS
sudo apt install k6        # Ubuntu

# Run a test
k6 run tests/load/dashboard.k6.js

# Run with output to InfluxDB (Grafana dashboard)
k6 run --out influxdb=http://localhost:8086/k6 tests/load/dashboard.k6.js
```

---

## Performance Targets

| Endpoint / Action | P95 Response Time | Error Rate | Throughput |
|-------------------|------------------|-----------|-----------|
| `GET /api/dashboard/summary` | < 500ms | < 0.1% | 100 req/s |
| `GET /api/employees?page=1` | < 600ms | < 0.1% | 80 req/s |
| `POST /api/auth/login` | < 800ms | < 0.5% | 20 req/s |
| `GET /api/payroll/summary` | < 700ms | < 0.1% | 30 req/s |
| `POST /api/payroll/run` | < 5000ms | < 1% | 5 req/s |
| `GET /api/analytics/turnover` | < 1500ms | < 0.1% | 20 req/s |
| `GET /api/employees/export` | < 8000ms | < 1% | 5 req/s |
| **Concurrent users (sustained)** | 800 users | < 0.5% overall | — |

---

## Test Scenarios

### Scenario 1 — Baseline Load (100 users)

```javascript
// tests/load/baseline.k6.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 100 },  // ramp up
    { duration: '3m', target: 100 },  // sustain
    { duration: '1m', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<600'],  // 95% under 600ms
    errors: ['rate<0.01'],            // < 1% error rate
  },
};

export default function () {
  const token = getToken();

  const res = http.get('https://staging.hrplatform.com/api/employees', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const ok = check(res, {
    'status 200': (r) => r.status === 200,
    'has data array': (r) => JSON.parse(r.body).data !== undefined,
  });

  errorRate.add(!ok);
  sleep(1);
}
```

---

### Scenario 2 — Peak Load (800 concurrent users)

```javascript
// tests/load/peak.k6.js
export const options = {
  stages: [
    { duration: '2m', target: 200 },
    { duration: '2m', target: 500 },
    { duration: '5m', target: 800 },  // peak: 800 concurrent
    { duration: '2m', target: 800 },  // sustain peak
    { duration: '2m', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.005'],
  },
};
```

---

### Scenario 3 — Stress Test (find breaking point)

```javascript
// tests/load/stress.k6.js
export const options = {
  stages: [
    { duration: '2m', target: 200 },
    { duration: '2m', target: 600 },
    { duration: '2m', target: 1000 },
    { duration: '2m', target: 1400 },
    { duration: '2m', target: 1800 },
    { duration: '2m', target: 0 },
  ],
  // No thresholds — we want to observe degradation
};

export function handleSummary(data) {
  return { 'results/stress-test-summary.json': JSON.stringify(data, null, 2) };
}
```

---

### Scenario 4 — Payroll Run (heavy computation)

```javascript
// tests/load/payroll-run.k6.js
export const options = {
  vus: 5,              // only 5 — payroll is sequential per company
  duration: '2m',
  thresholds: {
    http_req_duration: ['p(95)<5000'],  // 5s max
  },
};

export default function () {
  const res = http.post(
    'https://staging.hrplatform.com/api/payroll/run',
    JSON.stringify({ period: '2026-07', branchId: 'branch-1' }),
    { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
  );
  check(res, { 'payroll ran successfully': (r) => r.status === 200 });
  sleep(5);  // realistic gap between runs
}
```

---

### Scenario 5 — Soak Test (memory leaks)

```javascript
// tests/load/soak.k6.js
// 50 users for 2 hours — detect memory leaks and connection pool exhaustion
export const options = {
  stages: [
    { duration: '5m',  target: 50 },
    { duration: '2h',  target: 50 },  // sustained 2 hours
    { duration: '5m',  target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<700'],
    http_req_failed:   ['rate<0.005'],
  },
};
```

---

## CI Integration

```yaml
# Run load tests weekly on staging (not every PR — too slow)
load-test:
  schedule: cron('0 2 * * 1')   # every Monday 2am
  runs-on: ubuntu-latest
  steps:
    - uses: grafana/k6-action@v0.3.1
      with:
        filename: tests/load/baseline.k6.js
      env:
        K6_CLOUD_TOKEN: ${{ secrets.K6_CLOUD_TOKEN }}
```

---

## Results Interpretation

| Metric | Good | Warning | Critical |
|--------|------|---------|---------|
| P95 response time | < 600ms | 600ms–1s | > 1s |
| P99 response time | < 1.5s | 1.5s–3s | > 3s |
| Error rate | < 0.1% | 0.1–1% | > 1% |
| Throughput drop | < 5% at peak | 5–15% | > 15% |
| CPU usage (server) | < 70% | 70–85% | > 85% |
| Memory usage | < 80% | 80–90% | > 90% |

---

## Frontend Performance (Lighthouse — separate from k6)

Automated via Lighthouse CI on every PR:

```bash
# .github/workflows/ci-cd.yml
- name: Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun
```

```json
// lighthouserc.json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.90}],
        "categories:accessibility": ["error", {"minScore": 0.95}],
        "categories:seo": ["error", {"minScore": 0.90}]
      }
    }
  }
}
```

---

## Load Test Schedule

| Test | Frequency | Environment |
|------|-----------|------------|
| Baseline (100 users) | Every PR merge to main | Staging |
| Peak (800 users) | Weekly (Monday 2am) | Staging |
| Stress (find limit) | Monthly | Staging |
| Soak (2h) | Before major release | Staging |
| Payroll run | Before every payroll feature release | Staging |
